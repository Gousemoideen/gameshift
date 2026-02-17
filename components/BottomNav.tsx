import Link from "next/link";

export default function BottomNav() {
    return (
        <footer className="w-full flex justify-center mt-auto pt-6 pb-6">
            <div className="w-[360px] bg-[#1a0b2e]/95 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 relative shadow-2xl">

                {/* Play Button - Floating in center */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)] border-4 border-[#1a0b2e] hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                    </button>
                </div>

                <div className="flex justify-between items-end px-2">
                    {/* Left Side */}
                    <Link href="/" className="flex flex-col items-center gap-1 group w-12">
                        <span className="material-symbols-outlined text-retro-gold text-[26px] group-hover:text-retro-gold/80 transition-colors" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>home</span>
                        <span className="text-[9px] uppercase text-retro-gold font-sans tracking-widest leading-none">Base</span>
                    </Link>

                    <Link href="/quests" className="flex flex-col items-center gap-1 group mr-8 w-12">
                        <span className="material-symbols-outlined text-gray-500 text-[26px] group-hover:text-white transition-colors" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>sports_esports</span>
                        <span className="text-[9px] uppercase text-gray-500 font-sans tracking-widest leading-none group-hover:text-white transition-colors">Quests</span>
                    </Link>

                    {/* Right Side */}
                    <Link href="/rank" className="flex flex-col items-center gap-1 group ml-8 w-12">
                        <span className="material-symbols-outlined text-gray-500 text-[26px] group-hover:text-white transition-colors" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>bar_chart</span>
                        <span className="text-[9px] uppercase text-gray-500 font-sans tracking-widest leading-none group-hover:text-white transition-colors">Rank</span>
                    </Link>

                    <Link href="/hero" className="flex flex-col items-center gap-1 group w-12">
                        <span className="material-symbols-outlined text-gray-500 text-[26px] group-hover:text-white transition-colors" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>account_circle</span>
                        <span className="text-[9px] uppercase text-gray-500 font-sans tracking-widest leading-none group-hover:text-white transition-colors">Hero</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
