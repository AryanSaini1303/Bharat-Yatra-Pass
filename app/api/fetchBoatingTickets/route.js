import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || false;
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select("ticketNum, dateTime")
      .match({ service_provider: type, status: 'active' });
    if (error) {
      throw error;
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}
