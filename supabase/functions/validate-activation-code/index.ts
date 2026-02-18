import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claims?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = claims.claims.sub;
  const { code } = await req.json();

  if (!code) {
    return new Response(JSON.stringify({ error: "Kode tidak boleh kosong" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Check code exists and available
  const { data: codeData, error: codeError } = await supabase
    .from("activation_codes")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .eq("status", "available")
    .single();

  if (codeError || !codeData) {
    return new Response(
      JSON.stringify({ error: "Kode tidak valid atau sudah digunakan" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Use service role for update
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Mark code as used
  await supabaseAdmin
    .from("activation_codes")
    .update({ status: "used", used_by: userId, used_at: new Date().toISOString() })
    .eq("id", codeData.id);

  // Upgrade user to premium
  await supabaseAdmin
    .from("profiles")
    .update({ premium_status: "premium", premium_activated_at: new Date().toISOString() })
    .eq("id", userId);

  return new Response(JSON.stringify({ success: true, message: "Selamat! Akun Anda telah diupgrade ke Premium 🎉" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
