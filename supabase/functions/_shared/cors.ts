/** Shared CORS headers for browser-invoked Edge Functions */

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, baggage, sentry-trace',
};

/** @returns 204-style preflight for SPA clients */
export function corsPreflightResponse(): Response {
  return new Response('ok', { headers: corsHeaders });
}

/**
 * @param body - JSON-serializable payload
 * @param status - HTTP status (defaults to 200)
 */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
