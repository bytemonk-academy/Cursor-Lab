import { useEffect, useState } from 'react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function GradientBadge() {
  return (
    <div className="relative w-32 h-32 sm:w-40 sm:h-40 byte-float">
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#ff6a3d] via-[#ff2ddf] to-[#8e5bff] opacity-80 blur-[2px]" />
      <div className="absolute inset-[3px] rounded-full bg-gradient-to-b from-[#05000b] via-[#05000b] to-[#13081f]" />
      <div className="absolute inset-[18%] rounded-full border border-dashed border-[#ffb199]/60 byte-orbit-spin" />
      <div className="absolute inset-[24%] rounded-3xl border border-[#ff6a3d]/70 shadow-[0_0_28px_rgba(255,106,61,0.7)]" />
      <div className="absolute inset-[38%_26%_18%_26%] rounded-[34px_34px_70px_70px] border-2 border-[#ff2ddf] shadow-[0_0_30px_rgba(255,45,223,0.7)]" />
      <div className="absolute left-[30%] top-[32%] w-2.5 h-2.5 rounded-full bg-[#ff6a3d] shadow-[0_0_18px_rgba(255,106,61,0.9)]" />
      <div className="absolute right-[30%] top-[32%] w-2.5 h-2.5 rounded-full bg-[#ff6a3d] shadow-[0_0_18px_rgba(255,106,61,0.9)]" />
      <div className="absolute left-[42%] right-[42%] top-[36%] bottom-[36%] border-l border-r border-[#ffb7ff]/50" />
      <div className="absolute left-[24%] bottom-[18%] right-[24%] h-[3px] rounded-full bg-gradient-to-r from-[#ff6a3d] via-[#ff2ddf] to-[#8e5bff] shadow-[0_0_20px_rgba(255,99,175,0.9)]" />
      <div className="absolute left-1/2 -translate-x-1/2 -top-[12%] w-6 h-6 rounded-full border-2 border-[#ffb199] shadow-[0_0_18px_rgba(255,177,153,0.8)]" />
    </div>
  );
}

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('tf_token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('tf_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const fetchMe = async () => {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('tf_user', JSON.stringify(data.user));
    };
    fetchMe();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loginOrRegister = async (mode, payload) => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('tf_token', data.token);
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    setLoading(false);
    return data;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
  };

  return { token, user, loading, loginOrRegister, logout };
}

const MOCK_PROJECTS = [
  {
    id: 'p1',
    name: 'Cursor Autopilot',
    code: 'AUTOPILOT',
    accent: 'from-[#ff6a3d] to-[#ffb199]',
    tasks: [
      { id: 't1', title: 'Design task schema', status: 'In Progress' },
      { id: 't2', title: 'Wire JWT guard middleware', status: 'Blocked' },
      { id: 't3', title: 'Implement optimistic UI for drag', status: 'Todo' },
    ],
  },
  {
    id: 'p2',
    name: 'RAG Playground',
    code: 'RAG-LAB',
    accent: 'from-[#ff2ddf] to-[#fda4ff]',
    tasks: [
      { id: 't4', title: 'Setup collection presets', status: 'In Review' },
      { id: 't5', title: 'Add latency telemetry chips', status: 'Done' },
    ],
  },
  {
    id: 'p3',
    name: 'ByteMonk Website',
    code: 'BYTEMONK',
    accent: 'from-[#8e5bff] to-[#38bdf8]',
    tasks: [
      { id: 't6', title: 'Refine hero animation curve', status: 'Todo' },
      { id: 't7', title: 'Dark/light toggle microcopy', status: 'Todo' },
    ],
  },
];

function Dashboard({ user, onLogout }) {
  const totalTasks = MOCK_PROJECTS.reduce(
    (sum, project) => sum + project.tasks.length,
    0
  );

  return (
    <div className="relative min-h-screen overflow-hidden px-4 sm:px-8 py-6 text-slate-50">
      <div className="byte-orbit" />

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <GradientBadge />
          <div>
            <p className="text-[0.7rem] tracking-[0.3em] uppercase text-slate-400">
              ByteMonk TaskFlow
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              <span className="byte-gradient-text">Projects</span> overview
            </h1>
            <div className="mt-1 flex items-center gap-4 text-xs sm:text-[0.8rem] text-slate-400">
              <p>
                Signed in as <span className="text-slate-100">{user.email}</span>
              </p>
              <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/[0.04] px-3 py-0.5 text-[0.68rem] font-medium">
                <span className="text-slate-300">Tasks</span>
                <span className="byte-gradient-text text-[0.75rem]">{totalTasks}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-slate-100 hover:bg-white/[0.08] transition"
        >
          Sign out
        </button>
      </div>

      <div className="relative rounded-[28px] border border-white/10 bg-black/40 px-5 sm:px-7 py-5 sm:py-7 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
        <div className="absolute -inset-10 opacity-60 pointer-events-none">
          <div className="h-full w-full rounded-[40px] bg-[radial-gradient(circle_at_0%_0%,rgba(255,106,61,0.4),transparent_65%),radial-gradient(circle_at_100%_0%,rgba(255,45,223,0.4),transparent_60%),radial-gradient(circle_at_50%_100%,rgba(142,91,255,0.45),transparent_55%)] blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3 mb-5">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">
              Active projects
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Just layout for now – wire this to real CRUD later.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ff6a3d] via-[#ff2ddf] to-[#8e5bff] px-4 py-1.5 text-[0.72rem] font-medium shadow-[0_18px_40px_rgba(0,0,0,0.85)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            New project
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MOCK_PROJECTS.map((project) => (
            <div
              key={project.id}
              className="relative rounded-2xl border border-white/15 bg-white/[0.02] px-4 py-4 sm:px-5 sm:py-5 overflow-hidden hover:border-white/40 hover:bg-white/[0.03] transition-colors"
            >
              <div
                className={`absolute -top-12 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${project.accent} opacity-40 blur-2xl`}
              />

              <div className="relative flex items-center justify-between gap-2 mb-3">
                <div>
                  <p className="text-[0.65rem] font-mono uppercase tracking-[0.22em] text-slate-400">
                    {project.code}
                  </p>
                  <p className="text-sm sm:text-[0.95rem] font-medium text-slate-50">
                    {project.name}
                  </p>
                </div>
                <span className="text-[0.6rem] text-slate-400">Demo-only layout</span>
              </div>

              <div className="relative mt-3 space-y-1.5">
                {project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-xl bg-black/40 border border-white/10 px-3 py-2"
                  >
                    <p className="text-[0.7rem] text-slate-200 truncate">{task.title}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState('login');
  const { user, loading, loginOrRegister, logout } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload =
      mode === 'register'
        ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password };
    await loginOrRegister(mode, payload);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
  };

  if (user) {
    return <Dashboard user={user} onLogout={logout} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 sm:px-6 py-10 text-slate-50">
      <div className="byte-orbit" />

      <div className="absolute inset-x-0 top-0 pointer-events-none">
        <div className="mx-auto h-40 w-[640px] max-w-full opacity-70 blur-3xl bg-gradient-to-r from-[#ff6a3d]/40 via-[#ff2ddf]/45 to-[#8e5bff]/30" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="relative rounded-[26px] border border-white/12 bg-gradient-to-b from-[#0b0516]/95 via-[#080212]/98 to-[#05000b]/98 shadow-[0_26px_90px_rgba(0,0,0,0.8)] p-[1px]">
          <div className="byte-glow-ring byte-pulse-soft rounded-[26px]" />

          <div className="relative z-10 rounded-[25px] px-6 sm:px-7 py-7 sm:py-8 flex flex-col gap-6 backdrop-blur-2xl bg-gradient-to-b from-white/7 via-white/3 to-white/[0.03]">
            <div className="flex flex-col items-center gap-4 text-center">
              <GradientBadge />
              <div className="space-y-1.5">
                <p className="text-[0.7rem] tracking-[0.25em] uppercase text-slate-400">
                  ByteMonk TaskFlow
                </p>
                <h1 className="text-2xl sm:text-[1.6rem] font-semibold tracking-tight">
                  <span className="byte-gradient-text">Sign in</span> to your workspace
                </h1>
                <p className="text-xs sm:text-[0.8rem] text-slate-300/80">
                  A compact, focused auth screen that drops you straight into your projects +
                  tasks dashboard.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="grid gap-4 mt-1">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-300"
                  >
                    Display name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    autoComplete="name"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-50 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] outline-none transition focus:border-[#ff6a3d] focus:shadow-[0_0_0_1px_rgba(255,106,61,0.6),0_16px_36px_rgba(0,0,0,0.7)] placeholder:text-slate-500"
                    placeholder="Ada Lovelace"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-300"
                >
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-50 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] outline-none transition focus:border-[#ff2ddf] focus:shadow-[0_0_0_1px_rgba(255,45,223,0.6),0_16px_36px_rgba(0,0,0,0.7)] placeholder:text-slate-500"
                  placeholder="you@bytemonk.dev"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-300"
                >
                  Workspace password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-50 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] outline-none transition focus:border-[#8e5bff] focus:shadow-[0_0_0_1px_rgba(142,91,255,0.6),0_16px_36px_rgba(0,0,0,0.7)] placeholder:text-slate-500"
                  placeholder="•••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative mt-1 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff6a3d] via-[#ff2ddf] to-[#8e5bff] px-4 text-sm font-medium tracking-wide text-white shadow-[0_20px_45px_rgba(0,0,0,0.75)] outline-none transition hover:shadow-[0_26px_60px_rgba(0,0,0,0.95)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ff6a3d] focus-visible:ring-offset-[#05000b] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <span className="h-3 w-3 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                      Authenticating…
                    </>
                  ) : mode === 'login' ? (
                    <>Enter dashboard</>
                  ) : (
                    <>Create ByteMonk seat</>
                  )}
                </span>
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-400">
              <button
                type="button"
                onClick={toggleMode}
                className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-slate-300/90 hover:text-white/90 transition"
              >
                {mode === 'login' ? 'New here? Create an account' : 'Already onboarded? Log in'}
              </button>

              <p className="text-[0.7rem] text-slate-400/80">
                You will be dropped into a{' '}
                <span className="byte-gradient-text font-semibold">projects + tasks</span> view after
                auth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
