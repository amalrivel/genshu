import { notFound } from "next/navigation"
import { PracticePlayer } from "@/components/practice-player"
import { getPublishedPracticeSet } from "@/lib/content-repository"

export const dynamic = "force-dynamic"

export default async function PracticeSetPage({ params }: PageProps<"/practice/[id]">) {
  const { id } = await params
  const practiceSet = await getPublishedPracticeSet(id)
  if (!practiceSet) notFound()
  return <PracticePlayer practiceSet={practiceSet} />
}
