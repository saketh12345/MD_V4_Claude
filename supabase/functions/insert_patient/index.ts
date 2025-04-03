
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the user ID for RLS based on the Authorization header
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Get the JSON request body
    const { p_name, p_phone, p_email } = await req.json();

    if (!p_name || !p_phone) {
      return new Response(
        JSON.stringify({ error: 'Name and phone are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Check if a patient with this phone already exists
    const { data: existingPatient } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('phone', p_phone)
      .maybeSingle();

    if (existingPatient) {
      return new Response(
        JSON.stringify({ error: 'A patient with this phone number already exists', id: existingPatient.id }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409,
        }
      );
    }

    // Insert the new patient
    const { data, error } = await supabaseClient
      .from('profiles')
      .insert({
        full_name: p_name,
        phone: p_phone, 
        user_type: 'patient',
        center_name: null
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting patient:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to insert patient' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Return the new patient ID
    return new Response(
      JSON.stringify({ id: data.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in insert_patient:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
