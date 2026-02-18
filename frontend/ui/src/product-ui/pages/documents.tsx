import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  File,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { PageHeader } from "@/product-ui/components/layout/page-header";
import { Card, CardContent } from "@/product-ui/components/ui/card";
import { Button } from "@/product-ui/components/ui/button";
import { Input } from "@/product-ui/components/ui/input";
import { Badge } from "@/product-ui/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/product-ui/components/ui/tabs";
import { EmptyState } from "@/product-ui/components/shared/empty-state";
import { useUploadDocument, useIndexDocument, useSearch, useDocuments } from "@/product-ui/api/hooks";
import type { DocumentMetadata, IngestionStatus, SearchResultDTO, DocumentListItem, DocumentResponseDTO } from "@/product-ui/api/client";
import { cn, formatBytes } from "@/product-ui/lib/utils";
import { toast } from "sonner";

const statusConfig: Record<IngestionStatus, { label: string; variant: "success" | "warning" | "error" | "info" | "secondary"; icon: typeof CheckCircle2 }> = {
  indexed: { label: "Indexed", variant: "success", icon: CheckCircle2 },
  indexing: { label: "Indexing", variant: "info", icon: Loader2 },
  pending: { label: "Pending", variant: "warning", icon: Clock },
  failed: { label: "Failed", variant: "error", icon: AlertCircle },
};

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "text/csv": [".csv"],
};

export function DocumentsPage() {
  const [uploadedDocs, setUploadedDocs] = useState<DocumentResponseDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [searchResults, setSearchResults] = useState<SearchResultDTO[]>([]);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const uploadMutation = useUploadDocument();
  const indexMutation = useIndexDocument();
  const searchMutation = useSearch();
  const { data: serverDocs, isLoading: docsLoading } = useDocuments();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        uploadMutation.mutate({ file }, {
          onSuccess: (doc) => {
            setUploadedDocs((prev) => [doc, ...prev]);
            toast.success(`Uploaded ${file.name}`);
          },
          onError: () => toast.error(`Failed to upload ${file.name}`),
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 50 * 1024 * 1024,
  });

  const handleIndex = (docId: string) => {
    indexMutation.mutate(docId, {
      onSuccess: (data) => {
        setUploadedDocs((prev) =>
          prev.map((d) => (d.doc_id === docId ? { ...d, status: "indexing" } : d))
        );
        toast.success(data.message || "Indexing started");
      },
      onError: () => toast.error("Failed to start indexing"),
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    searchMutation.mutate(
      { query: searchQuery, maxResults: topK },
      {
        onSuccess: (data) => setSearchResults(data.results ?? []),
        onError: () => toast.error("Search failed"),
      }
    );
  };

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Upload, index, and search your business documents for causal analysis."
      />

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="w-3.5 h-3.5" /> Upload
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <FileText className="w-3.5 h-3.5" /> Library
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="w-3.5 h-3.5" /> Search
          </TabsTrigger>
        </TabsList>

        {/* ─── Upload Tab ─── */}
        <TabsContent value="upload">
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <div
                {...getRootProps()}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-300",
                  isDragActive
                    ? "border-[var(--color-accent-500)] bg-[var(--color-accent-500)]/5 scale-[1.01]"
                    : "border-[var(--border-primary)] hover:border-[var(--color-accent-400)] hover:bg-[var(--bg-secondary)]"
                )}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={isDragActive ? { scale: 1.1, y: -8 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--color-accent-500)]/10 to-[var(--color-accent-500)]/5 mb-6 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]"
                >
                  <Upload className={cn("w-8 h-8 transition-colors", isDragActive ? "text-[var(--color-accent-500)]" : "text-[var(--text-tertiary)]")} />
                </motion.div>
                <p className="text-[16px] font-semibold text-[var(--text-primary)] mb-2">
                  {isDragActive ? "Drop files here" : "Drop files or click to browse"}
                </p>
                <p className="text-[14px] text-[var(--text-tertiary)] max-w-sm">
                  PDF, TXT, Markdown, XLSX, CSV — up to 50 MB per file
                </p>
              </div>

              {uploadMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mt-6 p-4 rounded-xl bg-[var(--color-accent-500)]/5 border border-[var(--color-accent-500)]/10"
                >
                  <Loader2 className="w-5 h-5 text-[var(--color-accent-500)] animate-spin" />
                  <span className="text-[14px] text-[var(--text-secondary)] font-medium">Uploading...</span>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Library Tab ─── */}
        <TabsContent value="library">
          {/* Server-side document list */}
          {docsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--text-tertiary)]" />
            </div>
          ) : (serverDocs && serverDocs.length > 0) || uploadedDocs.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {/* Recently uploaded (local state, richer info) */}
                {uploadedDocs.map((doc) => {
                  const docStatus = (doc.status ?? "pending") as IngestionStatus;
                  const statusInfo = statusConfig[docStatus] ?? statusConfig.pending;
                  const StatusIcon = statusInfo.icon;
                  const isExpanded = expandedDoc === doc.doc_id;
                  return (
                    <motion.div
                      key={doc.doc_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <Card className="hover:shadow-[var(--shadow-lg)] transition-all duration-300">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--bg-tertiary)] shrink-0">
                              <File className="w-5 h-5 text-[var(--text-tertiary)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">{doc.filename}</p>
                              <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                                {doc.storage_uri}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge variant={statusInfo.variant} className="gap-1.5">
                                <StatusIcon className={cn("w-3 h-3", statusInfo.variant === "info" && "animate-spin")} />
                                {statusInfo.label}
                              </Badge>
                              {docStatus === "pending" && (
                                <Button size="sm" variant="outline" onClick={() => handleIndex(doc.doc_id)}>
                                  Index
                                </Button>
                              )}
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => setExpandedDoc(isExpanded ? null : doc.doc_id)}
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-5 pt-5 border-t border-[var(--border-secondary)] grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                                  <div>
                                    <span className="text-[var(--text-tertiary)] text-[11px] uppercase tracking-wider font-semibold">Document ID</span>
                                    <p className="font-mono text-[var(--text-secondary)] mt-1">{doc.doc_id}</p>
                                  </div>
                                  <div>
                                    <span className="text-[var(--text-tertiary)] text-[11px] uppercase tracking-wider font-semibold">Content Hash</span>
                                    <p className="font-mono text-[var(--text-secondary)] mt-1 truncate">{doc.content_hash}</p>
                                  </div>
                                  <div>
                                    <span className="text-[var(--text-tertiary)] text-[11px] uppercase tracking-wider font-semibold">Storage URI</span>
                                    <p className="font-mono text-[var(--text-secondary)] mt-1 truncate">{doc.storage_uri}</p>
                                  </div>
                                  <div>
                                    <span className="text-[var(--text-tertiary)] text-[11px] uppercase tracking-wider font-semibold">Created At</span>
                                    <p className="font-mono text-[var(--text-secondary)] mt-1">{doc.created_at}</p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
                {/* Server-side documents */}
                {serverDocs?.filter((sd) => !uploadedDocs.some((ud) => ud.doc_id === sd.doc_id)).map((doc) => {
                  const docStatus = (doc.status ?? "pending") as IngestionStatus;
                  const statusInfo = statusConfig[docStatus] ?? statusConfig.pending;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <motion.div
                      key={doc.doc_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <Card className="hover:shadow-[var(--shadow-lg)] transition-all duration-300">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--bg-tertiary)] shrink-0">
                              <File className="w-5 h-5 text-[var(--text-tertiary)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">{doc.filename}</p>
                              <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5 font-mono">{doc.doc_id}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <Badge variant={statusInfo.variant} className="gap-1.5">
                                <StatusIcon className={cn("w-3 h-3", statusInfo.variant === "info" && "animate-spin")} />
                                {statusInfo.label}
                              </Badge>
                              {docStatus === "pending" && (
                                <Button size="sm" variant="outline" onClick={() => handleIndex(doc.doc_id)}>
                                  Index
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyState
              icon={<FileText className="w-16 h-16" />}
              title="No documents yet"
              description="Upload documents to start building your knowledge base for causal analysis."
            />
          )}
        </TabsContent>

        {/* ─── Search Tab ─── */}
        <TabsContent value="search">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 w-full space-y-2">
                  <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Semantic Query</label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search across indexed documents..."
                    className="h-11"
                  />
                </div>
                <div className="w-full sm:w-28 space-y-2">
                  <label className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Top K</label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={topK}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(20, Number(e.target.value) || 1));
                      setTopK(val);
                    }}
                    className="h-11"
                  />
                </div>
                <Button onClick={handleSearch} disabled={!searchQuery.trim() || searchMutation.isPending} size="lg" className="w-full sm:w-auto shrink-0">
                  {searchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((result, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:shadow-[var(--shadow-lg)] transition-all duration-300">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <Badge variant="secondary" className="shrink-0">#{i + 1}</Badge>
                        <Badge variant="info" className="shrink-0">
                          Score: {(result.score * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-[14px] text-[var(--text-primary)] leading-relaxed">
                        {result.content}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-[12px] text-[var(--text-tertiary)]">
                        {result.doc_title && (
                          <span className="font-medium">{result.doc_title}</span>
                        )}
                        {result.doc_id && (
                          <span className="font-mono">ID: {result.doc_id}</span>
                        )}
                        {result.section && (
                          <span>§ {result.section}</span>
                        )}
                        {result.page != null && (
                          <span>p. {result.page}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            !searchMutation.isPending && (
              <EmptyState
                icon={<Search className="w-16 h-16" />}
                title="Search your documents"
                description="Enter a query to find relevant content across all indexed documents."
              />
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
