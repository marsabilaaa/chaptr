"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chapter {
  id: number;
  label: string;
  heading: string;
  content: string;
}

const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 1,
    label: "Ch. 1 — Mrs. Rachel Lynde Is Surprised",
    heading: "Chapter 1 — Mrs. Rachel Lynde Is Surprised",
    content:
      "Mrs. Rachel Lynde lived just where the Avonlea main road dipped down into a little hollow, fringed with alders and ladies’ eardrops and traversed by a brook that had its source away back in the woods of the old Cuthbert place; it was reputed to be an intricate, headlong brook in its earlier course through those woods, with dark secrets of pool and cascade; but by the time it reached Lynde’s Hollow it was a quiet, well-conducted little stream, for not even a brook could run past Mrs. Rachel Lynde’s door without due regard for decency and decorum; it probably was conscious that Mrs. Rachel was sitting at her window, keeping a sharp eye on everything that passed, from brooks and children up, and that if she noticed anything odd or out of place she would never rest until she had ferreted out the whys and wherefores thereof.",
  },
  {
    id: 2,
    label: "Ch. 2 — Matthew Cuthbert Is Surprised",
    heading: "Chapter 2 — Matthew Cuthbert Is Surprised",
    content:
      "Matthew Cuthbert and the sorrel mare jogged comfortably over the eight miles to Bright River. It was a pretty road, running along between snug farmsteads, with now and again a bit of balsamy fir wood to drive through or a hollow where wild plums hung out their filmy bloom. The air was sweet with the breath of many apple orchards and the meadows sloped away in the distance to horizon mists of pearl and purple; while",
  },
  {
    id: 3,
    label: "Ch. 3 — Marilla Cuthbert Is Surprised",
    heading: "Chapter 3 — Marilla Cuthbert Is Surprised",
    content: `Marilla came briskly forward as Matthew opened the door. But when her eyes fell on the odd little figure in the stiff, ugly dress, with the long braids of red hair and the eager, luminous eyes, she stopped short in amazement.
“Matthew Cuthbert, who’s that?” she ejaculated. “Where is the boy?”
“There wasn’t any boy,” said Matthew wretchedly. “There was only her.”
He nodded at the child, remembering that he had never even asked her name.
“No boy! But there must have been a boy,” insisted Marilla. “We sent word to Mrs. Spencer to bring a boy.”
“Well, she didn’t. She brought her. I asked the stationmaster. And I had to bring her home. She couldn’t be left there, no matter where the mistake had come in.”
“Well, this is a pretty piece of business!” ejaculated Marilla.
During this dialogue the child had remained silent, her eyes roving from one to the other, all the animation fading out of her face. Suddenly she seemed to grasp the full meaning of what had been said. Dropping her precious carpet-bag she sprang forward a step and clasped her hands.`,
  },
];

interface AutoResizeTextareaProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

function AutoResizeTextarea({ value, onChange }: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      spellCheck={false}
      className="w-full bg-transparent resize-none focus:outline-none text-[14px] leading-[1.75] text-muted-foreground overflow-hidden"
      rows={1}
    />
  );
}

export default function ChapterDemo() {
  const [active, setActive] = useState<number>(0);
  const [chapters, setChapters] = useState<Chapter[]>(INITIAL_CHAPTERS);

  // 1. Tambahkan state dan ref untuk fitur scroll
  const listRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 2. Fungsi untuk mengecek posisi scroll (sama seperti di ChapterBar)
  const updateScrollState = () => {
    const list = listRef.current;
    if (!list) return;
    setCanScrollLeft(list.scrollLeft > 0);
    setCanScrollRight(
      list.scrollWidth > list.clientWidth + list.scrollLeft + 1,
    );
  };

  // 3. Efek untuk memasang event listener
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

  // 4. Fungsi untuk menggeser tab saat panah diklik
  const scrollTabsBy = (distance: number) => {
    listRef.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  const handleContentChange = (index: number, newContent: string) => {
    const newChapters = [...chapters];
    newChapters[index].content = newContent;
    setChapters(newChapters);
  };

  const tabs = [{ label: "Full document" }, ...chapters];

  return (
    <div>
      {/* Tabs Wrapper dengan relative untuk posisi panah */}
      <div className="relative flex items-end">
        {/* Tombol Scroll Kiri */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollTabsBy(-200)}
            className="absolute left-0 bottom-0 z-10 h-[30px] w-8 flex items-center justify-center bg-background border border-b-0 border-border/50 rounded-tl-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Daftar Tab (Scrollable) */}
        <div
          ref={listRef}
          className="flex gap-1 px-px overflow-x-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{
            paddingLeft: canScrollLeft ? "2.2rem" : "0",
            paddingRight: canScrollRight ? "2.2rem" : "0",
          }}
        >
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "h-[30px] px-3.5 rounded-t-md border border-b-0 border-border/50 text-[12px] whitespace-nowrap transition-colors shrink-0",
                active === i
                  ? "bg-background text-foreground font-medium"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tombol Scroll Kanan */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollTabsBy(200)}
            className="absolute right-0 bottom-0 z-10 h-[30px] w-8 flex items-center justify-center bg-background border border-b-0 border-border/50 rounded-tr-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Editor area */}
      <div className="border border-border/50 rounded-b-lg rounded-tr-lg bg-background p-6 min-h-[160px] max-h-[400px] overflow-y-auto">
        {active === 0 ? (
          <div className="space-y-8">
            {chapters.map((chapter, index) => (
              <div key={chapter.id}>
                <p className="text-[18px] font-medium text-foreground mb-3">
                  {chapter.heading}
                </p>
                <AutoResizeTextarea
                  value={chapter.content}
                  onChange={(e) => handleContentChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-[18px] font-medium text-foreground mb-3">
              {chapters[active - 1].heading}
            </p>
            <AutoResizeTextarea
              value={chapters[active - 1].content}
              onChange={(e) => handleContentChange(active - 1, e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
