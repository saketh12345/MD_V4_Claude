
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { lab_name } = await req.json();

    if (!lab_name) {
      return new Response(
        JSON.stringify({ error: "Lab name is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Try to find the lab first
    const { data: existingLab, error: findError } = await supabaseClient
      .from('labs')
      .select('id')
      .eq('name', lab_name)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      console.error("Error finding lab:", findError);
      throw findError;
    }

    // If lab exists, return it
    if (existingLab) {
      return new Response(
        JSON.stringify(existingLab),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If lab doesn't exist, create it
    const { data: newLab, error: createError } = await supabaseClient
      .from('labs')
      .insert({
        name: lab_name,
      })
      .select('id')
      .single();

    if (createError) {
      console.error("Error creating lab:", createError);
      throw createError;
    }

    return new Response(
      JSON.stringify(newLab),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
