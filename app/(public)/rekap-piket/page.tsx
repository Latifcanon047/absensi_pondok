import { Suspense } from "react";
import RekapPiketContent from "@/components/RekapPiketContent";

export default function RekapPiketPage() {
  return (
    <Suspense fallback={null}>
      <RekapPiketContent />
    </Suspense>
  );
}
