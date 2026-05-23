import { useEffect, useState } from 'react';
import api from '../api';

const glass = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 8px 32px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
};

const statConfigs = [
  { key: 'total_devices',  label: 'Total Devices', icon: '📱', from: '#3b82f6', to: '#6366f1' },
  { key: 'online_devices', label: 'Online Now',    icon: '🟢', from: '#10b981', to: '#059669' },
  { key: 'total_users',    label: 'App Users',     icon: '👤', from: '#f59e0b', to: '#d97706' },
  { key: 'total_sounds',   label: 'Sound Files',   icon: '🎵', from: '#8b5cf6', to: '#7c3aed' },
];

function StatCard({ label, value, icon, from, to, index }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3 transition-all duration-500"
      style={{
        ...glass,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 4px 12px ${from}40` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
        <p className="text-xs text-gray-500 truncate">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [devices, setDevices] = useState([]);

  const load = async () => {
    try {
      const [s, d] = await Promise.all([api.get('/api/admin/stats'), api.get('/api/admin/devices')]);
      setStats(s.data); setDevices(d.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  return (
    <div className="min-h-screen relative p-4 sm:p-6 space-y-5" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 50%, #ede9fe 100%)' }}>

      {/* Background blobs */}
      <div className="fixed top-[-5%] right-[-5%] w-80 h-80 bg-blue-300 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ animation: 'blob 10s infinite ease-in-out' }} />
      <div className="fixed bottom-[10%] left-[-5%] w-64 h-64 bg-indigo-300 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ animation: 'blob 12s infinite ease-in-out', animationDelay: '3s' }} />

      {/* Header */}
      <div
        className="rounded-2xl px-5 py-4 flex items-center justify-between"
        style={{ ...glass }}
      >
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Live device & system overview</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-indigo-600 transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statConfigs.map((s, i) => (
            <StatCard key={s.key} label={s.label} value={stats[s.key]} icon={s.icon} from={s.from} to={s.to} index={i} />
          ))}
        </div>
      )}

      {/* Devices Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ ...glass }}
      >
        <div className="px-4 sm:px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.6)' }}>
          <h2 className="text-sm font-semibold text-gray-700">All Devices</h2>
          <span className="text-xs text-gray-400 hidden sm:block">Auto-refresh 30s</span>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y" style={{ borderColor: 'rgba(255,255,255,0.5)' }}>
          {devices.length === 0
            ? <div className="px-4 py-8 text-center text-sm text-gray-400">No devices yet</div>
            : devices.map(d => {
                const online = d.status === 'online';
                return (
                  <div key={d.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">{d.school_name || '—'}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        {online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono">{d.device_id?.slice(0, 24)}…</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-full h-1.5" style={{ background: 'rgba(0,0,0,0.08)' }}>
                        <div className={`h-1.5 rounded-full transition-all duration-700 ${d.battery_level > 50 ? 'bg-green-500' : d.battery_level > 20 ? 'bg-yellow-400' : 'bg-red-500'}`}
                          style={{ width: `${d.battery_level}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{d.battery_level}%{d.battery_charging ? ' ⚡' : ''}</span>
                    </div>
                    <p className="text-xs text-gray-400">Last seen: {d.last_seen ? new Date(d.last_seen).toLocaleString() : 'Never'}</p>
                  </div>
                );
              })
          }
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.3)' }}>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">School</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Device ID</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Battery</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0
                ? <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">No devices yet</td></tr>
                : devices.map((d, i) => {
                    const online = d.status === 'online';
                    return (
                      <tr
                        key={d.id}
                        className="transition-all duration-200 hover:bg-white/30"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.4)', animationDelay: `${i * 50}ms` }}
                      >
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{d.school_name || '—'}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{d.device_id?.slice(0, 20)}…</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                            {online ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 rounded-full h-1.5" style={{ background: 'rgba(0,0,0,0.08)' }}>
                              <div className={`h-1.5 rounded-full transition-all duration-700 ${d.battery_level > 50 ? 'bg-green-500' : d.battery_level > 20 ? 'bg-yellow-400' : 'bg-red-500'}`}
                                style={{ width: `${d.battery_level}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{d.battery_level}%{d.battery_charging ? ' ⚡' : ''}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400">{d.last_seen ? new Date(d.last_seen).toLocaleString() : 'Never'}</td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
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
