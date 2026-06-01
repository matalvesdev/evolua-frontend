export interface TocItem {
  id: string
  text: string
  level: number
}

export function extractTocItems(markdown: string): TocItem[] {
  const items: TocItem[] = []
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    items.push({ id, text, level })
  }

  return items
}
