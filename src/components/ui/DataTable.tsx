import { cn } from '@/utils/cn'

export interface DataTableProps {
  head: string[]
  rows: React.ReactNode[][]
  /** Minimum table width before the horizontal scrollbar kicks in. */
  minWidth?: number
  className?: string
}

/**
 * Shared data table for documentation and endpoint pages. Cells are ReactNode
 * so callers control emphasis (mono names, colored codes); the component owns
 * structure: bordered shell, uppercase header row, row dividers, and
 * horizontal scrolling on narrow screens.
 */
export function DataTable({ head, rows, minWidth = 560, className }: DataTableProps) {
  return (
    <div className={cn('w-full max-w-full overflow-x-auto rounded-xl border border-line bg-paper-raised', className)}>
      <table className="w-full text-left" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-line-muted">
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="whitespace-nowrap px-4 py-3 font-body text-[11px] font-bold uppercase tracking-wideCaps text-ink-soft"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line-muted last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top font-body text-[13px] text-ink-soft">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
