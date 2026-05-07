import { Suspense } from "react";
import RekapAbsenContent from "@/components/RekapAbsenContent";

export default function RekapAbsenPage() {
  return (
    <Suspense fallback={null}>
      <RekapAbsenContent />
    </Suspense>
  );
}
