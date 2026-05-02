import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ slug: string }> }

export default async function SlugPage({ params }: Props) {
  const { slug } = await params

  const site = await prisma.site.findUnique({
    where: { slug },
    select: { entryFile: true, expiresAt: true },
  })

  if (!site) notFound()

  if (site.expiresAt && site.expiresAt < new Date()) {
    redirect('/link-expired')
  }

  redirect(`/s/${slug}/${site.entryFile}`)
}
