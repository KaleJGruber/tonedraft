import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('drafts')
    .insert({
      title: 'Test Draft',
      content: 'Hello from VoiceDraft!'
    })
    .select();

  return Response.json({ data, error });
}
