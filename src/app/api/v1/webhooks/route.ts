import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'
import { isPrivateUrl } from '@/lib/webhook'

const RegisterSchema = z.object({
  url: z.string().url(),
})

// GET /v1/webhooks — return current webhook config
export async function GET(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const agent = await prisma.agent.findUnique({ where: { id: agentId }, select: { webhookUrl: true } })
  return NextResponse.json({ webhook_url: agent?.webhookUrl ?? null })
}

// PUT /v1/webhooks — register or update webhook URL
export async function PUT(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  if (isPrivateUrl(parsed.data.url)) {
    return NextResponse.json({ error: 'Private or loopback URLs are not allowed.' }, { status: 400 })
  }

  await prisma.agent.update({ where: { id: agentId }, data: { webhookUrl: parsed.data.url } })
  return NextResponse.json({ webhook_url: parsed.data.url })
}

// DELETE /v1/webhooks — remove webhook
export async function DELETE(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  await prisma.agent.update({ where: { id: agentId }, data: { webhookUrl: null } })
  return new NextResponse(null, { status: 204 })
}
