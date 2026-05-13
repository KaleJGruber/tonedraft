import { supabase } from '@/utils/supabase/client';

export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('drafts')
    .insert({
      title: body.title,
      content: body.content
    })
    .select();

  return Response.json({ data: data?.[0], error });
}

export async function GET() {
  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .order('created_at', { ascending: false });

  return Response.json({ data, error });
}
