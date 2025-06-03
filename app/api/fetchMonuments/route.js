import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || false;
  const detailed = searchParams.get('detailed') || false;
  const id = searchParams.get('id') || false;
  const type = searchParams.get('type') || false;
  if (!city && !detailed) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }
  try {
    if (!detailed && city) {
      // Fetch from monuments
      const { data: monuments, error: monumentError } = await supabase
        .from('monuments')
        .select('image_url, name, city, id')
        .ilike('city', `%${city}%`);
      if (monumentError) throw monumentError;
      // Fetch from boating
      const { data: boating, error: boatingError } = await supabase
        .from('boating')
        .select('image_url, name, city, id, boats')
        .ilike('city', `%${city}%`);
      if (boatingError) throw boatingError;
      const combined = [...monuments, ...boating];
      return NextResponse.json(combined, { status: 200 });
    } else {
      const { data: monumentDetail, error: monumentError } = await supabase
        .from(`${type}`)
        .select('*')
        .eq('id', id);
      if (monumentError) throw monumentError;
      return NextResponse.json(monumentDetail, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
