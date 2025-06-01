import { headers } from "next/headers";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const payload = await req.text();
  const heads = await headers();

  const svix = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let evt: any;

  try {
    evt = svix.verify(payload, {
      "svix-id": heads.get("svix-id")!,
      "svix-timestamp": heads.get("svix-timestamp")!,
      "svix-signature": heads.get("svix-signature")!,
    });
  } catch (err) {
    return new Response("Webhook verification failed", { status: 400 });
  }

  const { id, email_addresses, username, first_name, last_name } = evt.data;

  const { error } = await supabase.from("creators").insert({
    id,
    email: email_addresses?.[0]?.email_address ?? "",
    username: username ?? "",
    name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
  });

  if (error) {
    console.error("Supabase insert error", error);
    return new Response("DB insert failed", { status: 500 });
  }

  return new Response("Webhook handled", { status: 200 });
}
