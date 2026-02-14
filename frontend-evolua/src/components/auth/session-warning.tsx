"use client"

import { useSessionManager } from "@/hooks/use-session-manager"

function formatTime(totalSeconds: number): string {
  const minutes = Math.max(0, Math.floor(totalSeconds / 60))
  const seconds = Math.max(0, totalSeconds % 60)
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function SessionWarning() {
  const { showWarning, timeRemaining, extendSession } = useSessionManager()

  if (!showWarning) return null

  const formattedTime = formatTime(timeRemaining)

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div
        className="relative z-10 mx-4 w-full max-w-sm rounded-2xl border border-white/60 p-6 shadow-2xl backdrop-blur-xl"
        style={{ background: "rgba(255, 255, 255, 0.85)" }}
      >
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icon */}
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "rgba(138, 5, 190, 0.1)" }}
          >
            <span
              className="material-symbols-outlined text-3xl"
              style={{ color: "#8A05BE" }}
            >
              timer
            </span>
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-800">
            Sessão expirando
          </h2>

          {/* Message */}
          <p className="text-sm text-gray-600">
            Sua sessão será encerrada em{" "}
            <span className="font-mono font-semibold" style={{ color: "#8A05BE" }}>
              {formattedTime}
            </span>{" "}
            por inatividade.
          </p>

          {/* Button */}
          <button
            type="button"
            onClick={extendSession}
            className="mt-2 w-full rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#8A05BE" }}
          >
            Continuar sessão
          </button>
        </div>
      </div>
    </div>
  )
}
