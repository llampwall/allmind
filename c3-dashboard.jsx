import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Database, Terminal, Server, GitBranch, RefreshCw, AlertCircle, CheckCircle, Clock, Loader2, ExternalLink, Play, FolderOpen, ChevronRight, ChevronDown, Search, Zap, XCircle, StopCircle, RotateCcw, FileText, Code, TerminalSquare, Trash2, Settings } from 'lucide-react';

const API_BASE = 'http://localhost:7780';

// Status badge component
const StatusBadge = ({ status }) => {
  const styles = {
    ok: 'bg-green-500/20 text-green-400 border-green-500/30',
    running: 'bg-green-500/20 text-green-400 border-green-500/30',
    online: 'bg-green-500/20 text-green-400 border-green-500/30',
    clean: 'bg-green-500/20 text-green-400 border-green-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    errored: 'bg-red-500/20 text-red-400 border-red-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    unknown: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    stopped: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    stale: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    dirty: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    missing: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[status] || styles.unknown}`}>
      {status?.toUpperCase() || 'UNKNOWN'}
    </span>
  );
};

// Relative time display
const RelativeTime = ({ date }) => {
  if (!date) return <span className="text-gray-500">never</span>;
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  let text;
  if (diffMins < 1) text = 'just now';
  else if (diffMins < 60) text = `${diffMins}m ago`;
  else if (diffHours < 24) text = `${diffHours}h ago`;
  else text = `${diffDays}d ago`;
  
  const isStale = diffHours > 24 * 7;
  return <span className={isStale ? 'text-orange-400' : 'text-gray-400'}>{text}</span>;
};

// Format bytes
const formatBytes = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// Format uptime
const formatUptime = (ms) => {
  if (!ms) return '—';
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins % 60}m`;
  if (mins > 0) return `${mins}m`;
  return `${secs}s`;
};

// Service card for overview
const ServiceCard = ({ name, icon: Icon, status, details, actions, error, loading }) => (
  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-gray-400" />
        <span className="font-medium text-white">{name}</span>
      </div>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      ) : (
        <StatusBadge status={status} />
      )}
    </div>
    {error && (
      <div className="text-xs text-red-400 mb-2 font-mono bg-red-500/10 p-2 rounded truncate">
        {error}
      </div>
    )}
    <div className="text-sm text-gray-400 space-y-1 mb-3">
      {details.map((d, i) => (
        <div key={i} className="flex justify-between">
          <span>{d.label}</span>
          <span className="text-gray-300 truncate ml-2">{d.value}</span>
        </div>
      ))}
    </div>
    {actions && actions.length > 0 && (
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            disabled={action.disabled || loading}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {action.icon && <action.icon className="w-3 h-3" />}
            {action.label}
          </button>
        ))}
      </div>
    )}
  </div>
);

// Repo row component
const RepoRow = ({ repo, onAction }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border-b border-gray-700 last:border-0">
      <div 
        className="flex items-center gap-3 p-3 hover:bg-gray-800/50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{repo.name}</span>
            <StatusBadge status={repo.git?.status || 'unknown'} />
            {repo.git?.ahead > 0 && <span className="text-xs text-green-400">↑{repo.git.ahead}</span>}
            {repo.git?.behind > 0 && <span className="text-xs text-yellow-400">↓{repo.git.behind}</span>}
          </div>
          <div className="text-xs text-gray-500 flex gap-2 mt-0.5">
            <span>{repo.git?.branch || 'unknown'}</span>
            {repo.tools?.claudeProject && <span className="text-blue-400">claude</span>}
            {repo.tools?.venv && <span className="text-green-400">venv</span>}
            {repo.tools?.node && <span className="text-yellow-400">node</span>}
            {repo.tools?.memory && <span className="text-purple-400">memory</span>}
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onAction('open-claude', repo); }}
            className="p-1.5 hover:bg-gray-700 rounded"
            title="Open Claude"
          >
            <Zap className="w-4 h-4 text-blue-400" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onAction('open-vscode', repo); }}
            className="p-1.5 hover:bg-gray-700 rounded"
            title="Open VS Code"
          >
            <Code className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onAction('open-terminal', repo); }}
            className="p-1.5 hover:bg-gray-700 rounded"
            title="Open Terminal"
          >
            <TerminalSquare className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-10 pb-3 text-sm">
          <div className="bg-gray-800/50 rounded p-3 space-y-2">
            <div className="text-xs text-gray-500 font-mono truncate">{repo.path}</div>
            {repo.strapEntry && (
              <div className="flex gap-4 text-gray-400 text-xs">
                <span>Scope: {repo.strapEntry.scope}</span>
                <span>Shims: {repo.strapEntry.shimCount}</span>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              {repo.testCommand && (
                <button 
                  onClick={() => onAction('test', repo)}
                  className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-white flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  Run Tests
                </button>
              )}
              <button 
                onClick={() => onAction('git-pull', repo)}
                className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
              >
                Git Pull
              </button>
              {repo.tools?.memory && (
                <button 
                  onClick={() => onAction('view-memory', repo)}
                  className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded text-white"
                >
                  View Memory
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// PM2 Service row
const ServiceRow = ({ service, onAction, actionLoading }) => {
  const isPm2 = service.id?.startsWith('pm2-');
  const isOnline = service.status === 'online' || service.status === 'running';
  
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-500'}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{service.name}</span>
          <StatusBadge status={service.status} />
        </div>
        <div className="text-xs text-gray-500 flex gap-3 mt-0.5">
          {service.pid && <span>PID: {service.pid}</span>}
          {service.uptime && <span>Up: {formatUptime(service.uptime)}</span>}
          {service.memory && <span>Mem: {formatBytes(service.memory)}</span>}
          {service.restarts > 0 && <span className="text-yellow-400">Restarts: {service.restarts}</span>}
        </div>
        {service.error && <div className="text-xs text-red-400 mt-1 truncate">{service.error}</div>}
      </div>
      {isPm2 && (
        <div className="flex gap-1">
          <button 
            onClick={() => onAction('restart', service)}
            disabled={actionLoading === service.id}
            className="p-1.5 hover:bg-gray-700 rounded disabled:opacity-50"
            title="Restart"
          >
            {actionLoading === service.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <RotateCcw className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {isOnline ? (
            <button 
              onClick={() => onAction('stop', service)}
              className="p-1.5 hover:bg-gray-700 rounded"
              title="Stop"
            >
              <StopCircle className="w-4 h-4 text-gray-400" />
            </button>
          ) : (
            <button 
              onClick={() => onAction('start', service)}
              className="p-1.5 hover:bg-gray-700 rounded"
              title="Start"
            >
              <Play className="w-4 h-4 text-green-400" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Shim row
const ShimRow = ({ shim }) => (
  <div className="flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded">
    <Terminal className="w-4 h-4 text-gray-500" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-mono text-white">{shim.name}</span>
        <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">{shim.type}</span>
        {!shim.cmdExists && <span className="text-xs text-yellow-400">missing .cmd</span>}
      </div>
      <div className="text-xs text-gray-500 truncate">
        {shim.repo !== 'unknown' && <span className="mr-2">repo: {shim.repo}</span>}
        {shim.exe && <span className="font-mono">{shim.exe}</span>}
      </div>
    </div>
  </div>
);

// Doctor check row
const DoctorCheck = ({ check }) => (
  <div className="flex items-center gap-3 p-2">
    {check.passed ? (
      <CheckCircle className="w-4 h-4 text-green-400" />
    ) : (
      <XCircle className="w-4 h-4 text-red-400" />
    )}
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="text-sm text-white">{check.name}</span>
        <span className={`text-xs ${check.severity === 'critical' ? 'text-red-400' : check.severity === 'error' ? 'text-orange-400' : 'text-yellow-400'}`}>
          {check.severity}
        </span>
      </div>
      {!check.passed && check.details && (
        <div className="text-xs text-gray-500 mt-0.5">
          {JSON.stringify(check.details)}
        </div>
      )}
    </div>
  </div>
);

// Main dashboard component
export default function C3Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [health, setHealth] = useState(null);
  const [contexts, setContexts] = useState([]);
  const [repos, setRepos] = useState([]);
  const [services, setServices] = useState([]);
  const [shims, setShims] = useState({ shims: [], collisions: [], orphans: [] });
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchContext, setSearchContext] = useState('all');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // Output modal
  const [outputModal, setOutputModal] = useState(null);

  // API helper
  const api = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || res.statusText);
    }
    return res.json();
  }, []);

  // Fetch all data
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [healthData, contextsData, reposData, servicesData, shimsData] = await Promise.allSettled([
        api('/api/health'),
        api('/api/chinvex/contexts'),
        api('/api/repos'),
        api('/api/services'),
        api('/api/strap/shims'),
      ]);

      if (healthData.status === 'fulfilled') setHealth(healthData.value);
      if (contextsData.status === 'fulfilled') setContexts(contextsData.value.contexts || []);
      if (reposData.status === 'fulfilled') setRepos(reposData.value.repos || []);
      if (servicesData.status === 'fulfilled') setServices(servicesData.value.services || []);
      if (shimsData.status === 'fulfilled') setShims(shimsData.value);

      // Check for any failures
      const failures = [healthData, contextsData, reposData, servicesData, shimsData]
        .filter(r => r.status === 'rejected')
        .map(r => r.reason?.message);
      
      if (failures.length > 0 && failures.length < 5) {
        setError(`Some data failed to load: ${failures.join(', ')}`);
      } else if (failures.length === 5) {
        setError('Backend not reachable. Is c3-backend running on port 7780?');
      }

      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Run doctor
  const runDoctor = useCallback(async () => {
    try {
      const data = await api('/api/strap/doctor');
      setDoctor(data);
    } catch (err) {
      setError(`Doctor failed: ${err.message}`);
    }
  }, [api]);

  // Search
  const doSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults(null);
    try {
      const payload = { query: searchQuery, k: 10 };
      if (searchContext === 'all') {
        payload.contexts = 'all';
      } else {
        payload.context = searchContext;
      }
      const data = await api('/api/chinvex/search', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setSearchResults(data);
    } catch (err) {
      setError(`Search: ${err.message}`);
    } finally {
      setSearching(false);
    }
  };

  // Repo actions
  const handleRepoAction = async (action, repo) => {
    try {
      switch (action) {
        case 'open-claude':
          await api('/api/actions/open-claude', {
            method: 'POST',
            body: JSON.stringify({ repo: repo.name }),
          });
          break;
        case 'open-vscode':
          await api('/api/actions/open-vscode', {
            method: 'POST',
            body: JSON.stringify({ repo: repo.name }),
          });
          break;
        case 'open-terminal':
          await api('/api/actions/open-terminal', {
            method: 'POST',
            body: JSON.stringify({ repo: repo.name }),
          });
          break;
        case 'test':
          const testResult = await api(`/api/repos/${repo.name}/test`, { method: 'POST' });
          setOutputModal({
            title: `Test Results: ${repo.name}`,
            content: testResult.stdout || testResult.stderr || 'No output',
            success: testResult.passed,
          });
          break;
        case 'git-pull':
          const pullResult = await api(`/api/repos/${repo.name}/git`, {
            method: 'POST',
            body: JSON.stringify({ args: ['pull'] }),
          });
          setOutputModal({
            title: `Git Pull: ${repo.name}`,
            content: pullResult.stdout || pullResult.stderr || 'No output',
            success: pullResult.exitCode === 0,
          });
          refresh();
          break;
        case 'view-memory':
          const repoDetail = await api(`/api/repos/${repo.name}`);
          setOutputModal({
            title: `Memory: ${repo.name}`,
            content: repoDetail.memory?.state || 'No STATE.md found',
            success: true,
          });
          break;
      }
    } catch (err) {
      setError(`Action failed: ${err.message}`);
    }
  };

  // Service actions
  const handleServiceAction = async (action, service) => {
    setActionLoading(service.id);
    try {
      await api(`/api/services/${service.id}/${action}`, { method: 'POST' });
      // Refresh services after action
      const servicesData = await api('/api/services');
      setServices(servicesData.services || []);
    } catch (err) {
      setError(`Service action failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'contexts', label: 'Contexts', icon: Database },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'repos', label: 'Repos', icon: GitBranch, badge: repos.filter(r => r.git?.dirty).length || null },
    { id: 'services', label: 'Services', icon: Server, badge: services.filter(s => s.status === 'online').length || null },
    { id: 'strap', label: 'Strap', icon: Terminal },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-56 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-lg">C3</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Control Center</div>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-gray-700 rounded">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Last refresh</span>
            {lastRefresh && <RelativeTime date={lastRefresh} />}
          </div>
          <button 
            onClick={refresh}
            disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Error banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-xs hover:text-red-300">dismiss</button>
            </div>
          )}

          {/* Output Modal */}
          {outputModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-2xl w-full max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    {outputModal.success ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="font-medium">{outputModal.title}</span>
                  </div>
                  <button onClick={() => setOutputModal(null)} className="text-gray-400 hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <pre className="text-sm font-mono whitespace-pre-wrap text-gray-300">{outputModal.content}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">System Overview</h1>
              
              {/* Service cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <ServiceCard
                  name="Chinvex API"
                  icon={Database}
                  status={health?.services?.find(s => s.id === 'chinvex')?.status || 'unknown'}
                  loading={loading}
                  error={health?.services?.find(s => s.id === 'chinvex')?.error}
                  details={[
                    { label: 'Contexts', value: contexts.length || '—' },
                    { label: 'Version', value: health?.services?.find(s => s.id === 'chinvex')?.details?.version || '—' },
                  ]}
                  actions={[
                    { label: 'Search', icon: Search, onClick: () => setActiveTab('search') },
                  ]}
                />

                <ServiceCard
                  name="Strap"
                  icon={Terminal}
                  status={health?.services?.find(s => s.id === 'strap')?.status || 'unknown'}
                  loading={loading}
                  details={[
                    { label: 'Shims', value: shims.shims?.length || '—' },
                    { label: 'Collisions', value: shims.collisions?.length || 0 },
                    { label: 'Orphans', value: shims.orphans?.length || 0 },
                  ]}
                  actions={[
                    { label: 'Doctor', icon: Activity, onClick: () => { runDoctor(); setActiveTab('strap'); } },
                  ]}
                />

                <ServiceCard
                  name="Repositories"
                  icon={GitBranch}
                  status={repos.length > 0 ? 'ok' : 'unknown'}
                  loading={loading}
                  details={[
                    { label: 'Total', value: repos.length },
                    { label: 'Dirty', value: repos.filter(r => r.git?.dirty).length },
                    { label: 'With Memory', value: repos.filter(r => r.tools?.memory).length },
                  ]}
                  actions={[
                    { label: 'View All', onClick: () => setActiveTab('repos') },
                  ]}
                />

                <ServiceCard
                  name="PM2 Services"
                  icon={Server}
                  status={services.some(s => s.type === 'pm2' && s.status === 'online') ? 'running' : 'stopped'}
                  loading={loading}
                  details={[
                    { label: 'Online', value: services.filter(s => s.status === 'online').length },
                    { label: 'Stopped', value: services.filter(s => s.status === 'stopped').length },
                    { label: 'Errored', value: services.filter(s => s.status === 'errored').length },
                  ]}
                  actions={[
                    { label: 'Manage', onClick: () => setActiveTab('services') },
                  ]}
                />

                <ServiceCard
                  name="C3 Backend"
                  icon={Zap}
                  status={health ? 'running' : 'error'}
                  loading={loading}
                  details={[
                    { label: 'Host', value: health?.host?.hostname || '—' },
                    { label: 'Platform', value: health?.host?.platform || '—' },
                    { label: 'Root', value: health?.config?.strapRoot?.split('\\').pop() || '—' },
                  ]}
                />

                <ServiceCard
                  name="Cloudflare Tunnel"
                  icon={Activity}
                  status={services.find(s => s.id === 'cloudflared')?.status || 'unknown'}
                  loading={loading}
                  details={[
                    { label: 'Status', value: services.find(s => s.id === 'cloudflared')?.status || 'unknown' },
                  ]}
                />
              </div>

              {/* Quick context summary */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Chinvex Contexts ({contexts.length})
                </h2>
                {loading ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                ) : contexts.length === 0 ? (
                  <p className="text-gray-500">No contexts found</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {contexts.slice(0, 8).map(ctx => (
                      <div 
                        key={ctx.name}
                        className="bg-gray-700/50 rounded p-2 text-sm cursor-pointer hover:bg-gray-700"
                        onClick={() => { setSearchContext(ctx.name); setActiveTab('search'); }}
                      >
                        <div className="font-medium truncate">{ctx.name}</div>
                        <div className="text-xs text-gray-400">
                          <RelativeTime date={ctx.updated_at} />
                        </div>
                      </div>
                    ))}
                    {contexts.length > 8 && (
                      <div 
                        className="bg-gray-700/30 rounded p-2 text-sm text-gray-500 flex items-center justify-center cursor-pointer hover:bg-gray-700/50"
                        onClick={() => setActiveTab('contexts')}
                      >
                        +{contexts.length - 8} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contexts Tab */}
          {activeTab === 'contexts' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Chinvex Contexts</h1>
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                {loading ? (
                  <div className="p-8 flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading contexts...
                  </div>
                ) : contexts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No contexts found.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700">
                    {contexts.map(ctx => {
                      const isStale = ctx.updated_at && (new Date() - new Date(ctx.updated_at)) > 7 * 24 * 60 * 60 * 1000;
                      return (
                        <div key={ctx.name} className="flex items-center gap-3 p-3 hover:bg-gray-800/50">
                          <Database className="w-4 h-4 text-gray-500" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{ctx.name}</span>
                              <StatusBadge status={isStale ? 'stale' : 'ok'} />
                            </div>
                            {ctx.aliases?.length > 0 && (
                              <div className="text-xs text-gray-500">aliases: {ctx.aliases.join(', ')}</div>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            <RelativeTime date={ctx.updated_at} />
                          </div>
                          <button 
                            onClick={() => { setSearchContext(ctx.name); setActiveTab('search'); }}
                            className="p-1.5 hover:bg-gray-700 rounded"
                          >
                            <Search className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Search</h1>
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex gap-3 mb-4">
                  <select
                    value={searchContext}
                    onChange={(e) => setSearchContext(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  >
                    <option value="all">All contexts</option>
                    {contexts.map(ctx => (
                      <option key={ctx.name} value={ctx.name}>{ctx.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                    placeholder="Search query..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  />
                  <button
                    onClick={doSearch}
                    disabled={!searchQuery.trim() || searching}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </button>
                </div>

                {searchResults && (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-400">
                      {searchResults.total_results} results for "{searchResults.query}"
                      {searchResults.contexts_searched && ` across ${searchResults.contexts_searched.length} contexts`}
                    </div>
                    {searchResults.results?.map((r, i) => (
                      <div key={i} className="bg-gray-700/50 rounded p-3 border border-gray-600">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs bg-gray-600 px-2 py-0.5 rounded">{r.source_type || 'unknown'}</span>
                          {r.context && <span className="text-xs bg-blue-600/30 text-blue-400 px-2 py-0.5 rounded">{r.context}</span>}
                          <span className="text-xs text-gray-400 truncate flex-1">{r.source_path || r.chunk_id}</span>
                          <span className="text-xs text-gray-500">score: {r.score?.toFixed(3)}</span>
                        </div>
                        <div className="text-sm text-gray-300 font-mono whitespace-pre-wrap max-h-32 overflow-auto">
                          {r.content?.slice(0, 500)}{r.content?.length > 500 ? '...' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Repos Tab */}
          {activeTab === 'repos' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Repositories</h1>
                <div className="text-sm text-gray-400">
                  {repos.length} repos in {health?.config?.strapRoot || 'P:\\software'}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                {loading ? (
                  <div className="p-8 flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scanning repos...
                  </div>
                ) : repos.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No repos found.
                  </div>
                ) : (
                  repos.map(repo => (
                    <RepoRow key={repo.name} repo={repo} onAction={handleRepoAction} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div>
              <h1 className="text-2xl font-bold mb-6">Services</h1>
              <div className="space-y-3">
                {loading ? (
                  <div className="p-8 flex items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading services...
                  </div>
                ) : services.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 bg-gray-800 rounded-lg border border-gray-700">
                    No services found. Is PM2 running?
                  </div>
                ) : (
                  services.map(service => (
                    <ServiceRow 
                      key={service.id} 
                      service={service} 
                      onAction={handleServiceAction}
                      actionLoading={actionLoading}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Strap Tab */}
          {activeTab === 'strap' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Strap</h1>
                <button
                  onClick={runDoctor}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Run Doctor
                </button>
              </div>

              {/* Doctor Results */}
              {doctor && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
                  <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Doctor Results
                    <span className="text-sm font-normal text-gray-400">
                      {doctor.summary?.passed}/{doctor.summary?.total} passed
                    </span>
                  </h2>
                  <div className="space-y-1">
                    {doctor.checks?.map((check, i) => (
                      <DoctorCheck key={i} check={check} />
                    ))}
                  </div>
                </div>
              )}

              {/* Shims */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <h2 className="font-semibold mb-3 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Shims ({shims.shims?.length || 0})
                  </h2>
                  <div className="max-h-96 overflow-auto space-y-1">
                    {shims.shims?.length === 0 ? (
                      <p className="text-gray-500 text-sm">No shims found</p>
                    ) : (
                      shims.shims?.map((shim, i) => (
                        <ShimRow key={i} shim={shim} />
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Collisions */}
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <h2 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      Collisions ({shims.collisions?.length || 0})
                    </h2>
                    {shims.collisions?.length === 0 ? (
                      <p className="text-gray-500 text-sm">No collisions detected</p>
                    ) : (
                      <div className="space-y-2">
                        {shims.collisions?.map((c, i) => (
                          <div key={i} className="text-sm p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                            <span className="font-mono text-yellow-400">{c.shim}</span>
                            <span className="text-gray-400"> claimed by: </span>
                            <span className="text-gray-300">{c.owners?.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Orphans */}
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <h2 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-400" />
                      Orphans ({shims.orphans?.length || 0})
                    </h2>
                    {shims.orphans?.length === 0 ? (
                      <p className="text-gray-500 text-sm">No orphan shims</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {shims.orphans?.map((name, i) => (
                          <span key={i} className="text-xs font-mono px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
