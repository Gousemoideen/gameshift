"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { VALID_WORDS } from "./validWords";

// ───────────────────────────────────────────────
// Config
// ───────────────────────────────────────────────
const TARGET_WORD = "GLITCH";
const WORD_LENGTH = TARGET_WORD.length; // 6
const MAX_GUESSES = 6;

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

// ───────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────
type CellStatus = "correct" | "present" | "absent" | "active" | "empty";
type GameStatus = "playing" | "won" | "lost";

interface EvaluatedGuess {
  word: string;
  statuses: CellStatus[];
}

// ───────────────────────────────────────────────
// Color-swap Wordle Logic
//   TWIST: Yellow (#FFD700) = correct position
//          Green  (#50FA7B) = wrong position
// ───────────────────────────────────────────────
function evaluateGuess(guess: string): CellStatus[] {
  const result: CellStatus[] = new Array(WORD_LENGTH).fill("absent");
  const targetArr = TARGET_WORD.split("");
  const guessArr = guess.split("");
  const used = new Array(WORD_LENGTH).fill(false);

  // Pass 1 — exact matches → "correct" (rendered as YELLOW)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = "correct";
      used[i] = true;
      guessArr[i] = "_"; // mark consumed
    }
  }

  // Pass 2 — wrong-position matches → "present" (rendered as GREEN)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === "_") continue;
    const idx = targetArr.findIndex((c, j) => c === guessArr[i] && !used[j]);
    if (idx !== -1) {
      result[i] = "present";
      used[idx] = true;
    }
  }

  return result;
}

// ───────────────────────────────────────────────
// Styling helpers
// ───────────────────────────────────────────────
function cellClasses(status: CellStatus): string {
  const base =
    "aspect-square flex items-center justify-center font-pixel text-base sm:text-xl select-none transition-all duration-200";
  const inset =
    "shadow-[inset_-4px_-4px_0px_2px_rgba(0,0,0,0.3),inset_4px_4px_0px_2px_rgba(255,255,255,0.2)]";

  switch (status) {
    case "correct":
      return `${base} ${inset} bg-[#FFD700] text-black border-2 border-black`;
    case "present":
      return `${base} ${inset} bg-[#50FA7B] text-black border-2 border-black`;
    case "absent":
      return `${base} ${inset} bg-[#2A1B4E] text-white/40 border-2 border-white/10`;
    case "active":
      return `${base} ${inset} bg-[#FF007F] text-white border-2 border-white animate-pulse`;
    case "empty":
      return `${base} ${inset} bg-black/40 border-2 border-white/5`;
    default:
      return `${base} ${inset} bg-black/40 border-2 border-white/5`;
  }
}

/** Cells that are typed but not yet submitted (current row, no letter yet) */
function pendingCellClasses(): string {
  const base =
    "aspect-square flex items-center justify-center font-pixel text-base sm:text-xl select-none";
  return `${base} bg-[#483475] border-2 border-white/30 shadow-[inset_-4px_-4px_0px_2px_rgba(0,0,0,0.3),inset_4px_4px_0px_2px_rgba(255,255,255,0.2)]`;
}

function keyBgClass(status: CellStatus | undefined): string {
  switch (status) {
    case "correct":
      return "bg-[#FFD700] text-black border-black/50";
    case "present":
      return "bg-[#50FA7B] text-black border-black/50";
    case "absent":
      return "bg-[#374151] text-white/30 border-black/50";
    default:
      return "bg-[#7D4CDB] text-white border-black/50";
  }
}

// ───────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────
export default function WordlePage() {
  // Game state
  const [guesses, setGuesses] = useState<EvaluatedGuess[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [keyStatuses, setKeyStatuses] = useState<Record<string, CellStatus>>(
    {}
  );

  // Timer
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Alert
  const [alert, setAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Timer tick ──
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (gameStatus === "playing") {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 250);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, gameStatus]);

  // Stop timer on win/loss
  useEffect(() => {
    if (gameStatus !== "playing" && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [gameStatus]);

  const formatTime = (s: number) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ── Alert helper ──
  const showAlert = useCallback((title: string, message: string) => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlert({ title, message });
    alertTimeoutRef.current = setTimeout(() => setAlert(null), 2500);
  }, []);

  // ── Update keyboard statuses after a guess ──
  const updateKeyStatuses = useCallback(
    (word: string, statuses: CellStatus[]) => {
      setKeyStatuses((prev) => {
        const next = { ...prev };
        const priority: CellStatus[] = [
          "correct",
          "present",
          "absent",
          "empty",
        ];
        for (let i = 0; i < word.length; i++) {
          const letter = word[i];
          const newStatus = statuses[i];
          const oldStatus = next[letter];
          if (
            !oldStatus ||
            priority.indexOf(newStatus) < priority.indexOf(oldStatus)
          ) {
            next[letter] = newStatus;
          }
        }
        return next;
      });
    },
    []
  );

  // ── Core input handler ──
  const handleKey = useCallback(
    (key: string) => {
      if (gameStatus !== "playing") return;

      if (key === "BACK" || key === "BACKSPACE") {
        setCurrentGuess((g) => g.slice(0, -1));
        return;
      }

      if (key === "ENTER") {
        if (currentGuess.length !== WORD_LENGTH) {
          showAlert("System Error", "Not enough letters");
          return;
        }

        if (!VALID_WORDS.has(currentGuess)) {
          showAlert("System Error", "Unknown Command");
          return;
        }

        const statuses = evaluateGuess(currentGuess);
        const newGuess: EvaluatedGuess = { word: currentGuess, statuses };

        setGuesses((prev) => [...prev, newGuess]);
        updateKeyStatuses(currentGuess, statuses);

        if (currentGuess === TARGET_WORD) {
          setGameStatus("won");
          showAlert("Decrypted!", "Malfunction Resolved");
          // Socket.io hook: emit WORDLE_SOLVED
          // socket?.emit("WORDLE_SOLVED", { roomId, teamId, timeTaken: elapsed });
        } else if (guesses.length + 1 >= MAX_GUESSES) {
          setGameStatus("lost");
          showAlert("System Failure", `Word was ${TARGET_WORD}`);
        }

        setCurrentGuess("");
        return;
      }

      // Regular letter
      if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((g) => g + key);
      }
    },
    [
      gameStatus,
      currentGuess,
      guesses.length,
      elapsed,
      showAlert,
      updateKeyStatuses,
    ]
  );

  // ── Physical keyboard ──
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toUpperCase();
      if (k === "ENTER") handleKey("ENTER");
      else if (k === "BACKSPACE") handleKey("BACK");
      else if (/^[A-Z]$/.test(k)) handleKey(k);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  // ── Build grid data ──
  const gridRows: { letter: string; status: CellStatus }[][] = [];

  // Submitted rows
  for (const g of guesses) {
    gridRows.push(
      g.word.split("").map((letter, i) => ({ letter, status: g.statuses[i] }))
    );
  }

  // Current row
  if (guesses.length < MAX_GUESSES && gameStatus === "playing") {
    const row: { letter: string; status: CellStatus }[] = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (i < currentGuess.length) {
        row.push({ letter: currentGuess[i], status: "active" });
      } else {
        row.push({ letter: "", status: "empty" });
      }
    }
    gridRows.push(row);
  }

  // Future empty rows
  while (gridRows.length < MAX_GUESSES) {
    gridRows.push(
      Array.from({ length: WORD_LENGTH }, () => ({ letter: "", status: "empty" as CellStatus }))
    );
  }

  // ── Render ──
  return (
    <div className="bg-pixel-stars text-white overflow-hidden flex flex-col font-pixel min-h-screen">
      {/* Floating Icons */}
      <div
        className="fixed top-20 left-4 opacity-40 pointer-events-none animate-float z-0 hidden sm:block"
      >
        <span
          className="material-symbols-outlined text-6xl text-pixel-light"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          vpn_key
        </span>
      </div>
      <div
        className="fixed bottom-40 right-4 opacity-40 pointer-events-none animate-float z-0 hidden sm:block"
        style={{ animationDelay: "1.5s" }}
      >
        <span
          className="material-symbols-outlined text-6xl text-pixel-light"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          toys
        </span>
      </div>

      {/* ── Header ── */}
      <div className="relative z-50 flex-none bg-[rgba(42,27,78,0.9)] border-b-4 border-black pb-2">
        {/* Dynamic Status Banner */}
        {(() => {
          const count = guesses.length;
          let statusText = "SYSTEM NORMAL";
          let statusColor = "#50FA7B"; // Green
          let textColor = "text-black";
          let statusIcon = "check_circle";
          let animate = "";

          if (gameStatus === "lost") {
            statusText = "SYSTEM MALFUNCTION";
            textColor = "text-white";
            statusColor = "#FF007F";
            statusIcon = "error";
            animate = "animate-pulse";
          } else if (gameStatus === "won") {
            statusText = "SYSTEM RESTORED";
            statusColor = "#50FA7B";
            statusIcon = "check_circle";
          } else if (count >= 5) {
            statusText = "SYSTEM CRITICAL";
            statusColor = "#FF007F"; // Pink
            textColor = "text-white";
            statusIcon = "report";
            animate = "animate-pulse";
          } else if (count >= 3) {
            statusText = "SYSTEM BUG DETECTED";
            statusColor = "#FFD700"; // Yellow
            statusIcon = "warning";
          }

          return (
            <div
              style={{ backgroundColor: statusColor }}
              className={`${textColor} font-pixel text-center py-3 text-[10px] sm:text-xs tracking-widest uppercase flex items-center justify-center gap-3 overflow-hidden transition-colors duration-500`}
            >
              <span className={`material-symbols-outlined text-sm ${animate}`}>
                {statusIcon}
              </span>
              <span className={count >= 3 ? "glitch-text" : ""}>{statusText}</span>
              <span className={`material-symbols-outlined text-sm ${animate}`}>
                {statusIcon}
              </span>
            </div>
          );
        })()}

        {/* Title row */}
        <div className="flex items-center px-4 pt-4 justify-between relative">
          {/* Menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white flex size-12 items-center justify-center bg-[#7D4CDB] border-2 border-white/20 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] cursor-pointer active:shadow-none active:translate-x-[2px] active:translate-y-[2px] z-50 relative"
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>

          {/* Hamburger Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute top-16 left-4 z-[10000] flex flex-col gap-2 p-2 bg-[#2A1B4E] border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200 origin-top-left">
              <Link href="/battleship" className="flex items-center gap-3 bg-[#483475] border-2 border-[#FF007F] p-3 hover:bg-[#5b4290] transition-colors w-40">
                <span className="material-symbols-outlined text-[#FFD700]">radar</span>
                <span className="font-pixel text-[10px] text-white uppercase">RADAR</span>
              </Link>
              <Link href="/team/register" className="flex items-center gap-3 bg-[#483475] border-2 border-[#50FA7B] p-3 hover:bg-[#5b4290] transition-colors w-40">
                <span className="material-symbols-outlined text-[#FFD700]">groups</span>
                <span className="font-pixel text-[10px] text-white uppercase">PARTY</span>
              </Link>
              <Link href="/login" className="flex items-center gap-3 bg-[#483475] border-2 border-[#00FFFF] p-3 hover:bg-[#5b4290] transition-colors w-40">
                <span className="material-symbols-outlined text-[#FFD700]">account_circle</span>
                <span className="font-pixel text-[10px] text-white uppercase">PROFILE</span>
              </Link>
            </div>
          )}

          {/* Center title */}
          <div className="flex flex-col items-center">
            <h1 className="text-white text-lg sm:text-2xl leading-none text-center drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
              GAME<span className="text-[#FF007F]">SHIFT</span>
            </h1>
            <span className="text-[8px] sm:text-[10px] text-[#E0B0FF] tracking-widest uppercase mt-2 bg-black/40 px-2 py-1 rounded">
              Wordle Finale
            </span>
          </div>

          {/* Finalist badge */}
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2 bg-[#FFD700] text-black border-2 border-white/20 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] px-3 py-2 text-[8px] sm:text-[10px] uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">stars</span>
              <span>Finalist</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Game Area ── */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start py-2 relative w-full max-w-md mx-auto px-4 z-10">
        {/* Stats row */}
        <div className="w-full flex gap-4 mb-2">
          {/* Rank */}
          <div className="flex flex-1 flex-col items-center justify-center bg-[#483475] border-2 border-[#FF007F] shadow-[6px_6px_0px_rgba(0,0,0,0.4)] p-2 relative overflow-hidden">
            <div className="absolute top-[2px] left-[2px] right-[2px] h-1 bg-white/20"></div>
            <span className="text-[8px] text-[#E0B0FF] uppercase mb-1 font-sans font-bold tracking-wider">
              Rank
            </span>
            <span className="text-xl font-pixel text-white drop-shadow-md">
              #02
            </span>
          </div>
          {/* Timer */}
          <div className="flex flex-1 flex-col items-center justify-center bg-[#483475] border-2 border-[#FFD700] shadow-[6px_6px_0px_rgba(0,0,0,0.4)] p-2 relative overflow-hidden">
            <div className="absolute top-[2px] left-[2px] right-[2px] h-1 bg-white/20"></div>
            <span className="text-[8px] text-[#E0B0FF] uppercase mb-1 font-sans font-bold tracking-wider">
              Time
            </span>
            <span className="text-3xl font-retro text-[#FFD700] tracking-widest tabular-nums">
              {formatTime(elapsed)}
            </span>
          </div>
        </div>

        {/* ── Grid ── */}
        <div
          className="grid gap-[4px] w-full max-w-[340px] p-2 bg-black/30 rounded-xl border-4 border-[rgba(125,76,219,0.5)]"
          style={{
            gridTemplateColumns: `repeat(${WORD_LENGTH}, 1fr)`,
          }}
        >
          {gridRows.map((row, ri) =>
            row.map((cell, ci) => {
              // Current row: unfilled cells get pending style
              const isCurrentRow =
                ri === guesses.length && gameStatus === "playing";
              const isPending = isCurrentRow && cell.status === "empty";

              return (
                <div
                  key={`${ri}-${ci}`}
                  className={isPending ? pendingCellClasses() : cellClasses(cell.status)}
                >
                  {cell.letter}
                </div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="mt-2 flex items-center justify-center gap-6 py-2 px-4 bg-black/40 border-2 border-[rgba(125,76,219,0.3)] rounded shadow-lg relative">
          <div className="absolute inset-0 bg-white/[0.002] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] rounded pointer-events-none"></div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-3 h-3 bg-[#FFD700] border border-white/50"></div>
            <span className="text-[8px] font-pixel text-white uppercase">
              Correct
            </span>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-3 h-3 bg-[#50FA7B] border border-white/50"></div>
            <span className="text-[8px] font-pixel text-white uppercase">
              Wrong Pos
            </span>
          </div>
        </div>
      </div>

      {/* ── Keyboard ── */}
      <div className="flex-none w-full bg-[#2A1B4E] border-t-4 border-black pt-4 pb-2 px-1 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
        <div className="w-full max-w-lg mx-auto flex flex-col gap-2 mb-2">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div
              key={ri}
              className={`flex w-full gap-1 justify-center ${ri === 1 ? "px-3" : "px-1"
                }`}
            >
              {row.map((key) => {
                // Special keys
                if (key === "ENTER") {
                  return (
                    <button
                      key={key}
                      onClick={() => handleKey("ENTER")}
                      className="h-12 px-3 rounded bg-[#FF007F] border-b-4 border-r-2 border-black/50 text-white font-pixel text-[8px] uppercase active:border-b-0 active:translate-y-1 transition-all"
                    >
                      ENTER
                    </button>
                  );
                }
                if (key === "BACK") {
                  return (
                    <button
                      key={key}
                      onClick={() => handleKey("BACK")}
                      className="h-12 px-3 rounded bg-[#483475] border-b-4 border-r-2 border-black/50 text-white font-bold flex items-center justify-center active:border-b-0 active:translate-y-1 transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">
                        backspace
                      </span>
                    </button>
                  );
                }

                // Regular key
                const status = keyStatuses[key];
                const isAbsent = status === "absent";

                return (
                  <button
                    key={key}
                    onClick={() => !isAbsent && handleKey(key)}
                    disabled={isAbsent}
                    className={`h-12 flex-1 rounded border-b-4 border-r-2 font-pixel text-[10px] transition-all ${keyBgClass(
                      status
                    )} ${isAbsent
                      ? "cursor-not-allowed"
                      : "active:border-b-0 active:translate-y-1"
                      }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Floating Alert ── */}
      {alert && (
        <div className="fixed top-36 left-1/2 -translate-x-1/2 w-max max-w-[90%] z-50 animate-float">
          <div className="bg-black text-[#FF007F] border-4 border-[#FF007F] px-4 py-4 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex items-center gap-3 relative">
            {/* Corner dots */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-white"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white"></div>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white"></div>
            <span className="material-symbols-outlined text-2xl animate-pulse text-[#FF007F]">
              dangerous
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-pixel text-white uppercase mb-1">
                {alert.title}
              </span>
              <span className="text-xs font-pixel text-[#FF007F] uppercase">
                {alert.message}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
