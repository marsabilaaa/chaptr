"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { type Chapter } from "@/lib/editor/extractChapters";

interface ChapterBarProps {
  chapters: Chapter[];
  activeChapterId: string | null;
  onSelect: (id: string | null) => void;
}

export default function ChapterBar({
  chapters,
  activeChapterId,
  onSelect,
}: ChapterBarProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const buttons = useMemo(
    () => [
      { id: null, title: "Full Document" },
      ...chapters.map((chapter) => ({ id: chapter.id, title: chapter.title })),
    ],
    [chapters],
  );

  const updateScrollState = () => {
    const list = listRef.current;
    if (!list) return;
    setCanScrollLeft(list.scrollLeft > 0);
    setCanScrollRight(list.scrollWidth > list.clientWidth + list.scrollLeft + 1);
  };

  useEffect(() => {
    updateScrollState();
    const list = listRef.current;
    if (!list) return;
    list.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      list.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [chapters]);

  const scrollTabsBy = (distance: number) => {
    listRef.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  const handleSelect = (id: string | null) => {
    onSelect(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeTitle = buttons.find(b => b.id === activeChapterId)?.title ?? "Full Document";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border/50">
      {collapsed ? (
        // Collapsed
        <div className="flex items-center justify-between px-4 h-9">
          <span className="text-[12px] text-muted-foreground">
            <span className="text-foreground font-medium">{activeTitle}</span>
            {chapters.length > 0 && (
              <span className="ml-2 text-muted-foreground/60">
                · {chapters.length} chapter{chapters.length > 1 ? "s" : ""}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent/50 transition-colors text-muted-foreground"
            aria-label="Expand chapter bar"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        // Expanded
        <div className="relative flex items-end">
          {/* Scroll left */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollTabsBy(-240)}
              className="absolute left-0 bottom-0 z-10 h-[30px] w-8 flex items-center justify-center bg-background border-r border-border/40 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Tabs */}
          <div
            ref={listRef}
            className="flex items-end gap-0.5 overflow-x-auto scrollbar-none pt-2"
            style={{
              paddingLeft: canScrollLeft ? "2rem" : "0.5rem",
              paddingRight: canScrollRight ? "4rem" : "2.5rem",
            }}
          >
            {buttons.map((button) => {
              const isActive = button.id === activeChapterId;
              return (
                <button
                  key={button.id ?? "full-document"}
                  type="button"
                  onClick={() => handleSelect(button.id)}
                  className={`
                    h-[30px] px-3.5 rounded-t-md border border-b-0 text-[12px] whitespace-nowrap transition-colors shrink-0
                    ${isActive
                      ? "bg-background text-foreground font-medium border-border/50"
                      : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/70 hover:text-foreground"
                    }
                  `}
                >
                  {button.title}
                </button>
              );
            })}
          </div>

          {/* Scroll right */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollTabsBy(240)}
              className="absolute right-8 bottom-0 z-10 h-[30px] w-8 flex items-center justify-center bg-background border-l border-border/40 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Collapse */}
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="absolute right-0 bottom-0 h-[30px] w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border-l border-border/40"
            aria-label="Collapse chapter bar"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}