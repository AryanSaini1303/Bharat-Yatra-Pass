import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required' },
      { status: 400 },
    );
  }
  
  try {
    const { data, error } = await supabase
      .from('boating')
      .select('*')
      .eq('email', email);
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
