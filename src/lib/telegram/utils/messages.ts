export const MESSAGES = {
  WELCOME: `
🌟 <b>Welcome to Velto Connect!</b>

Join exclusive Telegram groups with premium content and connect with like-minded people.

🔹 Browse available groups
🔹 Subscribe with secure payments
🔹 Get instant access
🔹 Manage your subscriptions

Use the buttons below to get started!
  `,

  GROUP_INFO: `
📊 <b>Group Details</b>

<b>Name:</b> {groupName}
<b>Price:</b> ₹{price}
<b>Duration:</b> {duration} days
<b>Description:</b> {description}

💡 <i>Click "Pay" to subscribe and get instant access to this exclusive group!</i>
  `,

  HELP: `
🆘 <b>Help & Commands</b>

<b>Available Commands:</b>
• /start - Welcome message and main menu
• /join [group_id] - Subscribe to a group
• /status - Check your active subscriptions
• /help - Show this help message
• /cancel - Cancel current operation

<b>How to Join a Group:</b>
1. Get a group link from the creator
2. Click the link or use /join command
3. Review group details and price
4. Complete secure payment via Razorpay
5. Get instant access to the group

<b>Need Support?</b>
Contact us at: support@velto.cloud
  `,

  INVALID_JOIN_FORMAT: `
❌ <b>Invalid format!</b>

Please use: <code>/join [group_id]</code>

Example: <code>/join abc123-def456-ghi789</code>
  `,

  GROUP_NOT_FOUND: `
❌ <b>Group not found!</b>

The group you're trying to join doesn't exist or is no longer available.
  `,

  BOT_NOT_ADMIN: `
⚠️ <b>Setup Required</b>

The bot needs admin permissions in this group. Please contact the group owner to add the bot as an administrator.
  `,

  NO_SUBSCRIPTIONS: `
📭 <b>No Active Subscriptions</b>

You don't have any active subscriptions yet. Use /start to browse available groups!
  `,

  GENERIC_ERROR: `
❌ <b>Something went wrong!</b>

Please try again later or contact support if the problem persists.
  `,

  OPERATION_CANCELLED: `
✅ <b>Operation Cancelled</b>

Your current operation has been cancelled. Use /start to begin again.
  `,

  PAYMENT_INITIATED: `
💳 <b>Payment Initiated</b>

Please complete your payment using the secure Razorpay link below. Your subscription will be activated immediately after successful payment.

⚠️ <i>This payment link expires in 15 minutes.</i>
  `,

  PAYMENT_SUCCESS: `
🎉 <b>Payment Successful!</b>

Your subscription has been activated. You'll receive an invite link to join the group shortly.

Thank you for your purchase!
  `,

  PAYMENT_FAILED: `
❌ <b>Payment Failed</b>

Your payment could not be processed. Please try again or contact support if you continue to face issues.
  `,

  SUBSCRIPTION_EXPIRED: `
⏰ <b>Subscription Expired</b>

Your subscription to "{groupName}" has expired. To continue accessing the group, please renew your subscription.
  `,

  SUBSCRIPTION_EXPIRING_SOON: `
⚠️ <b>Subscription Expiring Soon</b>

Your subscription to "{groupName}" will expire in {days} days. Renew now to avoid losing access.
  `,
};