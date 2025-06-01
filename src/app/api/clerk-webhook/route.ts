import { headers } from "next/headers";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";
import { ClerkWebhookEvent } from "@/types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Clerk webhook event types

export async function POST(req: Request) {
  const payload = await req.text();
  const heads = await headers();

  const svix = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let evt: ClerkWebhookEvent;

  try {
    evt = svix.verify(payload, {
      "svix-id": heads.get("svix-id")!,
      "svix-timestamp": heads.get("svix-timestamp")!,
      "svix-signature": heads.get("svix-signature")!,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Webhook verification error", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  const { id, email_addresses, username, first_name, last_name } = evt.data;

  const { error } = await supabase.from("creators").insert({
    clerk_id: id, // Store Clerk's user ID in clerk_id field
    email: email_addresses?.[0]?.email_address ?? "",
    name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
    username: username, // Store username if available
    // Note: username is not in your table schema, so removing it
  });

  if (error) {
    console.error("Supabase insert error", error);
    return new Response("DB insert failed", { status: 500 });
  }

  return new Response("Webhook handled", { status: 200 });
}
