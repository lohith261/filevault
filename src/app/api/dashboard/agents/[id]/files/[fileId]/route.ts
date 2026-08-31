import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveUserAgent } from '@/lib/auth/dashboardAgent'
import { storageDriver } from '@/lib/storage'
import { fireWebhook } from '@/lib/webhook'
import { runIndexingJob, streamToBuffer } from '@/lib/indexing'
import { after } from 'next/server'

type Params = { params: Promise<{ id: string; fileId: string }> }

// DELETE /api/dashboard/agents/[id]/files/[fileId]
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, fileId } = await params
  const agent = await resolveUserAgent(id)
  if (!agent) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const file = await prisma.agentFile.findFirst({ where: { id: fileId, agentId: id } })
  if (!file) return NextResponse.json({ error: 'File not found.' }, { status: 404 })

  const storagePrefix = file.storageKey.split('/').slice(0, -1).join('/')
  await storageDriver.deletePrefix(storagePrefix)
  await prisma.agentFile.delete({ where: { id: fileId } })

  fireWebhook(id, { event: 'file.deleted', data: { file_id: fileId } })
  return new NextResponse(null, { status: 204 })
}

// POST /api/dashboard/agents/[id]/files/[fileId]?action=index
export async function POST(req: NextRequest, { params }: Params) {
  const { id, fileId } = await params
  const agent = await resolveUserAgent(id)
  if (!agent) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const file = await prisma.agentFile.findFirst({ where: { id: fileId, agentId: id } })
  if (!file) return NextResponse.json({ error: 'File not found.' }, { status: 404 })

  const stream = await storageDriver.getFileStream(file.storageKey)
  const buffer = await streamToBuffer(stream)

  await prisma.agentFile.update({ where: { id: fileId }, data: { indexStatus: 'pending' } })
  after(async () => { await runIndexingJob(id, fileId, buffer, file.mimeType, file.name) })

  return NextResponse.json({ status: 'indexing' })
}
