const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
  title?: string;
  username?: string;
  invite_link?: string;
}

// Send a message to a user or group
export async function sendMessage(
  chatId: number | string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();
    if (!data.ok) console.error("Telegram error:", data.description);
    return data.ok;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return false;
  }
}

// Get bot info (to retrieve bot user ID, etc.)
export async function getBotInfo(): Promise<TelegramUser | null> {
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/getMe`);
    const data = await response.json();
    return data.ok ? data.result : null;
  } catch (error) {
    console.error("Failed to get bot info:", error);
    return null;
  }
}

// Check if bot is admin in a specific group
export async function isBotAdmin(
  chatId: number | string,
  botId: number
): Promise<boolean> {
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/getChatMember`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, user_id: botId }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("getChatMember failed:", data.description);
      return false;
    }

    const status = data.result.status;
    return status === "administrator" || status === "creator";
  } catch (error) {
    console.error("Error checking bot admin status:", error);
    return false;
  }
}

// Get chat info (only works for public groups)
export async function getChatInfo(
  chatIdOrUsername: number | string
): Promise<TelegramChat | null> {
  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/getChat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatIdOrUsername }),
    });

    const data = await res.json();
    return data.ok ? data.result : null;
  } catch (error) {
    console.error("Failed to get chat info:", error);
    return null;
  }
}

// Parse a t.me/ link to get the chat identifier
export function extractChatIdentifier(inviteLink: string): string | null {
  try {
    if (inviteLink.includes("t.me/")) {
      const parts = inviteLink.split("t.me/");
      if (parts.length > 1) {
        return `@${parts[1].replace("/", "")}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Invalid Telegram invite link:", error);
    return null;
  }
}
