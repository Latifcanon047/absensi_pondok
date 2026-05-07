import { Suspense } from "react";
import LeaderboardContent from "@/components/LeaderboardContent";

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div></div>}>
      <LeaderboardContent />
    </Suspense>
  );
}
