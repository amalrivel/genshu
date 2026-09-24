import { PracticeCatalog } from "@/components/practice-catalog"
import { listPublishedPracticeSets } from "@/lib/content-repository"

export const dynamic = "force-dynamic"

export default async function PracticePage() {
  const sets = await listPublishedPracticeSets()
  return <PracticeCatalog sets={sets} />
}
