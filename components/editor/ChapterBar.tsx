"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    setCanScrollRight(
      list.scrollWidth > list.clientWidth + list.scrollLeft + 1,
    );
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

  const scrollBy = (distance: number) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({ left: distance, behavior: "smooth" });
  };

  return (
    <div className="relative w-full bg-background/95 shadow-sm backdrop-blur-md">
      <div
        ref={listRef}
        className="flex min-w-full items-center gap-2 overflow-x-auto px-12 py-2 scrollbar-none"
      >
        {buttons.map((button) => {
          const isActive = button.id === activeChapterId;

          return (
            <button
              key={button.id ?? "full-document"}
              type="button"
              onClick={() => onSelect(button.id)}
              className={`inline-flex min-w-[8rem] max-w-[18rem] items-center overflow-hidden rounded-full border px-3 py-1 text-sm font-medium transition duration-150 ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-foreground border-transparent hover:bg-muted"
              }`}
            >
              <span className="truncate">{button.title}</span>
            </button>
          );
        })}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-240)}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-40 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background/90 text-foreground shadow-sm shadow-black/10 transition hover:bg-muted"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(240)}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-40 inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background/90 text-foreground shadow-sm shadow-black/10 transition hover:bg-muted"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
