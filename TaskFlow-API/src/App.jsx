import { useEffect, useState } from 'react';
import './App.css';

import bytemonkLogo from './assets/BYTEMONK_LOGO.png';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function ByteMonkLogo() {
  return (
    <img
      src={bytemonkLogo}
      alt="ByteMonk"
      className="w-24 h-24 object-contain byte-float select-none"
    />
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

function ProjectTasks({ projectId, tasks, onAddTask, onUpdateTask, onDeleteTask }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState('');
  const [editingTitle, setEditingTitle] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(projectId, newTaskTitle.trim());
    setNewTaskTitle('');
  };

  const startEdit = (task) => {
    setEditingTaskId(task._id);
    setEditingTitle(task.title || '');
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (editingTaskId && editingTitle.trim()) {
      onUpdateTask(projectId, editingTaskId, editingTitle.trim());
      setEditingTaskId('');
      setEditingTitle('');
    }
  };

  const cancelEdit = () => {
    setEditingTaskId('');
    setEditingTitle('');
  };

  return (
    <div className="mt-3 space-y-2">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add task…"
          className="flex-1 min-w-0 rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-[0.7rem] text-slate-100 placeholder:text-slate-500 outline-none focus:border-[#ff6a3d]/60"
        />
        <button
          type="submit"
          className="rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-[0.65rem] font-medium text-slate-200 hover:bg-white/[0.1] transition"
        >
          Add
        </button>
      </form>
      <div className="space-y-1.5">
        {tasks.map((task) => (
          <div
            key={task._id}
            className="flex items-center justify-between gap-2 rounded-lg bg-black/40 border border-white/10 px-2.5 py-1.5 group"
          >
            {editingTaskId === task._id ? (
              <form onSubmit={submitEdit} className="flex flex-1 gap-1.5">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  autoFocus
                  className="flex-1 min-w-0 rounded border border-white/15 bg-white/[0.04] px-2 py-1 text-[0.7rem] text-slate-100 outline-none focus:border-[#ff2ddf]/60"
                />
                <button
                  type="submit"
                  className="text-[0.6rem] text-sky-300 hover:text-sky-200"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-[0.6rem] text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <p className="text-[0.7rem] text-slate-200 truncate flex-1 min-w-0">
                  {task.title}
                </p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => startEdit(task)}
                    className="text-[0.6rem] text-slate-400 hover:text-sky-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTask(projectId, task._id)}
                    className="text-[0.6rem] text-slate-400 hover:text-rose-300"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout, token }) {
  const [projects, setProjects] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [projectForm, setProjectForm] = useState({
    name: '',
    code: '',
    description: '',
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API_BASE}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjects(data.projects || []);
    };
    load();
  }, [token]);

  const createProject = async () => {
    setEditingId('');
    setProjectForm({
      name: '',
      code: '',
      description: '',
    });
    setIsFormOpen(true);
  };

  const editProject = (project) => {
    setEditingId(project._id);
    setProjectForm({
      name: project.name || '',
      code: project.code || '',
      description: project.description || '',
    });
    setIsFormOpen(true);
  };

  const onProjectFormChange = (e) => {
    setProjectForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitProjectForm = async (e) => {
    e.preventDefault();
    const body = {
      name: projectForm.name.trim(),
      code: projectForm.code.trim(),
      description: projectForm.description.trim(),
    };

    if (!editingId) {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setProjects((prev) => [data.project, ...prev]);
    } else {
      const res = await fetch(`${API_BASE}/api/projects/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setProjects((prev) => prev.map((p) => (p._id === editingId ? data.project : p)));
    }

    setIsFormOpen(false);
  };

  const deleteProject = async (id) => {
    await fetch(`${API_BASE}/api/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setProjects((prev) => prev.filter((p) => p._id !== id));
  };

  const totalTasks = projects.reduce(
    (sum, p) => sum + (Array.isArray(p.tasks) ? p.tasks.length : 0),
    0
  );

  const addTask = async (projectId, title) => {
    if (!title || !title.trim()) return;
    const res = await fetch(`${API_BASE}/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: title.trim() }),
    });
    const data = await res.json();
    setProjects((prev) =>
      prev.map((p) =>
        p._id === projectId
          ? { ...p, tasks: [...(p.tasks || []), data.task] }
          : p
      )
    );
  };

  const updateTask = async (projectId, taskId, title) => {
    if (!title || !title.trim()) return;
    const res = await fetch(
      `${API_BASE}/api/projects/${projectId}/tasks/${taskId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim() }),
      }
    );
    const data = await res.json();
    setProjects((prev) =>
      prev.map((p) =>
        p._id === projectId
          ? {
              ...p,
              tasks: (p.tasks || []).map((t) =>
                t._id === taskId ? data.task : t
              ),
            }
          : p
      )
    );
  };

  const deleteTask = async (projectId, taskId) => {
    await fetch(
      `${API_BASE}/api/projects/${projectId}/tasks/${taskId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setProjects((prev) =>
      prev.map((p) =>
        p._id === projectId
          ? { ...p, tasks: (p.tasks || []).filter((t) => t._id !== taskId) }
          : p
      )
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 sm:px-8 py-6 text-slate-50">
      <div className="byte-orbit" />

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <ByteMonkLogo />
          <div>
            <p className="text-[0.7rem] tracking-[0.3em] uppercase text-slate-400">
              ByteMonk TaskFlow
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              <span className="byte-gradient-text">Projects</span> overview
            </h1>
            <div className="mt-1 flex items-center gap-4 text-xs sm:text-[0.8rem] text-slate-400">
              <span>Signed in as <span className="text-slate-100">{user.email}</span></span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/[0.04] px-2.5 py-0.5">
                <span className="text-slate-300">Tasks</span>
                <span className="byte-gradient-text font-medium">{totalTasks}</span>
              </span>
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
              Create projects and add tasks under each.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={createProject}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ff6a3d] via-[#ff2ddf] to-[#8e5bff] px-4 py-1.5 text-[0.72rem] font-medium shadow-[0_18px_40px_rgba(0,0,0,0.85)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              New project
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="relative rounded-2xl border border-white/15 bg-white/[0.02] px-4 py-4 sm:px-5 sm:py-5 overflow-hidden hover:border-white/40 hover:bg-white/[0.03] transition-colors"
            >
              <div
                className="absolute -top-12 -right-10 h-28 w-28 rounded-full bg-gradient-to-br from-[#ff6a3d] via-[#ff2ddf] to-[#8e5bff] opacity-40 blur-2xl"
              />

              <div className="relative flex items-center justify-between gap-2 mb-3">
                <div>
                  <p className="text-[0.65rem] font-mono uppercase tracking-[0.22em] text-slate-400">
                    {project.code || 'PROJECT'}
                  </p>
                  <p className="text-sm sm:text-[0.95rem] font-medium text-slate-50">
                    {project.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => editProject(project)}
                    className="text-[0.6rem] text-slate-400 hover:text-sky-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProject(project._id)}
                    className="text-[0.6rem] text-slate-400 hover:text-rose-300 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {(project.description || '').trim() && (
                <p className="text-[0.65rem] text-slate-500 line-clamp-2 mb-2">
                  {project.description}
                </p>
              )}
              <ProjectTasks
                projectId={project._id}
                tasks={project.tasks || []}
                onAddTask={addTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            </div>
          ))}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md px-[1px] rounded-3xl bg-gradient-to-br from-[#ff6a3d]/50 via-[#ff2ddf]/40 to-[#8e5bff]/40 shadow-[0_30px_90px_rgba(0,0,0,0.9)]">
            <div className="absolute inset-0 rounded-3xl byte-orbit opacity-40 pointer-events-none" />
            <div className="relative rounded-[22px] bg-[#05000b]/95 px-6 py-6 sm:px-7 sm:py-7">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-[0.7rem] tracking-[0.25em] uppercase text-slate-400">
                    {editingId ? 'Edit project' : 'New project'}
                  </p>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-50">
                    <span className="byte-gradient-text">
                      {editingId ? 'Update' : 'Create'}
                    </span>{' '}
                    ByteMonk space
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-100 transition"
                >
                  Close
                </button>
              </div>

              <form onSubmit={submitProjectForm} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="project-name"
                    className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-300"
                  >
                    Project name
                  </label>
                  <input
                    id="project-name"
                    name="name"
                    value={projectForm.name}
                    onChange={onProjectFormChange}
                    className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-slate-50 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] outline-none transition focus:border-[#ff6a3d] focus:shadow-[0_0_0_1px_rgba(255,106,61,0.7),0_16px_40px_rgba(0,0,0,0.9)] placeholder:text-slate-500"
                    placeholder="Sprint Board, RAG Playground…"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="project-code"
                    className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-300"
                  >
                    Project code
                  </label>
                  <input
                    id="project-code"
                    name="code"
                    value={projectForm.code}
                    onChange={onProjectFormChange}
                    className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-slate-50 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] outline-none transition focus:border-[#ff2ddf] focus:shadow-[0_0_0_1px_rgba(255,45,223,0.7),0_16px_40px_rgba(0,0,0,0.9)] placeholder:text-slate-500 uppercase"
                    placeholder="AUTOPILOT"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="project-description"
                    className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-300"
                  >
                    Description (optional)
                  </label>
                  <textarea
                    id="project-description"
                    name="description"
                    rows={3}
                    value={projectForm.description}
                    onChange={onProjectFormChange}
                    className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-slate-50 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] outline-none transition focus:border-[#8e5bff] focus:shadow-[0_0_0_1px_rgba(142,91,255,0.7),0_16px_40px_rgba(0,0,0,0.9)] placeholder:text-slate-500 resize-none"
                    placeholder="Short context for how you use this space in demos."
                  />
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.02] px-4 py-2 text-xs font-medium text-slate-200 hover:bg-white/[0.05] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-[#ff6a3d] via-[#ff2ddf] to-[#8e5bff] px-5 py-2 text-xs font-medium text-white shadow-[0_20px_45px_rgba(0,0,0,0.85)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.95)] transition"
                  >
                    {editingId ? 'Save changes' : 'Create project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [mode, setMode] = useState('login');
  const { token, user, loading, loginOrRegister, logout } = useAuth();
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
    return <Dashboard user={user} onLogout={logout} token={token} />;
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
              <ByteMonkLogo />
              <div className="space-y-1.5">
                <p className="text-[0.7rem] tracking-[0.25em] uppercase text-slate-400">
                  ByteMonk TaskFlow
                </p>
                <h1 className="text-2xl sm:text-[1.6rem] font-semibold tracking-tight">
                  <span className="byte-gradient-text">Sign in</span> to your workspace
                </h1>
                <p className="text-xs sm:text-[0.8rem] text-slate-300/80">
                TaskFlow is a lightweight workspace designed to help teams organize projects and manage tasks.
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
