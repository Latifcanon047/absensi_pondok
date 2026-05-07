import { Suspense } from "react";
import RekapAbsenContent from "@/components/RekapAbsenContent";

export default function RekapAbsenPage() {
  return (
    <Suspense fallback={<div></div>}>
      <RekapAbsenContent />
    </Suspense>
  );
}
