import { Suspense } from "react";
import RekapPiketContent from "@/components/RekapPiketContent";

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div></div>}>
      <RekapPiketContent />
    </Suspense>
  );
}
