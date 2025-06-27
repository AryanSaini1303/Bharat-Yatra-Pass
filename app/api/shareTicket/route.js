import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { BitlyClient } from 'bitly';

const bitly = new BitlyClient(process.env.BITLY_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN,
);
const twilioPhoneNumber = '+19786797423';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');
  const phone = formData.get('phone');
  const user_id = formData.get('user_id');
  // console.log(file, phone);

  if (!file || !phone)
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `ticket-${Date.now()}.png`;

  const { error: uploadError } = await supabase.storage
    .from('ticket-images')
    .upload(`tickets/${filename}`, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('ticket-images')
    .createSignedUrl(`tickets/${filename}`, 3600);
  // console.log(signedUrlData);

  if (signedUrlError || !signedUrlData) {
    return NextResponse.json(
      { error: 'Could not generate image URL' },
      { status: 500 },
    );
  }

  // const response = await bitly.shorten(signedUrlData.signedUrl);
  // const shortUrl = response.link;
  // console.log(shortUrl);

  // try {
  //   await twilioClient.messages.create({
  //     from: twilioPhoneNumber,
  //     to: `+91${phone}`,
  //     body: `View Ticket: ${shortUrl}`,
  //   });
  //   const { error: updateError } = await supabase
  //     .from('tickets')
  //     .update({ticket_sent: true})
  //     .eq('user_id', user_id);
  //   if (updateError) {
  //     return NextResponse.json(
  //       { error: 'Update Error', details: updateError },
  //       { status: 500 },
  //     );
  //   }
  //   return NextResponse.json({ success: true });
  // } catch (err) {
  //   return NextResponse.json(
  //     { error: 'Twilio SMS error', details: err },
  //     { status: 500 },
  //   );
  // }
}
