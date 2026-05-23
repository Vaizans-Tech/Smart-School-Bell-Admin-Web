import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import { normalizeSounds } from '../lib/sounds';

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

export default function BellSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [bellSounds, setBellSounds] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [tpl, snd] = await Promise.all([
        api.get('/api/schedules/templates'),
        api.get('/api/sounds/bell'),
      ]);
      setSchedules(tpl.data);
      setBellSounds(normalizeSounds(snd.data));
    } catch (err) {
      setSchedules([]);
      setError(err.response?.data?.error || err.message || 'Failed to load default schedules');
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    setLoaded(false);
    load();
  }, [load]);

  const openAdd = () => {
    setForm(empty);
    setModal('add');
  };
  const openEdit = s => {
    setForm({ ...s });
    setModal(s);
  };
  const toggleDay = i => setForm(f => ({ ...f, days: f.days ^ dayBit(i) }));

  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/api/schedules/templates', form);
      } else {
        await api.put(`/api/schedules/templates/${modal.id}`, form);
      }
      setModal(null);
      load();
    } catch (e) {
      alert(e.response?.data?.error || 'Error');
    }
    setSaving(false);
  };

  const del = async id => {
    if (!confirm('Delete this default schedule?')) return;
    try {
      await api.delete(`/api/schedules/templates/${id}`);
      load();
    } catch (e) {
      alert(e.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl px-5 py-4 flex items-center justify-between" style={glass}>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800">Default bell schedules</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Global default list — any user can load these in the mobile app (no per-user setup here)
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="px-3 sm:px-4 py-2 text-white text-xs sm:text-sm font-medium rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          }}
        >
          + Add default
        </button>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200">
          {error}
          <p className="text-xs mt-1 text-red-600">
            If this is a new server, run the migration:{' '}
            <code>migrations/001_bell_schedule_templates.sql</code> on the database, then restart the API.
          </p>
        </div>
      )}

      <div className="hidden sm:block rounded-2xl overflow-hidden" style={glass}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.3)' }}>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Label</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Days</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Bell sound</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{s.label}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-indigo-600 font-mono">
                    {fmtTime(s.hour, s.minute)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {DAYS.map((d, i) => (
                        <span
                          key={d}
                          className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                            s.days & dayBit(i) ? 'bg-indigo-100 text-indigo-700' : 'bg-white/40 text-gray-400'
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[140px] truncate">{s.sound_file}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        s.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {s.is_enabled ? 'Active' : 'Off'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => openEdit(s)} className="text-xs text-indigo-600 font-medium">
                        Edit
                      </button>
                      <button type="button" onClick={() => del(s.id)} className="text-xs text-red-500 font-medium">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && loaded && !error && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                    No default schedules yet — add templates for app users to import
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sm:hidden space-y-3">
        {schedules.map(s => (
          <div key={s.id} className="rounded-2xl p-4 space-y-2" style={glass}>
            <div className="flex justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                <p className="text-indigo-600 font-mono font-bold">{fmtTime(s.hour, s.minute)}</p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  s.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s.is_enabled ? 'Active' : 'Off'}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">{s.sound_file}</p>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => openEdit(s)} className="text-xs text-indigo-600 font-medium">
                Edit
              </button>
              <button type="button" onClick={() => del(s.id)} className="text-xs text-red-500 font-medium">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal !== null && (
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          style={{ background: 'rgba(99,102,241,0.15)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            style={modalGlass}
          >
            <h3 className="text-lg font-bold text-gray-800">
              {modal === 'add' ? 'Add default schedule' : 'Edit default schedule'}
            </h3>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Label</label>
              <input
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
                placeholder="e.g. Morning Bell"
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 block mb-1">Hour</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={inputStyle}
                  value={form.hour}
                  onChange={e => setForm({ ...form, hour: parseInt(e.target.value, 10) })}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 block mb-1">Minute</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={inputStyle}
                  value={form.minute}
                  onChange={e => setForm({ ...form, minute: parseInt(e.target.value, 10) })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-2">Days</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={
                      form.days & dayBit(i)
                        ? { background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff' }
                        : { background: 'rgba(255,255,255,0.7)', color: '#4b5563', border: '1px solid rgba(199,210,254,0.8)' }
                    }
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Bell sound file</label>
              <select
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                style={inputStyle}
                value={form.sound_file}
                onChange={e => setForm({ ...form, sound_file: e.target.value })}
              >
                <option value="default_bell.mp3">default_bell.mp3</option>
                {bellSounds.map(s => (
                  <option key={s.id} value={s.filename}>
                    {s.original_name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!form.is_enabled}
                onChange={e => setForm({ ...form, is_enabled: e.target.checked })}
                className="rounded accent-indigo-600"
              />
              Enabled (shown to app users for import)
            </label>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="flex-1 rounded-xl py-2.5 text-sm text-gray-600"
                style={inputStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="flex-1 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
