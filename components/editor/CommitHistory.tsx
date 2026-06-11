"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { History, GitCommit } from "lucide-react";

interface Commit {
  id: string;
  message: string;
  createdAt: string;
  authorId: string;
  isSnapshot: boolean;
  stateUrl: string;
}

interface CommitHistoryProps {
  branchId: string;
  onRestore?: (content: string) => void;
}

export default function CommitHistory({
  branchId,
  onRestore,
}: CommitHistoryProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (open) fetchHistory();
  }, [open, branchId]);

  async function fetchHistory() {
    setLoading(true);
    const res = await fetch(`/api/commits?branchId=${branchId}`);
    const data = await res.json();
    setCommits(data.reverse()); // terbaru di atas
    setLoading(false);
  }

  async function handleRestore(commit: Commit) {
    console.log("commit object:", commit);
    console.log("stateUrl:", commit.stateUrl);
    setRestoring(commit.id);

    const res = await fetch(
      `/api/commits/restore?stateUrl=${encodeURIComponent(commit.stateUrl)}`,
    );
    const data = await res.json();

    if (data.content && onRestore) {
      onRestore(data.content);
    }

    setRestoring(null);
    setOpen(false);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-2"
      >
        <History className="h-4 w-4" />
        History
      </Button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 bg-background border border-border rounded-lg shadow-lg">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium">Commit History</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click a version to restore
                </p>
              </div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {commits.length} versions
              </span>
            </div>
          </div>

          <ScrollArea className="h-80">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : commits.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No commits yet
              </div>
            ) : (
              <div className="py-2">
                {commits.map((commit, index) => (
                  <div key={commit.id}>
                    <div className="px-4 py-3 hover:bg-accent group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <GitCommit className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {commit.message || "No message"}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                              <span>{formatDate(commit.createdAt)}</span>
                              <span className="truncate">
                                {commit.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {commit.isSnapshot && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-1.5 py-0"
                            >
                              snap
                            </Badge>
                          )}
                          {index === 0 && (
                            <Badge className="text-xs px-1.5 py-0">
                              latest
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRestore(commit)}
                        disabled={restoring === commit.id || index === 0}
                      >
                        {restoring === commit.id
                          ? "Restoring..."
                          : index === 0
                            ? "Current"
                            : "Restore this version"}
                      </Button>
                    </div>
                    {index < commits.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
