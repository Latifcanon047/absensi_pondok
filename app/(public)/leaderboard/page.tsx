import { Suspense } from "react";
import LeaderboardContent from "@/components/LeaderboardContent";

export default function LeaderboardPage() {
  return (
    <Suspense fallback={null}>
      <LeaderboardContent />
    </Suspense>
  );
}
