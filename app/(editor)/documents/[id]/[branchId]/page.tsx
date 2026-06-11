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
import "@/components/editor/editor.css";

export default function EditorPage() {
  const { id, branchId } = useParams<{ id: string; branchId: string }>();
  const [title, setTitle] = useState("Untitled");
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
    setSaving(true);

    const content = editor?.getHTML() ?? "";

    const res = await fetch("/api/commits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branchId,
        content,
        message: "",
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }

    setSaving(false);
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
          <Button size="sm" onClick={handleCommit} disabled={saving}>
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
