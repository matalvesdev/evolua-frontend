"use client"

import React from "react"

interface SecureErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface SecureErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class SecureErrorBoundary extends React.Component<
  SecureErrorBoundaryProps,
  SecureErrorBoundaryState
> {
  constructor(props: SecureErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): SecureErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("SecureErrorBoundary caught an error:", error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    const isProduction = process.env.NODE_ENV === "production"

    return (
      <div className="flex items-center justify-center w-full min-h-[300px] p-4">
        <div
          className="w-full max-w-md rounded-2xl border border-white/60 p-6 shadow-2xl backdrop-blur-xl"
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
                error_outline
              </span>
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-800">
              {isProduction ? "Erro" : "Erro capturado"}
            </h2>

            {/* Message */}
            <p className="text-sm text-gray-600">
              Ocorreu um erro inesperado. Tente novamente.
            </p>

            {/* Dev-only stack trace */}
            {!isProduction && this.state.error && (
              <div className="w-full mt-2">
                <p className="text-left text-xs font-semibold text-gray-700 mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre
                    className="w-full max-h-48 overflow-auto rounded-xl p-3 text-left text-xs leading-relaxed"
                    style={{
                      background: "rgba(138, 5, 190, 0.05)",
                      fontFamily: "monospace",
                      color: "#4a4a4a",
                    }}
                  >
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            {/* Retry button */}
            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-2 w-full rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#8A05BE" }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }
}
