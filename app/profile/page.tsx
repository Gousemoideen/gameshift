import Link from "next/link";

export default function ProfilePlaceholder() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden bg-[linear-gradient(to_bottom,#1a0b2e_0%,#4a1c6e_100%)] px-6">
      {/* Stars Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="star top-[10%] left-[15%] animate-[twinkle_3s_infinite]" style={{ animationDelay: "0s" }}></div>
        <div className="star top-[20%] right-[25%] animate-[twinkle_3s_infinite]" style={{ animationDelay: "1s" }}></div>
        <div className="star top-[5%] right-[10%] animate-[twinkle_3s_infinite]" style={{ animationDelay: "2s" }}></div>
        <div className="star top-[40%] left-[5%] animate-[twinkle_3s_infinite]" style={{ animationDelay: "0.5s" }}></div>
        <div className="star top-[60%] right-[15%] animate-[twinkle_3s_infinite]" style={{ animationDelay: "1.5s" }}></div>
        <div className="star bottom-[20%] left-[20%] animate-[twinkle_3s_infinite]" style={{ animationDelay: "2.5s" }}></div>
      </div>

      {/* 404-style Placeholder Content */}
      <div className="relative z-10 text-center space-y-6">
        <div className="text-8xl md:text-9xl font-retro text-white pixel-text-shadow mb-4">
          404
        </div>
        <div className="text-2xl md:text-3xl text-retro-gold font-retro pixel-text-shadow mb-2">
          PROFILE NOT FOUND
        </div>
        <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-retro-gold to-transparent"></div>
        <p className="text-white/70 font-retro text-lg max-w-md mx-auto mt-6">
          Your profile is still being forged in the arcade clouds. Check back soon!
        </p>
        <Link
          href="/"
          className="inline-block mt-8 px-6 py-3 bg-retro-blue text-white text-sm uppercase tracking-widest pixel-btn hover:bg-retro-blue/90 transition-all border-2 border-white/20"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

