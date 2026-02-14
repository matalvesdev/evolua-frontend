import { z } from "zod"

/**
 * Removes all HTML tags and <script> content from a string.
 * Returns empty string for non-string inputs.
 */
export function stripHtml(input: unknown): string {
  if (typeof input !== "string") return ""

  // Remove <script> tags and their content first
  let result = input.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")

  // Remove all remaining HTML tags
  result = result.replace(/<[^>]*>/g, "")

  return result
}

/**
 * Escapes HTML special characters: <, >, &, ", '
 * Returns empty string for non-string inputs.
 */
export function escapeHtml(input: unknown): string {
  if (typeof input !== "string") return ""

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

/**
 * Zod wrapper that applies stripHtml sanitization before validation.
 * Returns a z.string() schema with a transform that strips HTML.
 */
export function sanitizedString() {
  return z.string().transform((val) => stripHtml(val))
}
