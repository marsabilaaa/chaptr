'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const TABS = [
  {
    label: 'Full document',
    heading: null,
    content: null,
  },
  {
    label: 'Ch. 1 — The Beginning',
    heading: 'Chapter 1 — The Beginning',
    content:
      'The morning Elara left the village, the sky was the color of an old bruise — purple and yellow at the edges, darkening toward the center. She carried nothing but a satchel and the address of a man she\'d never met.',
  },
  {
    label: 'Ch. 2 — The Storm',
    heading: 'Chapter 2 — The Storm',
    content:
      'By the third day the roads had turned to mud. The wagon Elara had paid three silver coins to ride had long since abandoned her at the fork outside Morrow\'s Pass. She walked into the storm alone.',
  },
  {
    label: 'Ch. 3 — Aftermath',
    heading: 'Chapter 3 — Aftermath',
    content:
      'She found the house exactly where the letter said it would be — at the end of a lane so overgrown it barely qualified as a path. A light burned in the upper window. Someone was expecting her.',
  },
]

export default function ChapterDemo() {
  const [active, setActive] = useState(0)

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 px-px overflow-x-auto">
        {TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              'h-[30px] px-3.5 rounded-t-md border border-b-0 border-border/50 text-[12px] whitespace-nowrap transition-colors shrink-0',
              active === i
                ? 'bg-background text-foreground font-medium'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div className="border border-border/50 rounded-b-lg rounded-tr-lg bg-background p-6 min-h-[160px]">
        {active === 0 ? (
          <div className="space-y-2">
            <p className="text-[13px] text-muted-foreground mb-4">
              Viewing all chapters at once. Click any tab to focus.
            </p>
            {[40, 90, 75, 85, 35, 80, 65].map((w, i) => (
              <div
                key={i}
                className={cn(
                  'h-[7px] rounded-sm bg-border/60',
                  i === 0 || i === 4 ? 'h-[9px] bg-border' : '',
                  i > 4 ? 'opacity-50' : ''
                )}
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        ) : (
          <div>
            <p className="text-[18px] font-medium text-foreground mb-3">
              {TABS[active].heading}
            </p>
            <p className="text-[14px] leading-[1.75] text-muted-foreground">
              {TABS[active].content}
              <span className="inline-block w-0.5 h-[14px] bg-foreground align-middle ml-0.5 animate-pulse" />
            </p>
          </div>
        )}
      </div>
    </div>
  )
}