"use client";

import { useRouter } from "next/navigation";
import BaseButton from "@/components/BaseButton";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md rounded-lg border border-gray-700 bg-gray-800 p-8 text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-2xl">Page Not Found</h2>
        <p className="mb-6 text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <BaseButton onClick={() => router.back()}>Go Back</BaseButton>
          <Link href="/">
            <BaseButton type="icon" className="w-full sm:w-auto">
              Dashboard
            </BaseButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
