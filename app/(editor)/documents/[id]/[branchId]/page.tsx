"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import EditorToolbar from "@/components/editor/EditorToolbar";
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
import "@/components/editor/editor.css";
import CommitHistory from "@/components/editor/CommitHistory";

export default function EditorPage() {
  const { id, branchId } = useParams<{ id: string; branchId: string }>();
  const [title, setTitle] = useState("Untitled");
  const [commitMessage, setCommitMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your story...",
      }),
      CharacterCount,
    ],
    content: "",
  });

  // Fetch dokumen
  useEffect(() => {
    async function fetchDoc() {
      const res = await fetch(`/api/documents/${id}`);
      const data = await res.json();
      setTitle(data.title);
    }
    fetchDoc();
  }, [id]);

  useEffect(() => {
    async function fetchLatestContent() {
      if (!branchId || !editor) return;

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
      if (data.content) {
        editor.commands.setContent(data.content);
      }
    }

    fetchLatestContent();
  }, [branchId, editor]);

  // Auto-save judul
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

  async function handleCommit() {
    if (!commitMessage.trim()) return;
    setSaving(true);

    const content = editor?.getHTML() ?? "";

    const res = await fetch("/api/commits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branchId,
        content,
        message: commitMessage,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setCommitMessage("");
      setTimeout(() => setSaved(false), 2000);
    }

    setSaving(false);
  }

  async function copyAsHtml() {
    const html = editor?.getHTML() ?? "";
    if (!html) return;

    const fullHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>Export</title>\n</head>\n<body>\n${html}\n</body>\n</html>`;
    await navigator.clipboard.writeText(fullHtml);
  }

  async function copyAsRichText() {
    const html = editor?.getHTML() ?? "";
    if (!html) return;

    if (navigator.clipboard && "ClipboardItem" in window) {
      const blob = new Blob([html], { type: "text/html" });
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": blob }),
      ]);
    } else {
      await navigator.clipboard.writeText(editor?.getText() ?? "");
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
    const html = editor?.getHTML() ?? "";
    const fullHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>Export</title>\n</head>\n<body>\n${html}\n</body>\n</html>`;
    downloadFile("chaptr-export.html", fullHtml, "text/html");
  }

  function downloadDoc() {
    downloadFile(
      "chaptr-export.doc",
      editor?.getHTML() ?? "",
      "application/msword",
    );
  }

  function handleRestore(content: string) {
    editor?.commands.setContent(content);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">Chaptr</span>
          <span className="text-muted-foreground text-sm">/</span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-7 text-sm border-none shadow-none focus-visible:ring-0 px-1 w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {editor?.storage.characterCount.words() ?? 0} words
          </span>
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
        <EditorToolbar editor={editor} />
      </div>

      {/* Editor */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
