/**
 * Rasidna health assistant: Groq LLM + optional Serper web search.
 * No Supabase data access — privacy boundary is enforced in the system prompt.
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { Langfuse } from 'npm:langfuse';
import { corsPreflightResponse, jsonResponse } from '../_shared/cors.ts';

const SYSTEM_PROMPT = `You are "Rasidna Assistant" (مساعد رصدنا), an intelligent public health and epidemiology assistant for the "Rasidna" (رصدنا) community health monitoring system.

CRITICAL RULES:
1. PUBLIC HEALTH EXPERTISE: You are an expert in public health, epidemiology, disease prevention, and health awareness. Provide accurate, evidence-based information using data from WHO, CDC, and other official health organizations.
2. MEDICAL DISCLAIMER (MANDATORY): You MUST end EVERY response with a clear disclaimer in the language of the user's question, warning the user to consult a doctor or health professional because AI-provided information may be inaccurate or incomplete.
3. LANGUAGE ENFORCEMENT (STRICT): You MUST respond in the EXACT same language as requested.
   - If the request language is 'ar' (Arabic) or the user's text is in Arabic, you MUST write the entire response in ARABIC.
   - If the request language is 'en' (English) or the user's text is in English, you MUST write the entire response in ENGLISH.
   Do not mix languages.
4. WEB SEARCH: When web search results are provided below, use them to give current and up-to-date answers. Cite sources when relevant.
5. PRIVACY: You have NO access to the system's database. If asked about specific reports, user data, or internal system data, politely explain that this data is private and protected.
6. CONCISENESS: Keep answers clear, structured, and without repetition.`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  let langfuse: Langfuse | null = null;

  try {
    console.log('=== Starting chat-rag-bot function');

    const lfPublic = Deno.env.get('LANGFUSE_PUBLIC_KEY');
    const lfSecret = Deno.env.get('LANGFUSE_SECRET_KEY');
    if (lfPublic && lfSecret) {
      try {
        langfuse = new Langfuse({
          publicKey: lfPublic,
          secretKey: lfSecret,
          baseUrl: 'https://cloud.langfuse.com',
          flushAt: 1,
        });
      } catch (err) {
        console.error('Langfuse init failed:', err);
      }
    }

    const { userQuestion, lang = 'ar' } = await req.json();
    console.log('Request body parsed:', { userQuestion, lang });

    const trace = langfuse?.trace({
      name: 'chat_general_query',
      input: userQuestion,
      metadata: { source: 'Rasidna App' },
    });

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    const serperApiKey = Deno.env.get('SERPER_API_KEY');

    console.log('Env keys check:', { hasGroq: !!groqApiKey, hasSerper: !!serperApiKey });

    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not set in Edge Function Secrets');
    }

    let searchContext = '';
    if (serperApiKey) {
      try {
        console.log('Calling Serper search...');
        const searchResponse = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: userQuestion,
            hl: (lang && lang.startsWith('ar')) ? 'ar' : 'en',
            gl: 'ye',
            num: 5,
          }),
        });
        console.log('Serper response status:', searchResponse.status);
        const searchData = await searchResponse.json();
        console.log('Serper data:', JSON.stringify(searchData, null, 2));
        if (searchData.organic?.length > 0) {
          searchContext =
            '\n--- Real-time Web Search Results (use these to enrich your answer with up-to-date information) ---\n';
          searchData.organic.slice(0, 4).forEach((result: { title: string; snippet: string; link: string }, index: number) => {
            searchContext += `[${index + 1}] ${result.title}\n${result.snippet}\nSource: ${result.link}\n\n`;
          });
          searchContext += '--- End of Search Results ---\n';
        }
      } catch (e) {
        console.error('Serper search failed:', e);
      }
    }

    console.log('Final searchContext:', searchContext);

    const userPromptMessage = `Target Language for your response: ${(lang && lang.startsWith('ar')) ? 'ARABIC (العربية)' : 'ENGLISH'}
User question: ${userQuestion}

${searchContext}`;
    console.log('User prompt built');

    const payload = {
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPromptMessage },
      ],
      temperature: 0.3,
      max_tokens: 700,
    };
    console.log('Groq payload ready');

    const generation = trace?.generation({
      name: 'groq_chat_completion',
      model: payload.model,
      modelParameters: { temperature: payload.temperature },
      prompt: payload.messages,
    });
    console.log('Calling Groq API...');
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    console.log('Groq response status:', groqRes.status);
    const groqData = await groqRes.json();
    console.log('Groq data:', JSON.stringify(groqData, null, 2));

    if (!groqRes.ok || groqData.error) {
      console.error('Groq API Error Details:', groqData.error || groqData);
      const groqErrorMsg = groqData.error?.message || `Groq Error status ${groqRes.status}`;
      return jsonResponse({ reply: `خطأ من Groq API: ${groqErrorMsg}` });
    }

    const botReply =
      groqData.choices?.[0]?.message?.content ?? 'عذراً، لم أتمكن من العثور على إجابة محددة الآن.';
    console.log('Final botReply:', botReply);

    generation?.end({ completion: botReply });
    trace?.update({ output: botReply });
    if (langfuse) {
      await langfuse.flushAsync();
    }
    console.log('=== Returning response');

    return jsonResponse({ reply: botReply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('=== Error in chat-rag-bot:', error);
    if (langfuse) {
      langfuse.trace({ name: 'chat_bot_error', level: 'ERROR', statusMessage: message });
      await langfuse.flushAsync();
    }
    return jsonResponse({ error: message }, 500);
  }
});
