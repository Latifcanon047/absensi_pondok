// page.tsx
import { Suspense } from "react";
import BuatAbsensiForm from "@/components/BuatAbsensiForm";

export default function BuatAbsensiPage() {
  return (
    <Suspense fallback={false}>
      <BuatAbsensiForm />
    </Suspense>
  );
}
