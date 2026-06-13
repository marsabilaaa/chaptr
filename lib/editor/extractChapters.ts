import { type Editor } from "@tiptap/react";

export interface Chapter {
  id: string;
  title: string;
  from: number;
  to: number;
}

export function extractChapters(editor: Editor | null): Chapter[] {
  if (!editor) return [];

  const chapters: Chapter[] = [];
  const { doc } = editor.state;

  doc.descendants((node, pos) => {
    if (node.type.name === "heading" && node.attrs.level === 1) {
      chapters.push({
        id: `chapter-${pos}`,
        title: node.textContent || "Untitled chapter",
        from: pos,
        to: 0,
      });
    }
    return true;
  });

  for (let index = 0; index < chapters.length; index += 1) {
    chapters[index].to =
      index < chapters.length - 1 ? chapters[index + 1].from : doc.content.size;
  }

  return chapters;
}
