import type {
  Directive,
  CompletedOp,
  Protocol,
  ActiveAgent,
  Operation,
  Priority,
  OperationStatus,
  ProtocolStatus,
  ApiTodo,
  ApiService,
  ApiRepo,
  ChinvexContext,
  EvidenceChunk,
} from "./types";

const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

// ── Mappers ─────────────────────────────────────────────────────────

function mapPriority(raw?: string): Priority {
  if (raw === "critical" || raw === "high" || raw === "medium" || raw === "low")
    return raw;
  return "medium";
}

function mapTodoToDirective(t: ApiTodo): Directive {
  const priority = mapPriority(t.priority);
  return {
    id: t.id,
    title: t.text,
    operation: t.repo || "unassigned",
    priority,
    completed: t.status === "complete",
    isBlocker: priority === "critical",
    isHighROI: priority === "high",
    isUpNext: false,
  };
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDuration(startedAt?: string): string {
  if (!startedAt) return "0m";
  const ms = Date.now() - new Date(startedAt).getTime();
  return formatUptime(ms);
}

function mapServiceToProtocol(s: ApiService): Protocol {
  const statusMap: Record<string, ProtocolStatus> = {
    online: "online",
    stopping: "degraded",
    stopped: "offline",
    errored: "offline",
    launching: "degraded",
  };

  const nameMap: Record<string, { display: string; isPrimary: boolean }> = {
    allmind: { display: "ALLMIND Daemon", isPrimary: true },
    "chinvex-gateway": { display: "Data API", isPrimary: false },
    "chinvex-sync": { display: "Data Sync", isPrimary: false },
    "chinvex-tunnel": { display: "Tunnel", isPrimary: false },
  };

  const mapped = nameMap[s.name] || { display: s.name, isPrimary: false };

  const TOTAL_RAM_GB = 1; // display scale — set to 64 for real system %
  const rawMem = s.memory ?? 0;
  const mem = Math.round((rawMem / 1024 / 1024 / 1024 / TOTAL_RAM_GB) * 100);

  return {
    id: s.id ?? `p-${s.name}`,
    name: mapped.display,
    status: statusMap[s.status] || "offline",
    uptime: s.uptime ? formatUptime(s.uptime) : "—",
    cpu: s.cpu ?? 0,
    memory: mem,
    isPrimary: mapped.isPrimary,
  };
}

function mapRepoToOperation(r: ApiRepo): Operation {
  let status: OperationStatus = "healthy";
  if (r.setup?.result === "failed") status = "critical";
  else if (r.git?.dirty) status = "warning";
  return {
    id: `op-${r.name}`,
    name: r.name,
    status,
  };
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const ms = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Public API ──────────────────────────────────────────────────────

export async function fetchDirectives(): Promise<Directive[]> {
  const { todos } = await get<{ todos: ApiTodo[] }>(
    "/todos?include_completed=true",
  );
  const directives = todos.map(mapTodoToDirective);

  let upNextCount = 0;
  for (const d of directives) {
    if (!d.completed && !d.isBlocker && upNextCount < 2) {
      d.isUpNext = true;
      upNextCount++;
    }
  }

  return directives;
}

export async function fetchProtocols(): Promise<Protocol[]> {
  const { services } = await get<{ services: ApiService[] }>("/services");
  return services
    .filter((s) => s.type === "pm2")
    .map(mapServiceToProtocol);
}

export async function fetchOperations(): Promise<Operation[]> {
  const { repos } = await get<{ repos: ApiRepo[] }>("/repos");
  return repos.map(mapRepoToOperation);
}

export async function fetchActiveAgents(): Promise<ActiveAgent[]> {
  const { todos } = await get<{ todos: ApiTodo[] }>("/todos");
  return todos
    .filter((t) => t.status === "in-progress")
    .map((t) => ({
      id: t.id,
      processId: t.agent_pid || "—",
      agentType: (t.agent_type as "claude" | "codex") || "claude",
      directive: t.text,
      operation: t.repo || "unassigned",
      duration: formatDuration(t.started_at),
      currentAction: t.current_action || "Working...",
    }));
}

export async function fetchCompletedOps(): Promise<CompletedOp[]> {
  const { repos } = await get<{ repos: ApiRepo[] }>("/repos");

  interface CommitWithDate extends CompletedOp {
    _date: string;
  }

  const allCommits: CommitWithDate[] = [];

  for (const repo of repos) {
    if (!repo.recentCommits) continue;
    for (const c of repo.recentCommits.slice(0, 3)) {
      allCommits.push({
        id: `${repo.name}-${c.hash}`,
        message: c.message,
        operation: repo.name,
        hash: c.hash?.slice(0, 7) || "",
        timestamp: timeAgo(c.date),
        _date: c.date || "",
      });
    }
  }

  allCommits.sort(
    (a, b) => new Date(b._date).getTime() - new Date(a._date).getTime(),
  );

  return allCommits.slice(0, 5);
}

export async function fetchRepos(): Promise<ApiRepo[]> {
  const { repos } = await get<{ repos: ApiRepo[] }>("/repos");
  return repos;
}

export async function fetchServices(): Promise<ApiService[]> {
  const { services } = await get<{ services: ApiService[] }>("/services");
  return services;
}

export async function fetchChinvexContexts(): Promise<ChinvexContext[]> {
  const { contexts } = await get<{ contexts: ChinvexContext[] }>("/chinvex/contexts");
  return contexts;
}

export async function searchChinvex(
  query: string,
  context: string | null,
  k: number = 10
): Promise<EvidenceChunk[]> {
  const payload: { query: string; k: number; context?: string } = { query, k };
  if (context) payload.context = context;

  const res = await fetch(`${BASE}/chinvex/evidence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Search failed: ${res.status}`);

  const data = await res.json();
  return data.chunks || [];
}

// ── Mutations ───────────────────────────────────────────────────────

export async function toggleDirective(id: string, completed: boolean) {
  await fetch(`${BASE}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: completed ? "complete" : "open",
    }),
  });
}

export async function addDirective(
  title: string,
  operation: string,
  priority: Priority,
) {
  await fetch(`${BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: title,
      repo: operation,
      priority,
    }),
  });
}

export async function abortAgent(todoId: string) {
  await fetch(`${BASE}/todos/${todoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "failed",
      notes: "Aborted from dashboard",
    }),
  });
}

export async function deleteDirective(id: string) {
  await fetch(`${BASE}/todos/${id}`, {
    method: "DELETE",
  });
}

export async function executeTask(
  id: string,
  title: string,
  operation: string,
) {
  // Mark task as in-progress
  await fetch(`${BASE}/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "in-progress",
    }),
  });

  // Launch Claude with task data
  await fetch(`${BASE}/actions/open-claude`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      repo: operation,
      taskData: { id, text: title, repo: operation },
    }),
  });
}

export async function launchAgent(
  todoId: string,
  text: string,
  repo: string,
) {
  await fetch(`${BASE}/actions/open-claude`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      repo,
      taskData: { id: todoId, text, repo },
    }),
  });
}

export async function refreshData() {
  // Hooks handle re-fetching — placeholder for Express-side cache clear
}

export async function rebootSystem() {
  // Restart allmind-ui process
  try {
    // First, fetch services to find allmind-ui ID
    const { services } = await get<{ services: ApiService[] }>("/services");
    const allmindUi = services.find((s) => s.name === "allmind-ui");

    if (!allmindUi) {
      console.warn("allmind-ui service not found");
      return;
    }

    // Restart the service
    await fetch(`${BASE}/services/${allmindUi.id}/restart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    // Show a message that the UI will reload
    alert("⚡ UI restart initiated\n\nPage will reload in 3 seconds...");

    // Reload the page after a delay to allow the service to restart
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  } catch (error) {
    console.error("Failed to restart allmind-ui:", error);
    alert("❌ Failed to restart UI service");
  }
}
