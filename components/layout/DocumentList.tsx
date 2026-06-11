"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Document {
  id: string;
  title: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  branchId?: string;
}

export default function DocumentList({ userId }: { userId: string }) {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    const res = await fetch("/api/documents");
    const data = await res.json();
    setDocuments(data);
    setLoading(false);
  }

  async function createDocument() {
    setCreating(true);
    const res = await fetch("/api/documents", { method: "POST" });
    const doc = await res.json();
    router.push(`/documents/${doc.documentId}/${doc.branchId}`);
  }

  async function deleteDocument(documentId: string) {
    const shouldDelete = window.confirm(
      "Delete this document? This cannot be undone.",
    );
    if (!shouldDelete) return;

    setDeletingId(documentId);
    const res = await fetch(`/api/documents/${documentId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await fetchDocuments();
    }
    setDeletingId(null);
  }

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Documents</h1>
        <Button onClick={createDocument} disabled={creating}>
          {creating ? "Creating..." : "+ New Document"}
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search documents..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {search ? "No documents found." : "No documents yet. Create one!"}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => {
                  if (!doc.branchId) return;
                  router.push(`/documents/${doc.id}/${doc.branchId}`);
                }}
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium truncate">
                    {doc.title || "Untitled"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(doc.updated_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground capitalize">
                  {doc.visibility}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDocument(doc.id);
                  }}
                  disabled={deletingId === doc.id}
                >
                  {deletingId === doc.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
