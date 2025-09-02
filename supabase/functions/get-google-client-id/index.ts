
/* Edge Function: get-google-client-id
   Returns the Google Client ID from Supabase secrets.
   Note: We intentionally DO NOT return the client secret to the client. */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");

  if (!clientId) {
    return new Response(JSON.stringify({ error: "GOOGLE_CLIENT_ID not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ clientId }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      // CORS headers are not required when invoked via supabase.functions.invoke,
      // but we include permissive headers for direct calls if needed.
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
});
