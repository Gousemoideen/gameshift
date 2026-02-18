"use client";

import { usePathname } from "next/navigation";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isWordle = pathname?.startsWith("/wordle");

    return (
        <div className={`min-h-screen flex flex-col ${isWordle ? "pb-0" : "pb-28"}`}>
            {children}
        </div>
    );
}
