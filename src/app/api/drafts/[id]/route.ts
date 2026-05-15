import { supabaseServer } from "@/utils/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabaseServer
    .from("drafts")
    .select("*")
    .eq("id", params.id)
    .single();

  return Response.json({ data, error });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const { data, error } = await supabaseServer
    .from("drafts")
    .update({
      title: body.title,
      content: body.content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select()
    .single();

  return Response.json({ data, error });
}
