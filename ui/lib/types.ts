// ── Frontend types (what components consume) ────────────────────────

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

// ── Raw API response types (what Express returns) ───────────────────

export interface ApiTodo {
  id: string;
  text: string;
  repo?: string;
  priority?: string;
  status?: "open" | "in-progress" | "complete" | "failed";
  completed_at?: string;
  created_at?: string;
  started_at?: string;
  notes?: string;
  agent_pid?: string;
  agent_type?: string;
  current_action?: string;
}

export interface ApiService {
  id: string;
  name: string;
  type: string;
  status: string;
  pm2Id?: number;
  pid?: number;
  uptime?: number | null;
  restarts?: number;
  cpu?: number;
  memory?: number;
  cwd?: string;
  script?: string;
  url?: string;
  error?: string;
  details?: unknown;
  pm2_env?: {
    pm_uptime?: number;
    restart_time?: number;
    [key: string]: unknown;
  };
  monit?: {
    cpu?: number;
    memory?: number;
  };
}

export interface ApiRepo {
  name: string;
  path: string;
  status?: string;
  chinvex_context?: string;
  chinvex_depth?: string;
  tags?: string[];
  setup?: {
    result?: string;
    error?: string | null;
    last_attempt?: string | null;
  };
  recentCommits?: ApiCommit[];
  git?: {
    branch?: string;
    status?: string;
    dirty?: boolean;
    commits?: ApiCommit[];
    ahead?: number;
    behind?: number;
  };
  shimCount?: number;
  testCommand?: string | null;
  chinvexStatus?: {
    status?: string;
    context?: string;
    files_processed?: number;
    updated_at?: string;
  };
}

export interface ApiCommit {
  hash: string;
  message: string;
  author?: string;
  date?: string;
  relative?: string;
}

// From mock-data.ts - used by data-center page
export type ContextStatus = "synced" | "indexing" | "stale" | "error";

export interface ChinvexContext {
  name: string;
  aliases: string[];
  updated_at: string;
  status?: ContextStatus;
  file_count?: number;
  chunk_count?: number;
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
