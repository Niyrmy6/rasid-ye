/**
 * Maps technical errors (Supabase, network, Edge Functions) to user-facing Arabic copy.
 * UI strings stay in Arabic; this module documents the matching rules in English.
 */

export type ErrorCategory =
  | 'network'
  | 'auth'
  | 'database'
  | 'validation'
  | 'server'
  | 'unknown';

export interface TranslatedError {
  /** User-facing message (Arabic) */
  message: string;
  category: ErrorCategory;
  /** Whether the UI should offer a retry action */
  retryable: boolean;
  /** Triggers logout + redirect when JWT/session is invalid */
  requiresLogout: boolean;
}

/** Partial string match against `extractErrorString` output */
const ERROR_MAP: Record<string, TranslatedError> = {
  // Network
  'Failed to fetch': {
    message: 'لا يوجد اتصال بالإنترنت. تحقق من الشبكة وحاول مجدداً.',
    category: 'network',
    retryable: true,
    requiresLogout: false,
  },
  'NetworkError': {
    message: 'حدث خطأ في الاتصال بالشبكة. حاول مرة أخرى.',
    category: 'network',
    retryable: true,
    requiresLogout: false,
  },
  'net::ERR_INTERNET_DISCONNECTED': {
    message: 'أنت غير متصل بالإنترنت.',
    category: 'network',
    retryable: true,
    requiresLogout: false,
  },
  'timeout': {
    message: 'استغرق الطلب وقتاً طويلاً. حاول مرة أخرى.',
    category: 'network',
    retryable: true,
    requiresLogout: false,
  },
  'AbortError': {
    message: 'تم إلغاء الطلب. حاول مرة أخرى.',
    category: 'network',
    retryable: true,
    requiresLogout: false,
  },

  // Auth
  'JWT expired': {
    message: 'انتهت جلستك. يرجى تسجيل الدخول مجدداً.',
    category: 'auth',
    retryable: false,
    requiresLogout: true,
  },
  'invalid claim: missing sub claim': {
    message: 'جلسة غير صالحة. يرجى تسجيل الدخول مرة أخرى.',
    category: 'auth',
    retryable: false,
    requiresLogout: true,
  },
  'Invalid login credentials': {
    message: 'رقم الهاتف أو كلمة المرور غير صحيحة.',
    category: 'auth',
    retryable: false,
    requiresLogout: false,
  },
  'User not found': {
    message: 'لم يتم العثور على حساب بهذه البيانات.',
    category: 'auth',
    retryable: false,
    requiresLogout: false,
  },
  'Email not confirmed': {
    message: 'لم يتم تأكيد البريد الإلكتروني بعد.',
    category: 'auth',
    retryable: false,
    requiresLogout: false,
  },

  // Database / RLS
  'duplicate key value': {
    message: 'هذا الرقم أو البيانات مسجلة مسبقاً. يمكنك تسجيل الدخول أو استخدام بيانات أخرى.',
    category: 'database',
    retryable: false,
    requiresLogout: false,
  },
  'violates unique constraint': {
    message: 'هذه البيانات موجودة بالفعل في النظام.',
    category: 'database',
    retryable: false,
    requiresLogout: false,
  },
  'violates foreign key constraint': {
    message: 'لا يمكن إتمام العملية لارتباط البيانات ببيانات أخرى.',
    category: 'database',
    retryable: false,
    requiresLogout: false,
  },
  'violates not-null constraint': {
    message: 'يرجى التأكد من تعبئة جميع الحقول المطلوبة.',
    category: 'validation',
    retryable: false,
    requiresLogout: false,
  },
  'violates check constraint': {
    message: 'القيمة المُدخلة غير مقبولة. تحقق من البيانات.',
    category: 'validation',
    retryable: false,
    requiresLogout: false,
  },
  'new row violates row-level security': {
    message: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
    category: 'auth',
    retryable: false,
    requiresLogout: false,
  },
  'permission denied': {
    message: 'ليس لديك صلاحية للوصول إلى هذا المحتوى.',
    category: 'auth',
    retryable: false,
    requiresLogout: false,
  },

  // Server / HTTP
  'Internal Server Error': {
    message: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.',
    category: 'server',
    retryable: true,
    requiresLogout: false,
  },
  '500': {
    message: 'خطأ داخلي في الخادم. سيتم إصلاحه قريباً.',
    category: 'server',
    retryable: true,
    requiresLogout: false,
  },
  '502': {
    message: 'الخادم غير متاح مؤقتاً. حاول بعد قليل.',
    category: 'server',
    retryable: true,
    requiresLogout: false,
  },
  '503': {
    message: 'الخدمة متوقفة مؤقتاً للصيانة. حاول بعد دقائق.',
    category: 'server',
    retryable: true,
    requiresLogout: false,
  },
  '429': {
    message: 'عدد الطلبات كثير جداً. انتظر قليلاً ثم حاول مجدداً.',
    category: 'server',
    retryable: true,
    requiresLogout: false,
  },

  // Edge Functions
  'FunctionsFetchError': {
    message: 'تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً.',
    category: 'network',
    retryable: true,
    requiresLogout: false,
  },
  'FunctionsRelayError': {
    message: 'حدث خطأ أثناء معالجة الطلب. حاول مرة أخرى.',
    category: 'server',
    retryable: true,
    requiresLogout: false,
  },
  'FunctionsHttpError': {
    message: 'حدث خطأ في الخدمة. حاول لاحقاً.',
    category: 'server',
    retryable: true,
    requiresLogout: false,
  },

  // Storage
  'Bucket not found': {
    message: 'خطأ في نظام الملفات. يرجى التواصل مع الدعم الفني.',
    category: 'server',
    retryable: false,
    requiresLogout: false,
  },
  'The resource already exists': {
    message: 'هذا الملف موجود مسبقاً.',
    category: 'database',
    retryable: false,
    requiresLogout: false,
  },
  'Payload too large': {
    message: 'حجم الملف كبير جداً. الحد الأقصى المسموح به هو 5MB.',
    category: 'validation',
    retryable: false,
    requiresLogout: false,
  },
};

const DEFAULT_ERROR: TranslatedError = {
  message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  category: 'unknown',
  retryable: true,
  requiresLogout: false,
};

/**
 * @param error - Supabase error object, `Error`, or string
 * @returns Friendly Arabic message plus metadata for retry/logout handling
 */
export function translateError(error: unknown): TranslatedError {
  const errorString = extractErrorString(error);

  for (const [key, translatedError] of Object.entries(ERROR_MAP)) {
    if (errorString.includes(key)) {
      return translatedError;
    }
  }

  return DEFAULT_ERROR;
}

/** Flattens Supabase/PostgREST shapes into a single searchable string */
function extractErrorString(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    // Supabase errors
    if (typeof e.message === 'string') return e.message;
    if (typeof e.error_description === 'string') return e.error_description;
    if (typeof e.msg === 'string') return e.msg;
    if (typeof e.code === 'string') return e.code;
    if (typeof e.statusText === 'string') return e.statusText;
    return JSON.stringify(error);
  }
  return String(error);
}
