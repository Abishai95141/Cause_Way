import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { PatchWorldModelRequest, BuildBridgeRequest } from "./client";

/* ─── Query Keys ─── */
export const queryKeys = {
  health: ["health"] as const,
  metrics: ["metrics"] as const,
  document: (id: string) => ["document", id] as const,
  documents: ["documents"] as const,
  search: (query: string) => ["search", query] as const,
  models: ["models"] as const,
  model: (domain: string) => ["model", domain] as const,
  modelDetail: (domain: string) => ["model", "detail", domain] as const,
  mode1Stage: ["mode1", "stage"] as const,
  protocolStatus: ["protocol", "status"] as const,
  bridges: ["bridges"] as const,
  bridge: (id: string) => ["bridge", id] as const,
};

/* ─── Health & Metrics ─── */
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: api.health,
    refetchInterval: 15000,
    retry: 1,
  });
}

export function useMetrics() {
  return useQuery({
    queryKey: queryKeys.metrics,
    queryFn: api.metrics,
    refetchInterval: 10000,
    retry: 1,
  });
}

/* ─── Documents ─── */
export function useDocument(docId: string) {
  return useQuery({
    queryKey: queryKeys.document(docId),
    queryFn: () => api.getDocument(docId),
    enabled: !!docId,
  });
}

export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: api.listDocuments,
    refetchInterval: 30000,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, description }: { file: File; description?: string }) =>
      api.uploadDocument(file, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.documents });
      qc.invalidateQueries({ queryKey: ["document"] });
    },
  });
}

export function useIndexDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => api.indexDocument(docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.documents });
      qc.invalidateQueries({ queryKey: ["document"] });
    },
  });
}

/* ─── Search ─── */
export function useSearch() {
  return useMutation({
    mutationFn: ({ query, maxResults, docId }: { query: string; maxResults?: number; docId?: string }) =>
      api.search(query, maxResults, docId),
  });
}

/* ─── Mode 1 ─── */
export function useExecuteMode1() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      domain: string;
      query: string;
      maxVars?: number;
      maxEdges?: number;
      docIds?: string[];
    }) =>
      api.executeMode1(params.domain, params.query, params.maxVars, params.maxEdges, params.docIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.models });
    },
  });
}

export function useMode1Stage(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.mode1Stage,
    queryFn: api.getMode1Stage,
    refetchInterval: enabled ? 2000 : false,
    enabled,
  });
}

export function useApproveModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ domain, approvedBy }: { domain: string; approvedBy: string }) =>
      api.approveModel(domain, approvedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.models });
    },
  });
}

/* ─── Mode 2 ─── */
export function useExecuteMode2() {
  return useMutation({
    mutationFn: (params: { query: string; domainHint?: string }) =>
      api.executeMode2(params.query, params.domainHint),
  });
}

/* ─── Models ─── */
export function useModels() {
  return useQuery({
    queryKey: queryKeys.models,
    queryFn: api.listModels,
    refetchInterval: 30000,
  });
}

export function useModel(domain: string) {
  return useQuery({
    queryKey: queryKeys.model(domain),
    queryFn: () => api.getModel(domain),
    enabled: !!domain,
  });
}

export function useModelDetail(domain: string) {
  return useQuery({
    queryKey: queryKeys.modelDetail(domain),
    queryFn: () => api.getModelDetail(domain),
    enabled: !!domain,
  });
}

export function usePatchModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ domain, patch }: { domain: string; patch: PatchWorldModelRequest }) =>
      api.patchWorldModel(domain, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.models });
    },
  });
}

/* ─── Bridges ─── */
export function useBridges() {
  return useQuery({
    queryKey: queryKeys.bridges,
    queryFn: api.listBridges,
    refetchInterval: 30000,
  });
}

export function useBridge(bridgeId: string) {
  return useQuery({
    queryKey: queryKeys.bridge(bridgeId),
    queryFn: () => api.getBridge(bridgeId),
    enabled: !!bridgeId,
  });
}

export function useBuildBridge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: BuildBridgeRequest) => api.buildBridge(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bridges });
    },
  });
}

/* ─── Unified Query ─── */
export function useUnifiedQuery() {
  return useMutation({
    mutationFn: (params: { query: string; sessionId?: string }) =>
      api.query(params.query, params.sessionId),
  });
}

/* ─── Protocol ─── */
export function useProtocolStatus() {
  return useQuery({
    queryKey: queryKeys.protocolStatus,
    queryFn: api.protocolStatus,
    refetchInterval: 5000,
  });
}

/* ─── Admin ─── */
export function usePurgeDocuments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (confirm: boolean) => api.purgeDocuments(confirm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.documents });
      qc.invalidateQueries({ queryKey: ["document"] });
    },
  });
}
