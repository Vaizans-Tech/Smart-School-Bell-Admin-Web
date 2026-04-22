import { useEffect, useState } from 'react';
import api from '../api';

const glass = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 8px 32px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
};

const modalGlass = {
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.85)',
  boxShadow: '0 25px 50px rgba(99,102,241,0.15)',
};

const inputStyle = {
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(199,210,254,0.8)',
};

const empty = { username: '', password: '', school_name: '', role: 'device' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    const { data } = await api.get('/api/admin/users');
    setUsers(data);
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => { setForm(empty); setModal('add'); };
  const openEdit = u => { setForm({ ...u, password: '' }); setModal(u); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'add') await api.post('/api/admin/users', form);
      else await api.put(`/api/admin/users/${modal.id}`, form);
      setModal(null);
      load();
    } catch (e) {
      alert(e.response?.data?.error || 'Error');
    }
    setSaving(false);
  };

  const del = async id => {
    if (!confirm('Delete user?')) return;
    await api.delete(`/api/admin/users/${id}`);
    load();
  };

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
        className="rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-500"
        style={{
          ...glass,
          
          
        }}
      >
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Users & Devices</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage device accounts and admins</p>
        </div>
        <button
          onClick={openAdd}
          className="px-3 sm:px-4 py-2 text-white text-xs sm:text-sm font-medium rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          }}
        >
          + Add User
        </button>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {users.map((u, i) => (
          <div
            key={u.id}
            className="rounded-2xl p-4 space-y-2 transition-all duration-500"
            style={{
              ...glass,
              
              
              transitionDelay: `${i * 50}ms`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-gray-800">{u.username}</span>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  u.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {u.role === 'admin' ? 'Admin' : 'Device'}
              </span>
            </div>
            {u.school_name && (
              <p className="text-xs text-gray-500">{u.school_name}</p>
            )}
            <p className="text-xs text-gray-400">
              Created: {new Date(u.created_at).toLocaleDateString()}
            </p>
            <div
              className="flex gap-3 pt-1"
              style={{ borderTop: '1px solid rgba(255,255,255,0.6)' }}
            >
              <button
                onClick={() => openEdit(u)}
                className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => del(u.id)}
                className="text-xs text-red-500 font-medium hover:text-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {users.length === 0 && loaded && (
          <div className="rounded-2xl py-12 text-center text-sm text-gray-400" style={glass}>
            No users found
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div
        className="hidden sm:block rounded-2xl overflow-hidden transition-all duration-500"
        style={{
          ...glass,
          
          
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.3)' }}>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">School</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className="transition-all duration-200 hover:bg-white/30"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.4)',
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{u.username}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{u.school_name || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {u.role === 'admin' ? 'Admin' : 'Device'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => del(u.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - bottom sheet on mobile */}
      {modal !== null && (
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          style={{ background: 'rgba(99,102,241,0.15)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            style={modalGlass}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {modal === 'add' ? 'Add User' : 'Edit User'}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none transition-colors"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Username</label>
              <input
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all disabled:opacity-60"
                style={inputStyle}
                placeholder="Username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(199,210,254,0.8)')}
                disabled={modal !== 'add'}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                {modal === 'add' ? 'Password' : 'New Password (blank = keep)'}
              </label>
              <input
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(199,210,254,0.8)')}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">School Name</label>
              <input
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                placeholder="School Name"
                value={form.school_name}
                onChange={e => setForm({ ...form, school_name: e.target.value })}
                onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(199,210,254,0.8)')}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Role</label>
              <select
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(199,210,254,0.8)')}
              >
                <option value="device">Device (Android App)</option>
                <option value="admin">Admin (Web Panel)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setModal(null)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium text-gray-600 transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(199,210,254,0.8)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

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
