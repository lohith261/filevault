import { logger } from '@/lib/logger'

/**
 * Fire-and-forget alert for failures that should be visible to a human, not
 * just a line in Vercel's function logs. Indexing failures used to go
 * exactly nowhere -- logger.error() writes to console, which on Vercel
 * means "buried in function logs unless someone goes looking" -- which is
 * how indexing stayed 100% broken for months without anyone noticing.
 *
 * Set ALERT_WEBHOOK_URL to a Slack incoming-webhook URL (or anything that
 * accepts a POST with a `text` field -- Discord, PagerDuty's Events API,
 * etc. may need a thin adapter) to get a real notification. Without it,
 * this still logs structurally via `logger.error` so at least the
 * information isn't lost, matching prior behavior.
 */
export async function alert(message: string, fields?: Record<string, unknown>): Promise<void> {
  logger.error(message, fields)

  const url = process.env.ALERT_WEBHOOK_URL
  if (!url) return

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 FileVault: ${message}${fields ? `\n\`\`\`${JSON.stringify(fields, null, 2)}\`\`\`` : ''}`,
      }),
    })
  } catch {
    // Alerting must never throw into the caller's error path -- if the
    // webhook itself is down, the structured log above is the fallback.
  }
}
