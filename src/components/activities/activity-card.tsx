// src/components/activities/activity-card.tsx

import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  ActivitySummary,
} from "@/lib/activities/types";

export function ActivityCard({
  activity,
}: {
  activity: ActivitySummary;
}) {
  return (
    <Link
      href={`/activities/${activity.id}`}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle>
            {activity.title}
          </CardTitle>

          <CardDescription>
            {activity.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p>Type: {activity.type}</p>

          <p>
            Questions:{" "}
            {activity.questionCount}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}