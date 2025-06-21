import { supabase } from '@/lib/supabaseClient';

export async function POST(req) {
  const { vendorId, updatedBoats } = await req.json();

  const { error } = await supabase
    .from('boating')
    .update({ boats: updatedBoats })
    .eq('id', vendorId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
