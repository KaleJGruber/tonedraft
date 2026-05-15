import { supabaseServer } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();

  const { data, error } = await supabaseServer
    .from("drafts")
    .insert({
      title: body.title,
      content: body.content,
    })
    .select();

  return Response.json({ data: data?.[0], error });
}

export async function GET() {
  const { data, error } = await supabaseServer
    .from("drafts")
    .select("*")
    .order("created_at", { ascending: false });

  return Response.json({ data, error });
}
