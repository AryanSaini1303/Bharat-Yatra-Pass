import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  try {
    const { data: monuments, error: monumentError } = await supabase
      .from('monuments')
      .select('image_url, city, name, id')
      .ilike('name', `%${name}%`);
    if (monumentError) throw monumentError;
    const { data: boating, error: boatingError } = await supabase
      .from('boating')
      .select('image_url, city, name, id, boats')
      .ilike('name', `%${name}%`);
    if (boatingError) throw boatingError;
    const { data: theatres, error: theatresError } = await supabase
      .from('theatres')
      .select('image_url, city, name, id')
      .ilike('name', `%${name}%`);
    if (theatresError) throw theatresError;
    const combined = [...monuments, ...boating, ...theatres];
    return NextResponse.json(combined, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
