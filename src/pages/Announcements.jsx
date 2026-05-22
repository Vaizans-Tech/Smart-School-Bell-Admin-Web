import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import { WS_ANNOUNCE_URL } from '../config';
import { useSchool } from '../context/SchoolContext';

const glass = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 8px 32px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
};

const inputStyle = {
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(199,210,254,0.8)',
};

const empty = { title: '', message: '', priority: 0 };

export default function Announcements() {
  const { selectedSchool } = useSchool();
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);


  const load = useCallback(async () => {
    if (!selectedSchool) return;
    const { data } = await api.get('/api/announcements/admin/all', {
      params: { school: selectedSchool },
    });
    setList(data);
    setLoaded(true);
  }, [selectedSchool]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedSchool) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const url = new URL(WS_ANNOUNCE_URL);
    url.searchParams.set('school', selectedSchool);
    url.searchParams.set('token', token);

    const ws = new WebSocket(url.toString());
    ws.onmessage = () => {
      load();
    };

    return () => {
      ws.close();
    };
  }, [selectedSchool, load]);

  const send = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/announcements', { ...form, school_name: selectedSchool });
      setForm(empty);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
    setSaving(false);
  };

  const del = async id => {
    if (!confirm('Delete?')) return;
    await api.delete(`/api/announcements/${id}`);
    load();
  };

  const priorityBadge = p =>
    p === 2 ? (
      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-600">
        Urgent
      </span>
    ) : p === 1 ? (
      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-orange-100 text-orange-600">
        High
      </span>
    ) : null;

  return (
    <div
      className="min-h-screen relative p-4 sm:p-6 space-y-5"
      style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 50%, #ede9fe 100%)' }}
    >
      {/* Background blobs */}
      <div
        className="fixed top-[-5%] right-[-5%] w-80 h-80 bg-blue-300 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ animation: 'blob 10s infinite ease-in-out' }}
      />
      <div
        className="fixed bottom-[10%] left-[-5%] w-64 h-64 bg-indigo-300 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ animation: 'blob 12s infinite ease-in-out', animationDelay: '3s' }}
      />

      {/* Header */}
      <div
        className="rounded-2xl px-5 py-4 transition-all duration-500"
        style={{
          ...glass,
          
          
        }}
      >
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Announcements</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {selectedSchool
            ? <span className="font-medium text-indigo-600">{selectedSchool}</span>
            : 'Select a school'}
        </p>
      </div>

      {/* Send Form */}
      <div
        className="rounded-2xl p-4 sm:p-5 transition-all duration-500"
        style={{
          ...glass,
          
          
          
        }}
      >
        <h2 className="text-sm font-semibold text-gray-700 mb-4">New Announcement</h2>
        <form onSubmit={send} className="space-y-3">
          <input
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
            style={inputStyle}
            placeholder="Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(199,210,254,0.8)')}
            required
          />
          <textarea
            className="w-full rounded-lg px-3 py-2.5 text-sm resize-none outline-none transition-all"
            style={inputStyle}
            rows={3}
            placeholder="Message (optional)"
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(199,210,254,0.8)')}
          />
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
              style={inputStyle}
              value={form.priority}
              onChange={e => setForm({ ...form, priority: parseInt(e.target.value) })}
              onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(199,210,254,0.8)')}
            >
              <option value={0}>Normal</option>
              <option value={1}>High Priority</option>
              <option value={2}>Urgent</option>
            </select>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none px-5 py-2.5 text-white text-sm font-medium rounded-xl disabled:opacity-60 transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
              }}
            >
              {saving ? 'Sending…' : 'Send Announcement'}
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      <div
        className="rounded-2xl overflow-hidden transition-all duration-500"
        style={{
          ...glass,
          
          
          
        }}
      >
        <div
          className="px-4 sm:px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.6)' }}
        >
          <h2 className="text-sm font-semibold text-gray-700">History</h2>
        </div>

        <div>
          {list.map((a, i) => (
            <div
              key={a.id}
              className="px-4 sm:px-5 py-4 flex items-start justify-between gap-3 transition-colors hover:bg-white/30"
              style={{
                borderBottom: i < list.length - 1 ? '1px solid rgba(255,255,255,0.5)' : 'none',
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-800">{a.title}</p>
                  {priorityBadge(a.priority)}
                </div>
                {a.message && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.message}</p>
                )}
                <p className="text-xs text-gray-400 mt-1.5">
                  {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => del(a.id)}
                className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}

          {list.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-gray-400">
              No announcements yet
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(20px,-20px) scale(1.05); }
          66% { transform: translate(-15px,15px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
