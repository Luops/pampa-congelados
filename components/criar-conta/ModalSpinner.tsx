// components/ModalSpinner.tsx
"use client";

import { Loader2 } from "lucide-react";

export default function ModalSpinner({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md text-center flex flex-col items-center gap-4 max-w-sm">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
        <p className="text-gray-800 font-medium">{message || "Aguarde..."}</p>
      </div>
    </div>
  );
}
