"use client"

import { useState, useCallback } from "react"

export function QuickNotes() {
  const [title, setTitle] = useState("Anotação")
  const [content, setContent] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  const handleTitleBlur = useCallback(() => {
    setIsEditingTitle(false)
    if (!title.trim()) setTitle("Anotação")
  }, [title])

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Anotações Rápidas</h3>
        <button
          onClick={() => setIsEditingTitle(true)}
          className="text-gray-400 hover:text-[#8A05BE] transition-colors"
          aria-label="Editar título da anotação"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
        </button>
      </div>

      <div className="glass-panel p-5 rounded-2xl flex-1 border border-gray-200 flex flex-col relative group">
        <span className="material-symbols-outlined absolute top-4 right-4 text-gray-300 rotate-45">
          push_pin
        </span>

        {isEditingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
            className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 bg-transparent border-none p-0 focus:ring-0 focus:outline-none"
          />
        ) : (
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
            {title}
          </h4>
        )}

        <p className="text-sm text-gray-600 leading-relaxed grow">
          {content || ""}
        </p>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Clique para digitar..."
            className="w-full bg-transparent text-sm border-none p-0 focus:ring-0 placeholder-gray-400 text-gray-800"
            type="text"
          />
        </div>
      </div>
    </div>
  )
}
