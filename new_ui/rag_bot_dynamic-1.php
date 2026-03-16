<?php
/**
 * Dynamic RAG Bot for HealthyCommunityMonitoring
 * Features:
 * 1. Database Schema Exploration (Allows Bot to see ALL tables)
 * 2. Dynamic Table Querying
 * 3. Groq Integration for RAG
 */

// --- 1. Environment & Config ---
function loadEnv($path) {
    if (!file_exists($path)) return false;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0 || strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        putenv(trim($name) . "=" . trim($value));
    }
}
loadEnv(__DIR__ . '/.env');

$groq_api_key = getenv('GROQ_API_KEY'); 
$supabase_url = rtrim(getenv('SUPABASE_URL'), '/');
$supabase_key = getenv('SUPABASE_SERVICE_KEY'); 

if (!$groq_api_key || !$supabase_url || !$supabase_key) {
    die("❌ Error: Missing configuration in .env (GROQ_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY)");
}

// --- 2. Helper Functions for Supabase ---
function supabaseRequest($url, $key, $endpoint, $method = 'GET') {
    $ch = curl_init($url . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $key",
        "Authorization: Bearer $key",
        "Content-Type: application/json"
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// Function to get the full database structure (Crucial for RAG)
function getFullSchema($url, $key) {
    $ch = curl_init($url . "/rest/v1/");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["apikey: $key", "Authorization: Bearer $key"]);
    $response = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($response, true);
    return $data['definitions'] ?? [];
}

// --- 3. Main Logic ---

// Get User Input (e.g., from a form or URL)
$user_question = $_GET['q'] ?? "ما هي الجداول المتاحة في قاعدة البيانات وماذا تفعل؟";


// Define keywords that trigger specific table fetches
$smart_map = [
    'disease' => ['مرض', 'أمراض', 'كوليرا', 'حمى', 'مرضي'],
    'symptom' => ['عرض', 'أعراض', 'سعال', 'إسهال', 'صداع'],
    'disease_symptom' => ['ربط', 'علاقة', 'أعراض المرض', 'مرتبط'],
    'report' => ['بلاغ', 'تقرير', 'مريض', 'حالة', 'بلاغات'],
    'governorate' => ['محافظة', 'مكان', 'منطقة', 'جغرافي'],
    'report_classification' => ['تصنيف', 'نوع الحالة'],
    'report_history' => ['تحديث', 'حالة البلاغ', 'تاريخ'],
    'user' => ['مستخدم', 'مسؤول', 'موظف']
];


// Step A: Fetch Schema so the bot knows what tables exist (including report_classification, symptom_report, etc.)
$schema = getFullSchema($supabase_url, $supabase_key);
$schema_context = "Database Schema (Tables & Columns):\n" . json_encode($schema, JSON_UNESCAPED_UNICODE);

// Step B: (Optional) If the question mentions a specific table, fetch some data from it
// Step B: Smart Context Fetching
$context_data = "";
$tables_to_fetch = [];

// 1. Check if table name is explicitly mentioned
foreach (array_keys($schema) as $tableName) {
    if (stripos($user_question, $tableName) !== false) {
        $tables_to_fetch[] = $tableName;
    }
}

// 2. Check for smart keywords
foreach ($smart_map as $table => $keywords) {
    foreach ($keywords as $kw) {
        if (stripos($user_question, $kw) !== false) {
            $tables_to_fetch[] = $table;
            break; 
        }
    }
}

// foreach (array_keys($schema) as $tableName) {
//     if (stripos($user_question, $tableName) !== false) {
//         $data = supabaseRequest($supabase_url, $supabase_key, "/rest/v1/$tableName?limit=5");
//         $context_data .= "\nSample Data from $tableName:\n" . json_encode($data, JSON_UNESCAPED_UNICODE);
//     }
// }


// Special logic: If "أعراض" and "مرض" are mentioned together, always fetch disease_symptom
if (stripos($user_question, 'أعراض') !== false && (stripos($user_question, 'مرض') !== false || stripos($user_question, 'كوليرا') !== false)) {
    $tables_to_fetch[] = 'disease';
    $tables_to_fetch[] = 'symptom';
    $tables_to_fetch[] = 'disease_symptom';
}

$tables_to_fetch = array_unique($tables_to_fetch);

foreach ($tables_to_fetch as $tableName) {
    if (isset($schema[$tableName])) {
        $data = supabaseRequest($supabase_url, $supabase_key, "/rest/v1/$tableName?limit=20");
        $context_data .= "\nActual Data from $tableName:\n" . json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}

// --- 4. Groq Integration ---
$groq_url = "https://api.groq.com/openai/v1/chat/completions";
$payload = [
    "model" => "llama-3.1-8b-instant", 
    "messages" => [
        [
            "role" => "system",
            "content" => "أنت خبير في تحليل البيانات الصحية لمشروع HealthyCommunityMonitoring. 
            يجب أن تكون دقيقاً جداً في التمييز بين الجداول:
            1. جدول 'report_classification' يحتوي على التصنيفات الطبية (مثل: suspected, confirmed, deceased).
            2. جدول 'report_history' يحتوي على حالة معالجة البلاغ (مثل: new, pending, resolved).
            3. جدول 'report' هو الجدول الرئيسي الذي يحتوي على بيانات المرضى.
            عند الإجابة، اذكر اسم الجدول الذي استخرجت منه المعلومة. إذا لم تجد المعلومة في البيانات المرسلة، أخبر المستخدم بذلك ولا تخمن."
        ],
        [
            "role" => "user",
            "content" => "هيكل قاعدة البيانات:\n$schema_context\n\nبيانات إضافية:\n$context_data\n\nالسؤال: $user_question"
        ]
    ],
    "temperature" => 0.1
];

$ch_groq = curl_init($groq_url);
curl_setopt($ch_groq, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $groq_api_key,
    'Content-Type: application/json'
]);
curl_setopt($ch_groq, CURLOPT_POST, true);
curl_setopt($ch_groq, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch_groq, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch_groq);
$result = json_decode($response, true);
curl_close($ch_groq);

// --- 5. Output ---
header('Content-Type: text/html; charset=utf-8');
echo "<h2>🤖 HealthyCommunityMonitoring AI Assistant</h2>";
echo "<b>السؤال:</b> " . htmlspecialchars($user_question) . "<br><br>";
if (isset($result['choices'][0]['message']['content'])) {
    echo "<b>الإجابة:</b><br>";
    echo nl2br(htmlspecialchars($result['choices'][0]['message']['content']));
} else {
    echo "❌ فشل الحصول على رد من Groq.";
}
?>
