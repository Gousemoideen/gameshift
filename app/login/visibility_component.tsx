"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordProps {
    value: string;
    onChange: (val: string) => void;
  }

export default function Password({value,onChange}: PasswordProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-purple-300 ml-1 font-display">
        Secret Key
      </label>

      <div className="relative">
        <input
          type={isVisible ? "text" : "password"}
          value={value}                    
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="pixel-input w-full h-14 px-5 text-white placeholder:text-purple-300/30 font-medium tracking-wider"
        />

        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-200"
        >
         {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}
