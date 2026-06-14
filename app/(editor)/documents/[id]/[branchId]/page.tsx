"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import EditorToolbar from "@/components/editor/EditorToolbar";
import ChapterBar from "@/components/editor/ChapterBar";
import { useChapters } from "@/hooks/useChapters";
import { extractChapters, type Chapter } from "@/lib/editor/extractChapters";
import { EditorContent } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Download, Copy, FileText, Share2 } from "lucide-react";
import { DOMSerializer, Fragment, Slice } from "prosemirror-model";
import "@/components/editor/editor.css";
import CommitHistory from "@/components/editor/CommitHistory";

function serializeFragment(fragment: any, schema: any) {
  const serializer = DOMSerializer.fromSchema(schema);
  const container = document.createElement("div");
  container.appendChild(serializer.serializeFragment(fragment));
  return container.innerHTML;
}

function sanitizePasteSlice(slice: Slice, schema: any) {
  const mapFragment = (fragment: any): any => {
    const nodes: any[] = [];
    fragment.forEach((node: any) => {
      if (node.type.name === "heading" && node.attrs.level === 1) {
        const paragraph = schema.nodes.paragraph.create(
          node.attrs,
          mapFragment(node.content),
          node.marks,
        );
        nodes.push(paragraph);
      } else if (node.content && node.content.size) {
        nodes.push(node.copy(mapFragment(node.content)));
      } else {
        nodes.push(node);
      }
    });
    return Fragment.fromArray(nodes);
  };
  return new Slice(mapFragment(slice.content), slice.openStart, slice.openEnd);
}

function getDraftKey(branchId: string) {
  return `chaptr:draft:${branchId}`;
}
function loadDraft(branchId: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getDraftKey(branchId));
    if (!raw) return null;
    return JSON.parse(raw) as { content: string; updatedAt: number };
  } catch {
    return null;
  }
}
function saveDraft(branchId: string, content: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getDraftKey(branchId),
    JSON.stringify({ content, updatedAt: Date.now() }),
  );
}
function clearDraft(branchId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getDraftKey(branchId));
}

function getChapterHtml(chapter: Chapter, sourceEditor: Editor) {
  const range = sourceEditor.state.doc.cut(chapter.from, chapter.to);
  return serializeFragment(range.content, sourceEditor.state.schema);
}

export default function EditorPage() {
  const { id, branchId } = useParams<{ id: string; branchId: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("Untitled");
  const [commitMessage, setCommitMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  const fullEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing your story..." }),
      CharacterCount,
    ],
    content: "",
  });

  const chapterEditor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing your story..." }),
      CharacterCount,
    ],
    content: "",
    editorProps: {
      handlePaste(view, event, slice) {
        const sanitized = sanitizePasteSlice(slice, view.state.schema);
        const tr = view.state.tr.replaceSelection(sanitized).scrollIntoView();
        view.dispatch(tr);
        return true;
      },
    },
  });

  const chapters = useChapters(fullEditor);
  const isChapterView = activeChapterId !== null;
  const currentEditor = isChapterView ? chapterEditor : fullEditor;
  const chapterSyncFlushRef = useRef<(() => void) | null>(null);
  const suppressChapterSyncRef = useRef(false);
  const lastSavedHtmlRef = useRef("");
  const lastAutoCommitHtmlRef = useRef("");
  const autoCommitPendingRef = useRef(false);
  const changeCountRef = useRef(0);

  useEffect(() => {
    if (!id || !fullEditor) return;
    async function fetchDoc() {
      const res = await fetch(`/api/documents/${id}`);
      const data = await res.json();
      setTitle(data.title);
    }
    fetchDoc();
  }, [id, fullEditor]);

  useEffect(() => {
    async function fetchLatestContent() {
      if (!branchId || !fullEditor) return;
      const res = await fetch(`/api/commits?branchId=${branchId}`);
      if (!res.ok) return;
      const commits = await res.json();
      const latestCommit = commits?.length ? commits[commits.length - 1] : null;
      if (!latestCommit?.stateUrl) return;
      const restoreRes = await fetch(
        `/api/commits/restore?stateUrl=${encodeURIComponent(latestCommit.stateUrl)}`,
      );
      if (!restoreRes.ok) return;
      const data = await restoreRes.json();
      const commitContent = data.content ?? "";
      const draft = loadDraft(branchId);
      const contentToLoad =
        draft?.content && draft.content !== commitContent
          ? draft.content
          : commitContent;
      fullEditor.commands.setContent(contentToLoad);
      lastSavedHtmlRef.current = contentToLoad;
      lastAutoCommitHtmlRef.current = commitContent;
    }
    fetchLatestContent();
  }, [branchId, fullEditor]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await fetch(`/api/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [title, id]);

  const createAutoCommit = useCallback(async () => {
    if (!branchId || !fullEditor || autoCommitPendingRef.current) return;
    const content = fullEditor.getHTML();
    if (!content || content === lastAutoCommitHtmlRef.current) return;
    autoCommitPendingRef.current = true;
    const res = await fetch("/api/commits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId, content, message: "Autosave" }),
    });
    autoCommitPendingRef.current = false;
    if (res.ok) {
      lastAutoCommitHtmlRef.current = content;
      clearDraft(branchId);
      setDraftSavedAt(Date.now());
    }
  }, [branchId, fullEditor]);

  useEffect(() => {
    if (!branchId || !fullEditor) return;
    let timeoutId: number | undefined;
    const handleAutosave = () => {
      const content = fullEditor.getHTML();
      if (!content || content === lastSavedHtmlRef.current) return;
      saveDraft(branchId, content);
      lastSavedHtmlRef.current = content;
      setDraftSavedAt(Date.now());
      changeCountRef.current += 1;
      if (changeCountRef.current >= 20) {
        changeCountRef.current = 0;
        void createAutoCommit();
      }
    };
    const debouncedUpdate = () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleAutosave, 1000);
    };
    fullEditor.on("update", debouncedUpdate);
    return () => {
      fullEditor.off("update", debouncedUpdate);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [branchId, fullEditor, createAutoCommit]);

  useEffect(() => {
    if (!branchId || !fullEditor) return;
    const intervalId = window.setInterval(
      () => {
        void createAutoCommit();
      },
      5 * 60 * 1000,
    );
    return () => window.clearInterval(intervalId);
  }, [branchId, fullEditor, createAutoCommit]);

  useEffect(() => {
    if (!chapterEditor || !fullEditor || activeChapterId === null) return;
    const chapter = chapters.find((item) => item.id === activeChapterId);
    if (!chapter) return;
    let timeoutId: number | undefined;
    const syncChapter = () => {
      const chapterJson = chapterEditor.getJSON();
      const fullDoc = fullEditor.state.doc;
      const chapterDoc = fullEditor.state.schema.nodeFromJSON(chapterJson);
      const updatedFull = fullDoc.replace(
        chapter.from,
        chapter.to,
        new Slice(chapterDoc.content, 0, 0),
      );
      fullEditor.commands.setContent(updatedFull.toJSON());
      timeoutId = undefined;
    };
    const scheduleSync = () => {
      if (suppressChapterSyncRef.current) return;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(syncChapter, 500);
    };
    chapterSyncFlushRef.current = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
        syncChapter();
      }
    };
    chapterEditor.on("update", scheduleSync);
    return () => {
      chapterEditor.off("update", scheduleSync);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
        syncChapter();
      }
      chapterSyncFlushRef.current = null;
    };
  }, [chapterEditor, fullEditor, activeChapterId, chapters]);

  useEffect(() => {
    if (
      activeChapterId !== null &&
      !chapters.some((c) => c.id === activeChapterId)
    ) {
      setActiveChapterId(null);
    }
  }, [activeChapterId, chapters]);

  function getExportHtml() {
    return activeChapterId !== null
      ? (chapterEditor?.getHTML() ?? "")
      : (fullEditor?.getHTML() ?? "");
  }
  function getExportText() {
    return activeChapterId !== null
      ? (chapterEditor?.getText() ?? "")
      : (fullEditor?.getText() ?? "");
  }

  async function handleCommit() {
    if (!commitMessage.trim()) return;
    setSaving(true);
    if (activeChapterId !== null) chapterSyncFlushRef.current?.();
    const content = fullEditor?.getHTML() ?? "";
    const res = await fetch("/api/commits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId, content, message: commitMessage }),
    });
    if (res.ok) {
      setSaved(true);
      setCommitMessage("");
      if (branchId) clearDraft(branchId);
      const savedContent = fullEditor?.getHTML() ?? "";
      lastSavedHtmlRef.current = savedContent;
      lastAutoCommitHtmlRef.current = savedContent;
      setDraftSavedAt(Date.now());
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  async function copyAsHtml() {
    const html = getExportHtml();
    if (!html) return;
    const fullHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>Export</title>\n</head>\n<body>\n${html}\n</body>\n</html>`;
    await navigator.clipboard.writeText(fullHtml);
  }

  async function copyAsRichText() {
    const html = getExportHtml();
    if (!html) return;
    if (navigator.clipboard && "ClipboardItem" in window) {
      const blob = new Blob([html], { type: "text/html" });
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": blob }),
      ]);
    } else {
      await navigator.clipboard.writeText(getExportText());
    }
  }

  function downloadFile(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function downloadHtml() {
    const html = getExportHtml();
    const fullHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>Export</title>\n</head>\n<body>\n${html}\n</body>\n</html>`;
    downloadFile("chaptr-export.html", fullHtml, "text/html");
  }

  function downloadDoc() {
    downloadFile("chaptr-export.doc", getExportHtml(), "application/msword");
  }

  function handleRestore(content: string) {
    fullEditor?.commands.setContent(content);
    if (activeChapterId !== null) setActiveChapterId(null);
  }

  const handleSelectChapter = (chapterId: string | null) => {
    if (!fullEditor || !chapterEditor) return;
    if (chapterId === null) {
      setActiveChapterId(null);
      return;
    }
    const selectedChapter = chapters.find((c) => c.id === chapterId);
    if (!selectedChapter) return;
    if (activeChapterId === null) {
      fullEditor
        .chain()
        .focus()
        .setTextSelection(selectedChapter.from)
        .scrollIntoView()
        .run();
      setTimeout(() => {
        const chapterHtml = getChapterHtml(selectedChapter, fullEditor);
        chapterEditor.commands.setContent(chapterHtml);
        setActiveChapterId(chapterId);
      }, 150);
      return;
    }
    chapterSyncFlushRef.current?.();
    const chapterHtml = getChapterHtml(selectedChapter, fullEditor);
    suppressChapterSyncRef.current = true;
    chapterEditor.commands.setContent(chapterHtml);
    setActiveChapterId(chapterId);
    window.requestAnimationFrame(() => {
      suppressChapterSyncRef.current = false;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* PERUBAHAN: Hanya menambahkan div pembungkus ini agar Navbar 
        dan Toolbar tetap sticky bersama-sama 
      */}
      <div className="sticky top-0 z-10 bg-background">
        {/* Navbar (Properti sticky aslinya dipindah ke div induk di atas) */}
        <div className="border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/documents")}
              className="text-sm font-semibold text-foreground transition hover:text-primary"
            >
              Chaptr
            </button>
            <span className="text-muted-foreground text-sm">/</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-7 text-sm border-none shadow-none focus-visible:ring-0 px-1 min-w-[10rem] max-w-full sm:w-48"
            />
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2 text-right">
            <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:text-right">
              <span>
                {currentEditor?.storage.characterCount.words() ?? 0} words
              </span>
              <span>{draftSavedAt ? "Draft saved" : "Draft not saved"}</span>
            </div>
            <div className="relative">
              <CommitHistory branchId={branchId} onRestore={handleRestore} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Share2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Export</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={copyAsHtml}>
                  <Copy className="h-4 w-4" />
                  Copy as HTML
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={copyAsRichText}>
                  <FileText className="h-4 w-4" />
                  Copy as rich text
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={downloadHtml}>
                  <Download className="h-4 w-4" />
                  Download HTML
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={downloadDoc}>
                  <Download className="h-4 w-4" />
                  Download DOC
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Input
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit message"
              className="h-7 text-sm border-none shadow-none focus-visible:ring-0 px-1 w-52"
            />
            <Button
              size="sm"
              onClick={handleCommit}
              disabled={saving || !commitMessage.trim()}
            >
              {saving ? "Saving..." : saved ? "Saved ✓" : "Commit"}
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-border px-6 py-2">
          <EditorToolbar
            editor={currentEditor}
            disableHeading1={isChapterView}
          />
        </div>
      </div>

      <ChapterBar
        chapters={chapters}
        activeChapterId={activeChapterId}
        onSelect={handleSelectChapter}
      />

      {/* Editor */}
      <div className="max-w-3xl mx-auto px-6 py-12 pb-16">
        {currentEditor ? <EditorContent editor={currentEditor} /> : null}
      </div>
    </div>
  );
}
