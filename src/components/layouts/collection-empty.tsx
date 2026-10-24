import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";

export function CollectionEmpty({ title, description }: { title: string; description: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <h2 className="text-base font-semibold">{title}</h2>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
