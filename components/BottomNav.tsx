"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function BottomNav() {
    const pathname = usePathname();

    // Hide on Wordle page
    if (pathname?.startsWith("/wordle")) {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 flex gap-2 border-t-4 border-verse-purple bg-verse-dark px-4 pb-6 pt-3 z-30 shadow-2xl">
            <Link className="flex flex-1 flex-col items-center justify-center gap-1 text-verse-accent group" href="/battleship">
                <div className="w-10 h-8 flex items-center justify-center bg-verse-accent/10 rounded border-2 border-transparent group-hover:border-verse-accent transition-all">
                    <span className="material-symbols-outlined text-2xl">radar</span>
                </div>
                <p className="text-[10px] font-pixel mt-1">RADAR</p>
            </Link>
            <Link className="flex flex-1 flex-col items-center justify-center gap-1 text-verse-light/50 group hover:text-white transition-colors" href="/wordle">
                <div className="w-10 h-8 flex items-center justify-center bg-white/5 rounded border-2 border-transparent group-hover:border-white transition-all">
                    <span className="material-symbols-outlined text-2xl">abc</span>
                </div>
                <p className="text-[10px] font-pixel mt-1">WORDLE</p>
            </Link>
            <Link className="flex flex-1 flex-col items-center justify-center gap-1 text-verse-light/50 group hover:text-white transition-colors" href="/team/register">
                <div className="w-10 h-8 flex items-center justify-center bg-white/5 rounded border-2 border-transparent group-hover:border-white transition-all">
                    <span className="material-symbols-outlined text-2xl">groups</span>
                </div>
                <p className="text-[10px] font-pixel mt-1">PARTY</p>
            </Link>
            <Link className="flex flex-1 flex-col items-center justify-center gap-1 text-verse-light/50 group hover:text-white transition-colors" href="/login">
                <div className="w-10 h-8 flex items-center justify-center bg-white/5 rounded border-2 border-transparent group-hover:border-white transition-all">
                    <span className="material-symbols-outlined text-2xl">account_circle</span>
                </div>
                <p className="text-[10px] font-pixel mt-1">PROFILE</p>
            </Link>
        </nav>
    );
}
