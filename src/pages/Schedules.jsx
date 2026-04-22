import { useEffect, useState } from 'react';
import api from '../api';
import { useSchool } from '../context/SchoolContext';

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

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayBit = i => 1 << i;
const fmtTime = (h, m) => {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const empty = {
  label: '',
  hour: 8,
  minute: 0,
  days: 62,
  sound_file: 'default_bell.mp3',
  is_enabled: true,
  routine_type: 'SCHOOL',
};

export default function Schedules() {
  const { selectedSchool } = useSchool();
  const [schedules, setSchedules] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [sounds, setSounds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    if (!selectedSchool) return;
    const [s, snd] = await Promise.all([
      api.get('/api/schedules/all', { params: { school: selectedSchool } }),
      api.get('/api/sounds', { params: { school: selectedSchool } }),
    ]);
    setSchedules(s.data);
    setSounds(snd.data);
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, [selectedSchool]);

  const openAdd = () => { setForm(empty); setModal('add'); };
  const openEdit = s => { setForm({ ...s }); setModal(s); };
  const toggleDay = i => setForm(f => ({ ...f, days: f.days ^ dayBit(i) }));

  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'add') await api.post('/api/schedules', { ...form, school_name: selectedSchool });
      else await api.put(`/api/schedules/${modal.id}`, form);
      setModal(null);
      load();
    } catch (e) {
      alert(e.response?.data?.error || 'Error');
    }
    setSaving(false);
  };

  const del = async id => {
    if (!confirm('Delete this schedule?')) return;
    await api.delete(`/api/schedules/${id}`);
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
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Bell Schedules</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {selectedSchool
              ? <span className="font-medium text-indigo-600">{selectedSchool}</span>
              : 'Select a school'}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-3 sm:px-4 py-2 text-white text-xs sm:text-sm font-medium rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          }}
        >
          + Add
        </button>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {schedules.map((s, i) => (
          <div
            key={s.id}
            className="rounded-2xl p-4 space-y-3 transition-all duration-500"
            style={{
              ...glass,
              
              
              transitionDelay: `${i * 50}ms`,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                <p className="text-indigo-600 font-mono font-bold text-lg mt-0.5">
                  {fmtTime(s.hour, s.minute)}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                  s.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    s.is_enabled ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                {s.is_enabled ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex gap-1 flex-wrap">
              {DAYS.map((d, i) => (
                <span
                  key={i}
                  className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                    s.days & dayBit(i)
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-white/40 text-gray-400'
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>

            <div
              className="flex items-center justify-between pt-1"
              style={{ borderTop: '1px solid rgba(255,255,255,0.6)' }}
            >
              <span className="text-xs text-gray-400 truncate max-w-[150px]">{s.sound_file}</span>
              <div className="flex gap-3">
                <button
                  onClick={() => openEdit(s)}
                  className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => del(s.id)}
                  className="text-xs text-red-500 font-medium hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {schedules.length === 0 && loaded && (
          <div className="rounded-2xl py-12 text-center text-sm text-gray-400" style={glass}>
            No schedules found
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
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Label</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Days</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sound</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s, i) => (
                <tr
                  key={s.id}
                  className="transition-all duration-200 hover:bg-white/30"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.4)',
                    animationDelay: `${i * 40}ms`,
                  }}
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{s.label}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-indigo-600 font-mono">
                      {fmtTime(s.hour, s.minute)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {DAYS.map((d, i) => (
                        <span
                          key={i}
                          className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                            s.days & dayBit(i)
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-white/40 text-gray-400'
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[120px] truncate">
                    {s.sound_file}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        s.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          s.is_enabled ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      {s.is_enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => del(s.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                    No schedules found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          style={{ background: 'rgba(99,102,241,0.15)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            style={modalGlass}
          >
            <h3 className="text-lg font-bold text-gray-800">
              {modal === 'add' ? 'Add Schedule' : 'Edit Schedule'}
            </h3>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Label</label>
              <input
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                placeholder="e.g. Morning Bell"
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
                onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(199,210,254,0.8)')}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 block mb-1">Hour (0–23)</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                  style={inputStyle}
                  value={form.hour}
                  onChange={e => setForm({ ...form, hour: parseInt(e.target.value) })}
                  onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(199,210,254,0.8)')}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 block mb-1">Minute (0–59)</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                  style={inputStyle}
                  value={form.minute}
                  onChange={e => setForm({ ...form, minute: parseInt(e.target.value) })}
                  onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(199,210,254,0.8)')}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-2">Days</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                    style={
                      form.days & dayBit(i)
                        ? {
                            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                            color: '#fff',
                            border: '1px solid transparent',
                            boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.7)',
                            color: '#4b5563',
                            border: '1px solid rgba(199,210,254,0.8)',
                          }
                    }
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Sound File</label>
              <select
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                value={form.sound_file}
                onChange={e => setForm({ ...form, sound_file: e.target.value })}
                onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(199,210,254,0.8)')}
              >
                <option value="default_bell.mp3">default_bell.mp3</option>
                {sounds.map(s => (
                  <option key={s.id} value={s.filename}>{s.original_name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="enabled"
                checked={!!form.is_enabled}
                onChange={e => setForm({ ...form, is_enabled: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <label htmlFor="enabled" className="text-sm text-gray-700">Enabled</label>
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
