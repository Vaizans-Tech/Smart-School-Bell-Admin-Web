import { useEffect, useState } from 'react';
import api from '../api';

const glass = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 8px 32px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
};

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    const { data } = await api.get('/api/admin/devices');
    setDevices(data);
    setLoaded(true);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

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
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Devices</h1>
          <p className="text-xs text-gray-500 mt-0.5">All registered Android devices</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-indigo-600 transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Device cards grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {devices.map((d, i) => {
          const online = d.status === 'online';
          return (
            <div
              key={d.id}
              className="rounded-2xl p-4 space-y-3 transition-all duration-500"
              style={{
                ...glass,
                
                
                transitionDelay: `${i * 60}ms`,
              }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">
                    {d.school_name || 'Unknown School'}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5 break-all line-clamp-1">
                    {d.device_id}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                    online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}
                  />
                  {online ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Battery */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Battery</span>
                  <span className="font-medium">
                    {d.battery_level}%{d.battery_charging ? ' ⚡' : ''}
                  </span>
                </div>
                <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(0,0,0,0.08)' }}>
                  <div
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                      d.battery_level > 50
                        ? 'bg-green-500'
                        : d.battery_level > 20
                        ? 'bg-yellow-400'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${d.battery_level}%` }}
                  />
                </div>
              </div>

              {/* Last seen */}
              <p
                className="text-xs text-gray-400 pt-2.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.6)' }}
              >
                Last seen: {d.last_seen ? new Date(d.last_seen).toLocaleString() : 'Never'}
              </p>
            </div>
          );
        })}

        {devices.length === 0 && loaded && (
          <div
            className="col-span-full rounded-2xl py-14 text-center text-sm text-gray-400"
            style={glass}
          >
            No devices registered yet
          </div>
        )}
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
