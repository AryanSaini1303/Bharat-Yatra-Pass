import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select("ticketNum, dateTime")
      .match({ service_provider: 'boating', status: 'active' });
    if (error) {
      throw error;
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 200 });
  }
}
