export type Priority = "critical" | "high" | "medium" | "low";
export type OperationStatus = "healthy" | "warning" | "critical";
export type ProtocolStatus = "online" | "degraded" | "offline";
export type AgentType = "claude" | "codex";

export interface Directive {
  id: string;
  title: string;
  operation: string;
  priority: Priority;
  completed: boolean;
  isBlocker?: boolean;
  isHighROI?: boolean;
  isUpNext?: boolean;
}

export interface CompletedOp {
  id: string;
  message: string;
  operation: string;
  hash: string;
  timestamp: string;
}

export interface Protocol {
  id: string;
  name: string;
  status: ProtocolStatus;
  uptime: string;
  cpu: number;
  memory: number;
  isPrimary?: boolean;
}

export interface ActiveAgent {
  id: string;
  processId: string;
  agentType: AgentType;
  directive: string;
  operation: string;
  duration: string;
  currentAction: string;
}

export interface Operation {
  id: string;
  name: string;
  status: OperationStatus;
}

export const operations: Operation[] = [
  { id: "op-1", name: "allmind-core", status: "healthy" },
  { id: "op-2", name: "data-pipeline", status: "warning" },
  { id: "op-3", name: "agent-runtime", status: "healthy" },
  { id: "op-4", name: "knowledge-graph", status: "critical" },
  { id: "op-5", name: "gateway-service", status: "healthy" },
];

export const directives: Directive[] = [
  {
    id: "d-1",
    title: "Migrate vector store to pgvector",
    operation: "data-pipeline",
    priority: "critical",
    completed: false,
    isBlocker: true,
  },
  {
    id: "d-2",
    title: "Implement RAG context windowing",
    operation: "knowledge-graph",
    priority: "high",
    completed: false,
    isHighROI: true,
  },
  {
    id: "d-3",
    title: "Add rate limiting to Gateway API",
    operation: "gateway-service",
    priority: "high",
    completed: false,
    isUpNext: true,
  },
  {
    id: "d-4",
    title: "Refactor agent dispatch queue",
    operation: "agent-runtime",
    priority: "medium",
    completed: false,
    isUpNext: true,
  },
  {
    id: "d-5",
    title: "Update Tunnel auth certificates",
    operation: "allmind-core",
    priority: "critical",
    completed: false,
    isBlocker: true,
  },
  {
    id: "d-6",
    title: "Optimize embedding batch processing",
    operation: "data-pipeline",
    priority: "medium",
    completed: false,
    isHighROI: true,
  },
  {
    id: "d-7",
    title: "Add telemetry to agent sessions",
    operation: "agent-runtime",
    priority: "low",
    completed: false,
  },
  {
    id: "d-8",
    title: "Schema validation for Data API",
    operation: "data-pipeline",
    priority: "medium",
    completed: false,
  },
  {
    id: "d-9",
    title: "Implement backup rotation policy",
    operation: "allmind-core",
    priority: "low",
    completed: true,
  },
  {
    id: "d-10",
    title: "Cache layer for knowledge queries",
    operation: "knowledge-graph",
    priority: "high",
    completed: true,
  },
  {
    id: "d-11",
    title: "Harden daemon restart logic",
    operation: "allmind-core",
    priority: "high",
    completed: false,
    isUpNext: true,
  },
  {
    id: "d-12",
    title: "Audit TLS cert chain for expiry",
    operation: "allmind-core",
    priority: "medium",
    completed: false,
    isUpNext: true,
  },
  {
    id: "d-13",
    title: "Refactor config hot-reload mechanism",
    operation: "allmind-core",
    priority: "medium",
    completed: false,
    isHighROI: true,
  },
  {
    id: "d-14",
    title: "Add health-check endpoint to Daemon API",
    operation: "allmind-core",
    priority: "low",
    completed: false,
  },
  {
    id: "d-15",
    title: "Implement chunked upload for large datasets",
    operation: "data-pipeline",
    priority: "high",
    completed: false,
    isUpNext: true,
  },
  {
    id: "d-16",
    title: "Add retry backoff to embedding queue",
    operation: "data-pipeline",
    priority: "medium",
    completed: false,
  },
  {
    id: "d-17",
    title: "Wire up agent crash recovery handler",
    operation: "agent-runtime",
    priority: "high",
    completed: false,
    isBlocker: true,
  },
  {
    id: "d-18",
    title: "Normalize graph schema for v2 ontology",
    operation: "knowledge-graph",
    priority: "high",
    completed: false,
    isUpNext: true,
  },
];

export const completedOps: CompletedOp[] = [
  {
    id: "c-1",
    message: "fix: resolve deadlock in sync pipeline",
    operation: "data-pipeline",
    hash: "a3f8c21",
    timestamp: "12 min ago",
  },
  {
    id: "c-2",
    message: "feat: add streaming response handler",
    operation: "agent-runtime",
    hash: "7e2b4d9",
    timestamp: "34 min ago",
  },
  {
    id: "c-3",
    message: "refactor: consolidate auth middleware",
    operation: "gateway-service",
    hash: "1c9a0f3",
    timestamp: "1h ago",
  },
  {
    id: "c-4",
    message: "fix: memory leak in embedding cache",
    operation: "knowledge-graph",
    hash: "5d4e8b2",
    timestamp: "2h ago",
  },
  {
    id: "c-5",
    message: "chore: update dependency lockfile",
    operation: "allmind-core",
    hash: "9f1c7a6",
    timestamp: "3h ago",
  },
];

export const protocols: Protocol[] = [
  {
    id: "p-1",
    name: "ALLMIND Daemon",
    status: "online",
    uptime: "14d 7h 32m",
    cpu: 12,
    memory: 34,
    isPrimary: true,
  },
  {
    id: "p-2",
    name: "Data API",
    status: "online",
    uptime: "14d 7h 32m",
    cpu: 8,
    memory: 22,
  },
  {
    id: "p-3",
    name: "Data Sync",
    status: "degraded",
    uptime: "6d 14h 11m",
    cpu: 45,
    memory: 67,
  },
  {
    id: "p-4",
    name: "Gateway",
    status: "online",
    uptime: "14d 7h 32m",
    cpu: 5,
    memory: 18,
  },
  {
    id: "p-5",
    name: "Tunnel",
    status: "online",
    uptime: "14d 7h 32m",
    cpu: 3,
    memory: 11,
  },
];

export const activeAgents: ActiveAgent[] = [
  {
    id: "a-1",
    processId: "CLU-7f3a",
    agentType: "claude",
    directive: "Migrate vector store to pgvector",
    operation: "data-pipeline",
    duration: "1h 14m",
    currentAction: "Refactoring storage adapter interface",
  },
  {
    id: "a-2",
    processId: "CDX-9e1b",
    agentType: "codex",
    directive: "Add rate limiting to Gateway API",
    operation: "gateway-service",
    duration: "27m",
    currentAction: "Implementing token bucket algorithm",
  },
  {
    id: "a-3",
    processId: "CLU-2d8c",
    agentType: "claude",
    directive: "Implement RAG context windowing",
    operation: "knowledge-graph",
    duration: "42m",
    currentAction: "Writing sliding window retriever",
  },
  {
    id: "a-4",
    processId: "CDX-4a2f",
    agentType: "codex",
    directive: "Update Tunnel auth certificates",
    operation: "allmind-core",
    duration: "8m",
    currentAction: "Regenerating TLS certs and updating config paths",
  },
];

export const quickAccessOps: Operation[] = [
  { id: "op-1", name: "allmind-core", status: "healthy" },
  { id: "op-3", name: "agent-runtime", status: "healthy" },
  { id: "op-4", name: "knowledge-graph", status: "critical" },
  { id: "op-2", name: "data-pipeline", status: "warning" },
];

// ── Data Center (Chinvex Knowledge Base) Types & Data ────────────────

export type ContextStatus = "synced" | "indexing" | "stale" | "error";

export interface ChinvexContext {
  name: string;
  aliases: string[];
  updated_at: string;
  status: ContextStatus;
  file_count: number;
  chunk_count: number;
}

export interface EvidenceChunk {
  id: string;
  content: string;
  source_file: string;
  line_number: number;
  context_name: string;
  relevance_score: number;
  chunk_type: "code" | "text" | "config";
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  context: string | null;
  result_count: number;
  timestamp: string;
}

export const chinvexContexts: ChinvexContext[] = [
  {
    name: "allmind-core-ctx",
    aliases: ["allmind", "core"],
    updated_at: "2026-02-07T06:00:00Z",
    status: "synced",
    file_count: 347,
    chunk_count: 2841,
  },
  {
    name: "data-pipeline-ctx",
    aliases: ["pipeline", "data"],
    updated_at: "2026-02-07T09:30:00Z",
    status: "indexing",
    file_count: 214,
    chunk_count: 1592,
  },
  {
    name: "agent-runtime-ctx",
    aliases: ["agents", "runtime"],
    updated_at: "2026-02-06T22:00:00Z",
    status: "synced",
    file_count: 189,
    chunk_count: 1210,
  },
  {
    name: "knowledge-graph-ctx",
    aliases: ["kg", "knowledge"],
    updated_at: "2026-02-05T18:00:00Z",
    status: "stale",
    file_count: 412,
    chunk_count: 3584,
  },
  {
    name: "gateway-ctx",
    aliases: ["gateway", "gw"],
    updated_at: "2026-02-06T20:00:00Z",
    status: "synced",
    file_count: 98,
    chunk_count: 640,
  },
  {
    name: "system-docs-ctx",
    aliases: ["docs", "documentation"],
    updated_at: "2026-02-07T04:15:00Z",
    status: "synced",
    file_count: 73,
    chunk_count: 518,
  },
  {
    name: "runbooks-ctx",
    aliases: ["runbooks", "ops"],
    updated_at: "2026-02-04T12:00:00Z",
    status: "stale",
    file_count: 31,
    chunk_count: 189,
  },
];

export const mockSearchResults: EvidenceChunk[] = [
  {
    id: "ev-1",
    content: `export async function dispatchAgent(config: AgentConfig): Promise<AgentHandle> {\n  const pool = await getAgentPool();\n  const slot = pool.acquire(config.type);\n  if (!slot) throw new PoolExhaustedError(config.type);\n  const handle = await slot.spawn(config);\n  registry.track(handle.pid, config.directive);\n  return handle;\n}`,
    source_file: "src/dispatch/dispatcher.ts",
    line_number: 47,
    context_name: "agent-runtime-ctx",
    relevance_score: 0.96,
    chunk_type: "code",
  },
  {
    id: "ev-2",
    content: `The agent dispatch system uses a pool-based allocation model. Each agent type (Claude, Codex) maintains a separate pool with configurable concurrency limits. When a dispatch request arrives, the system acquires a slot from the appropriate pool, spawns the agent process, and registers it with the PID tracker for lifecycle management.`,
    source_file: "docs/architecture/dispatch.md",
    line_number: 12,
    context_name: "system-docs-ctx",
    relevance_score: 0.91,
    chunk_type: "text",
  },
  {
    id: "ev-3",
    content: `interface AgentConfig {\n  type: "claude" | "codex";\n  directive: string;\n  operation: string;\n  timeout?: number;\n  maxRetries?: number;\n  env?: Record<string, string>;\n}`,
    source_file: "src/types/agent.ts",
    line_number: 8,
    context_name: "agent-runtime-ctx",
    relevance_score: 0.88,
    chunk_type: "code",
  },
  {
    id: "ev-4",
    content: `## Runbook: Agent Not Responding\n\n1. Check agent PID in Active Ops panel\n2. Verify heartbeat via \`GET /v1/agents/:pid/health\`\n3. If unresponsive for >60s, issue abort: \`POST /v1/agents/:pid/abort\`\n4. Check crash logs at \`/var/log/allmind/agents/:pid.log\`\n5. Re-dispatch if directive is still pending`,
    source_file: "runbooks/agent-recovery.md",
    line_number: 1,
    context_name: "runbooks-ctx",
    relevance_score: 0.82,
    chunk_type: "text",
  },
  {
    id: "ev-5",
    content: `AGENT_POOL_SIZE=8\nAGENT_TIMEOUT_MS=300000\nAGENT_HEARTBEAT_INTERVAL_MS=5000\nAGENT_MAX_RETRIES=3\nDISPATCH_QUEUE_MAX=50`,
    source_file: ".env.defaults",
    line_number: 22,
    context_name: "allmind-core-ctx",
    relevance_score: 0.78,
    chunk_type: "config",
  },
  {
    id: "ev-6",
    content: `async function handleCrash(pid: string, error: AgentCrashError) {\n  logger.error(\`Agent \${pid} crashed: \${error.message}\`);\n  const directive = registry.getDirective(pid);\n  registry.untrack(pid);\n  if (directive && directive.retries < MAX_RETRIES) {\n    await dispatchAgent({ ...directive.config, retries: directive.retries + 1 });\n  }\n}`,
    source_file: "src/dispatch/crash-handler.ts",
    line_number: 31,
    context_name: "agent-runtime-ctx",
    relevance_score: 0.74,
    chunk_type: "code",
  },
];

export const mockSearchHistory: SearchHistoryEntry[] = [
  { id: "sh-1", query: "agent dispatch pool allocation", context: "agent-runtime-ctx", result_count: 6, timestamp: "2026-02-07T10:30:00Z" },
  { id: "sh-2", query: "pgvector migration adapter", context: "data-pipeline-ctx", result_count: 4, timestamp: "2026-02-07T09:15:00Z" },
  { id: "sh-3", query: "TLS certificate rotation", context: null, result_count: 8, timestamp: "2026-02-07T08:45:00Z" },
  { id: "sh-4", query: "heartbeat monitor timeout", context: "allmind-core-ctx", result_count: 3, timestamp: "2026-02-07T07:20:00Z" },
  { id: "sh-5", query: "RAG context windowing strategy", context: "knowledge-graph-ctx", result_count: 5, timestamp: "2026-02-06T23:10:00Z" },
  { id: "sh-6", query: "rate limiter token bucket", context: "gateway-ctx", result_count: 2, timestamp: "2026-02-06T21:40:00Z" },
];

// ── Operation Intel (Repo) Types & Data ──────────────────────────────

export type EmbedDepth = "full" | "light";
export type RepoStatus = "active" | "stable" | "archived";
export type SetupResult = "succeeded" | "failed" | null;
export type EmbedStatus = "idle" | "embedding" | "stale";
export type GitStatus = "dirty" | "clean";
export type ServiceType = "daemon" | "api" | "sync" | "gateway" | "tunnel";

export interface RepoCommit {
  hash: string;
  author: string;
  date: string;
  message: string;
}

export interface RepoSetup {
  result: SetupResult;
  error: string | null;
  last_attempt: string | null;
}

export interface ChinvexStatus {
  status: EmbedStatus;
  context: string;
  files_processed: number;
  updated_at: string;
}

export interface GitInfo {
  branch: string;
  status: GitStatus;
  ahead: number;
  behind: number;
}

export interface RepoTools {
  claudeProject: boolean;
  memory: boolean;
  node: boolean;
  python: boolean;
  venv: boolean;
}

export interface Repo {
  name: string;
  path: string;
  chinvexDepth: EmbedDepth;
  status: RepoStatus;
  tags: string[];
  recentCommits: RepoCommit[];
  setup: RepoSetup;
  shimCount: number;
  testCommand: string | null;
  chinvexStatus: ChinvexStatus;
  git: GitInfo;
  tools: RepoTools;
}

export interface Service {
  name: string;
  status: ProtocolStatus;
  pid: number;
  uptime: string;
  memory: number;
  cpu: number;
  cwd: string;
  type: ServiceType;
}

export const repos: Repo[] = [
  {
    name: "allmind-core",
    path: "P:\\software\\allmind",
    chinvexDepth: "full",
    status: "active",
    tags: ["infrastructure", "daemon", "critical"],
    recentCommits: [
      { hash: "a3f8c21e", author: "claude-agent", date: "2026-02-07T10:14:00Z", message: "fix: resolve deadlock in heartbeat monitor" },
      { hash: "9f1c7a6b", author: "user", date: "2026-02-07T07:30:00Z", message: "chore: update dependency lockfile" },
      { hash: "c2d4e5f0", author: "codex-agent", date: "2026-02-06T22:45:00Z", message: "feat: add graceful shutdown handler" },
      { hash: "b1a3d7e2", author: "user", date: "2026-02-06T18:10:00Z", message: "refactor: extract config loader module" },
      { hash: "e8f2a9c1", author: "claude-agent", date: "2026-02-06T14:20:00Z", message: "fix: correct TLS cert path resolution" },
    ],
    setup: { result: "succeeded", error: null, last_attempt: "2026-02-05T08:00:00Z" },
    shimCount: 2,
    testCommand: "npm test",
    chinvexStatus: { status: "idle", context: "allmind-core-ctx", files_processed: 347, updated_at: "2026-02-07T06:00:00Z" },
    git: { branch: "main", status: "clean", ahead: 0, behind: 0 },
    tools: { claudeProject: true, memory: true, node: true, python: false, venv: false },
  },
  {
    name: "data-pipeline",
    path: "P:\\software\\data-pipeline",
    chinvexDepth: "full",
    status: "active",
    tags: ["data", "etl", "vectors"],
    recentCommits: [
      { hash: "7e2b4d9a", author: "claude-agent", date: "2026-02-07T09:40:00Z", message: "fix: resolve deadlock in sync pipeline" },
      { hash: "f3c1a8b2", author: "user", date: "2026-02-07T06:15:00Z", message: "feat: add batch retry logic" },
      { hash: "d9e0c4f7", author: "codex-agent", date: "2026-02-06T21:30:00Z", message: "refactor: pgvector adapter interface" },
      { hash: "a4b8d2e1", author: "user", date: "2026-02-06T17:00:00Z", message: "fix: memory leak in embedding cache" },
      { hash: "c7f3a1d9", author: "claude-agent", date: "2026-02-06T12:45:00Z", message: "feat: streaming ingestion endpoint" },
    ],
    setup: { result: "succeeded", error: null, last_attempt: "2026-02-06T10:00:00Z" },
    shimCount: 1,
    testCommand: "pytest",
    chinvexStatus: { status: "embedding", context: "data-pipeline-ctx", files_processed: 214, updated_at: "2026-02-07T09:30:00Z" },
    git: { branch: "feat/pgvector-migration", status: "dirty", ahead: 3, behind: 0 },
    tools: { claudeProject: true, memory: true, node: false, python: true, venv: true },
  },
  {
    name: "agent-runtime",
    path: "P:\\software\\agent-runtime",
    chinvexDepth: "light",
    status: "active",
    tags: ["agents", "orchestration"],
    recentCommits: [
      { hash: "1c9a0f3e", author: "codex-agent", date: "2026-02-07T09:00:00Z", message: "feat: add streaming response handler" },
      { hash: "5d4e8b2a", author: "user", date: "2026-02-06T23:20:00Z", message: "refactor: dispatch queue architecture" },
      { hash: "b2c7d1e8", author: "claude-agent", date: "2026-02-06T19:45:00Z", message: "fix: race condition in agent pool" },
      { hash: "8f1a3c0d", author: "user", date: "2026-02-06T15:10:00Z", message: "feat: add telemetry hooks" },
      { hash: "e4d9b2f6", author: "codex-agent", date: "2026-02-06T11:30:00Z", message: "chore: cleanup unused imports" },
    ],
    setup: { result: "succeeded", error: null, last_attempt: "2026-02-04T14:00:00Z" },
    shimCount: 0,
    testCommand: "npm test",
    chinvexStatus: { status: "idle", context: "agent-runtime-ctx", files_processed: 189, updated_at: "2026-02-06T22:00:00Z" },
    git: { branch: "main", status: "clean", ahead: 0, behind: 1 },
    tools: { claudeProject: true, memory: false, node: true, python: false, venv: false },
  },
  {
    name: "knowledge-graph",
    path: "P:\\software\\knowledge-graph",
    chinvexDepth: "full",
    status: "active",
    tags: ["knowledge", "rag", "search"],
    recentCommits: [
      { hash: "d1e5f8a3", author: "claude-agent", date: "2026-02-07T08:20:00Z", message: "feat: sliding window retriever" },
      { hash: "4b2c9d0e", author: "user", date: "2026-02-06T20:00:00Z", message: "fix: context overflow in deep queries" },
      { hash: "a8f1c3d7", author: "codex-agent", date: "2026-02-06T16:30:00Z", message: "refactor: index builder pipeline" },
      { hash: "7e3b0a2f", author: "user", date: "2026-02-06T12:00:00Z", message: "feat: hybrid search scoring" },
      { hash: "c9d4e1b5", author: "claude-agent", date: "2026-02-06T08:15:00Z", message: "fix: stale cache invalidation" },
    ],
    setup: { result: "failed", error: "ECONNREFUSED: Neo4j driver failed to connect on port 7687", last_attempt: "2026-02-07T02:00:00Z" },
    shimCount: 0,
    testCommand: null,
    chinvexStatus: { status: "stale", context: "knowledge-graph-ctx", files_processed: 412, updated_at: "2026-02-05T18:00:00Z" },
    git: { branch: "main", status: "dirty", ahead: 2, behind: 3 },
    tools: { claudeProject: false, memory: true, node: false, python: true, venv: true },
  },
  {
    name: "gateway-service",
    path: "P:\\software\\gateway",
    chinvexDepth: "light",
    status: "stable",
    tags: ["api", "proxy", "auth"],
    recentCommits: [
      { hash: "f2a8c1d4", author: "codex-agent", date: "2026-02-07T07:45:00Z", message: "feat: token bucket rate limiter" },
      { hash: "3e9b0d7a", author: "user", date: "2026-02-06T22:10:00Z", message: "refactor: consolidate auth middleware" },
      { hash: "b5c1e8f2", author: "claude-agent", date: "2026-02-06T18:30:00Z", message: "fix: CORS preflight handling" },
      { hash: "1d7a4c0e", author: "user", date: "2026-02-06T14:00:00Z", message: "chore: bump express to 5.x" },
      { hash: "9e2f3b8d", author: "codex-agent", date: "2026-02-06T10:20:00Z", message: "feat: request logging middleware" },
    ],
    setup: { result: "succeeded", error: null, last_attempt: "2026-02-03T09:00:00Z" },
    shimCount: 0,
    testCommand: "npm test",
    chinvexStatus: { status: "idle", context: "gateway-ctx", files_processed: 98, updated_at: "2026-02-06T20:00:00Z" },
    git: { branch: "main", status: "clean", ahead: 0, behind: 0 },
    tools: { claudeProject: true, memory: false, node: true, python: false, venv: false },
  },
];

export const services: Service[] = [
  { name: "ALLMIND Daemon", status: "online", pid: 1001, uptime: "14d 7h 32m", memory: 34, cpu: 12, cwd: "P:\\software\\allmind", type: "daemon" },
  { name: "Data API", status: "online", pid: 2201, uptime: "14d 7h 32m", memory: 22, cpu: 8, cwd: "P:\\software\\allmind", type: "api" },
  { name: "Data Sync", status: "degraded", pid: 2202, uptime: "6d 14h 11m", memory: 67, cpu: 45, cwd: "P:\\software\\data-pipeline", type: "sync" },
  { name: "Gateway", status: "online", pid: 3301, uptime: "14d 7h 32m", memory: 18, cpu: 5, cwd: "P:\\software\\gateway", type: "gateway" },
  { name: "Tunnel", status: "online", pid: 3302, uptime: "14d 7h 32m", memory: 11, cpu: 3, cwd: "P:\\software\\allmind", type: "tunnel" },
];

// ── Protocols Page Types & Data ──────────────────────────────────────

export type Pm2Status = "online" | "stopped" | "errored";
export type HealthCheckStatus = "online" | "offline";

export interface Pm2Process {
  type: "pm2";
  name: string;
  status: Pm2Status;
  pid: number;
  uptime_ms: number;
  memory_bytes: number;
  cpu: number;
  restarts: number;
  cwd: string;
  script: string;
}

export interface HealthCheckDetails {
  version: string;
  contexts_available: number;
  embedding_model: string;
  uptime_seconds: number;
}

export interface HealthCheck {
  type: "http";
  name: string;
  status: HealthCheckStatus;
  url: string;
  details: HealthCheckDetails;
}

export type ProtocolService = Pm2Process | HealthCheck;

export const pm2Processes: Pm2Process[] = [
  {
    type: "pm2",
    name: "ALLMIND Daemon",
    status: "online",
    pid: 1001,
    uptime_ms: 1_233_120_000, // ~14d 7h
    memory_bytes: 356_515_840, // ~340 MB
    cpu: 12.3,
    restarts: 0,
    cwd: "P:\\software\\allmind",
    script: "P:\\software\\allmind\\dist\\daemon.js",
  },
  {
    type: "pm2",
    name: "Data API",
    status: "online",
    pid: 2201,
    uptime_ms: 1_233_120_000,
    memory_bytes: 230_686_720, // ~220 MB
    cpu: 8.1,
    restarts: 2,
    cwd: "P:\\software\\allmind",
    script: "P:\\software\\allmind\\dist\\api\\server.js",
  },
  {
    type: "pm2",
    name: "Data Sync",
    status: "online",
    pid: 2202,
    uptime_ms: 562_260_000, // ~6d 14h
    memory_bytes: 702_545_920, // ~670 MB
    cpu: 45.2,
    restarts: 7,
    cwd: "P:\\software\\data-pipeline",
    script: "P:\\software\\data-pipeline\\sync\\worker.py",
  },
  {
    type: "pm2",
    name: "Gateway",
    status: "online",
    pid: 3301,
    uptime_ms: 1_233_120_000,
    memory_bytes: 188_743_680, // ~180 MB
    cpu: 5.4,
    restarts: 0,
    cwd: "P:\\software\\gateway",
    script: "P:\\software\\gateway\\dist\\index.js",
  },
  {
    type: "pm2",
    name: "Tunnel",
    status: "online",
    pid: 3302,
    uptime_ms: 1_233_120_000,
    memory_bytes: 115_343_360, // ~110 MB
    cpu: 3.0,
    restarts: 1,
    cwd: "P:\\software\\allmind",
    script: "P:\\software\\allmind\\dist\\tunnel.js",
  },
  {
    type: "pm2",
    name: "Chinvex Worker",
    status: "stopped",
    pid: 0,
    uptime_ms: 0,
    memory_bytes: 0,
    cpu: 0,
    restarts: 12,
    cwd: "P:\\software\\data-pipeline",
    script: "P:\\software\\data-pipeline\\chinvex\\embedder.py",
  },
];

export const healthChecks: HealthCheck[] = [
  {
    type: "http",
    name: "Chinvex API",
    status: "online",
    url: "http://localhost:6333/health",
    details: {
      version: "1.8.4",
      contexts_available: 7,
      embedding_model: "text-embedding-3-small",
      uptime_seconds: 1_233_120,
    },
  },
  {
    type: "http",
    name: "Neo4j Health",
    status: "offline",
    url: "http://localhost:7474/health",
    details: {
      version: "5.15.0",
      contexts_available: 0,
      embedding_model: "n/a",
      uptime_seconds: 0,
    },
  },
  {
    type: "http",
    name: "ALLMIND Gateway",
    status: "online",
    url: "http://localhost:4000/health",
    details: {
      version: "2.3.1",
      contexts_available: 5,
      embedding_model: "n/a",
      uptime_seconds: 1_233_120,
    },
  },
];
