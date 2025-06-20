import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json(
      { error: 'id parameter is required' },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('ticketNum, status, id, dateTime')
      .match({ service_provider_id: id, service_provider: 'boating' });
    if (error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch boating data' },
        { status: 500 },
      );
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Unexpected error:', err.message);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 },
    );
  }
}
