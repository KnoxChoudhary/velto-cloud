import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ClerkWebhookEvent } from "@/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const evt = (await verifyWebhook(req)) as ClerkWebhookEvent;

    const { id, email_addresses, username, first_name, last_name } = evt.data;

    const { error } = await supabase.from("creators").insert({
      clerk_id: id,
      email: email_addresses?.[0]?.email_address ?? "",
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      username: username ?? null,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response("DB insert failed", { status: 500 });
    }

    return new Response("Webhook handled", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook or inserting data:", err);
    return new Response("Webhook error", { status: 400 });
  }
}
