import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // must use service key to bypass RLS
);

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Optional: get Clerk user details
  const userRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
    },
  });

  const user = await userRes.json();

  const { email_addresses, username, first_name, last_name } = user;

  const { error } = await supabase.from("creators").insert({
    id: userId, // use Clerk ID as PK
    email: email_addresses?.[0]?.email_address || "",
    username: username || "",
    name: `${first_name || ""} ${last_name || ""}`.trim(),
  });

  if (error) {
    console.error("Failed to insert creator:", error.message);
    return new Response("Insert error", { status: 500 });
  }

  return new Response("Creator created", { status: 200 });
}
