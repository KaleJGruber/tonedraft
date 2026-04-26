import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .order('created_at', { ascending: false });

    return Response.json({ data, error });
}
