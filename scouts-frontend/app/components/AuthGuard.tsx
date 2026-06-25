"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token && pathname !== "/login") {
      router.push("/login");
      return;
    }

    if (token && pathname === "/login") {
      router.push("/");
      return;
    }

    setIsChecking(false);
  }, [pathname, router]);

  if (isChecking && pathname !== "/login") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Verificando sesión...</p>
      </main>
    );
  }

  return <>{children}</>;
}