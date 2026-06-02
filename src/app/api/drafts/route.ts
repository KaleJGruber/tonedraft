import { createServerClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = createServerClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("drafts")
    .insert({
      title: body.title,
      content: body.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return Response.json({ data, error });
}

export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("drafts")
    .select("*")
    .order("created_at", { ascending: false });

  return Response.json({ data, error });
}
