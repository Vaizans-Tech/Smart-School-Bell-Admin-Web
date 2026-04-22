import { useEffect, useState, useRef } from 'react';
import api from '../api';
import { useSchool } from '../context/SchoolContext';

const glass = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 8px 32px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
};

export default function Sounds() {
  const { selectedSchool } = useSchool();
  const [sounds, setSounds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    if (!selectedSchool) return;
    const { data } = await api.get('/api/sounds', { params: { school: selectedSchool } });
    setSounds(data);
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, [selectedSchool]);

  const upload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('sound', file);
    fd.append('school_name', selectedSchool);
    try {
      await api.post('/api/sounds/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  };

  const del = async id => {
    if (!confirm('Delete this sound?')) return;
    await api.delete(`/api/sounds/${id}`);
    load();
  };

  const fmtSize = b =>
    b > 1024 * 1024
      ? `${(b / 1024 / 1024).toFixed(1)} MB`
      : `${(b / 1024).toFixed(0)} KB`;

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
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Sound Files</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {selectedSchool
              ? <span className="font-medium text-indigo-600">{selectedSchool}</span>
              : 'Select a school'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Upload and manage bell audio files</p>
        </div>
        <button
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          className="px-3 sm:px-4 py-2 text-white text-xs sm:text-sm font-medium rounded-xl disabled:opacity-60 transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          }}
        >
          {uploading ? 'Uploading…' : '↑ Upload'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".mp3,.wav,.ogg"
          className="hidden"
          onChange={upload}
        />
      </div>

      {/* Sound cards grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sounds.map((s, i) => (
          <div
            key={s.id}
            className="rounded-2xl p-4 transition-all duration-500"
            style={{
              ...glass,
              
              
              transitionDelay: `${i * 60}ms`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  boxShadow: '0 4px 12px rgba(139,92,246,0.35)',
                }}
              >
                🎵
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{s.original_name}</p>
                <p className="text-xs text-gray-400">{fmtSize(s.size_bytes || 0)}</p>
              </div>
              <button
                onClick={() => del(s.id)}
                className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
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
            <audio controls src={s.url} className="w-full h-8" />
          </div>
        ))}

        {sounds.length === 0 && loaded && (
          <div
            className="col-span-full rounded-2xl py-14 text-center text-sm text-gray-400"
            style={glass}
          >
            No sounds uploaded yet
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
