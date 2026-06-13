import { useEffect, useState } from "react";
import { type Editor } from "@tiptap/react";
import { extractChapters, type Chapter } from "@/lib/editor/extractChapters";

export function useChapters(editor: Editor | null) {
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    if (!editor) {
      setChapters([]);
      return;
    }

    const updateChapters = () => {
      setChapters(extractChapters(editor));
    };

    updateChapters();
    editor.on("update", updateChapters);

    return () => {
      editor.off("update", updateChapters);
    };
  }, [editor]);

  return chapters;
}
