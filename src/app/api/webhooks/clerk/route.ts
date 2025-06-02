import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ClerkWebhookEvent } from "@/types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const evt = (await verifyWebhook(req)) as ClerkWebhookEvent;
    const { type, data } = evt;

    console.log(`Processing webhook: ${type}`);

    switch (type) {
      case "user.created":
        await handleUserCreated(data);
        break;

      case "user.updated":
        await handleUserUpdated(data);
        break;

      case "user.deleted":
        await handleUserDeleted(data);
        break;

      default:
        console.log(`Unhandled webhook type: ${type}`);
        return new Response("Webhook type not handled", { status: 200 });
    }

    return new Response("Webhook handled successfully", { status: 200 });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response("Webhook processing failed", { status: 400 });
  }
}

async function handleUserCreated(data: any) {
  const { id, email_addresses, username, first_name, last_name } = data;

  try {
    // Use upsert to handle potential duplicates gracefully
    const { error } = await supabase.from("creators").upsert(
      {
        clerk_id: id,
        email: email_addresses?.[0]?.email_address ?? "",
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        username: username ?? null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "clerk_id", // Use clerk_id as conflict resolution
      }
    );

    if (error) {
      console.error("Error creating user:", error);
      throw error;
    }

    console.log(`User created successfully: ${id}`);
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error;
  }
}

async function handleUserUpdated(data: any) {
  const { id, email_addresses, username, first_name, last_name } = data;

  try {
    const { error } = await supabase
      .from("creators")
      .update({
        email: email_addresses?.[0]?.email_address ?? "",
        name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        username: username ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("clerk_id", id);

    if (error) {
      console.error("Error updating user:", error);
      throw error;
    }

    console.log(`User updated successfully: ${id}`);
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
}

async function handleUserDeleted(data: any) {
  const { id } = data;

  try {
    // Start a transaction to handle cascading deletes properly
    const { error: deleteError } = await supabase
      .from("creators")
      .delete()
      .eq("clerk_id", id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      throw deleteError;
    }

    console.log(`User deleted successfully: ${id}`);

    // Optional: Log deletion for audit purposes
    // const { error } = await supabase
    //   .from("audit_logs") // Create this table if you want audit trail
    //   .insert({
    //     action: "user_deleted",
    //     clerk_id: id,
    //     timestamp: new Date().toISOString(),
    //   });
    // console.log("Audit log failed:", error); // Don't fail webhook if audit fails
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error;
  }
}
