import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api';
import { normalizeSounds } from '../lib/sounds';

const glass = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 8px 32px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
};

const fmtSize = b =>
  b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;

/**
 * @param {'bell'|'azan'} type
 */
export default function SoundLibrary({ type, title, description, accent = 'indigo' }) {
  const [sounds, setSounds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const load = useCallback(async () => {
    setError('');
    try {
      const { data } = await api.get(`/api/sounds/${type}`);
      setSounds(normalizeSounds(data));
    } catch (err) {
      setSounds([]);
      setError(err.response?.data?.error || err.message || 'Failed to load sounds');
    } finally {
      setLoaded(true);
    }
  }, [type]);

  useEffect(() => {
    setLoaded(false);
    load();
  }, [load]);

  const upload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('sound', file);
    try {
      await api.post(`/api/sounds/${type}/upload`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  };

  const del = async id => {
    if (!confirm('Delete this sound?')) return;
    try {
      await api.delete(`/api/sounds/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const accentBtn =
    accent === 'emerald'
      ? { background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }
      : { background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' };

  const iconBg =
    accent === 'emerald'
      ? { background: 'linear-gradient(135deg, #34d399, #059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }
      : { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 4px 12px rgba(139,92,246,0.35)' };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl px-5 py-4 flex items-center justify-between" style={glass}>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-800">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-3 sm:px-4 py-2 text-white text-xs sm:text-sm font-medium rounded-xl disabled:opacity-60 transition-all hover:scale-105 active:scale-95"
          style={accentBtn}
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

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sounds.map((s, i) => (
          <div key={s.id} className="rounded-2xl p-4" style={glass}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={iconBg}
              >
                {type === 'azan' ? '🕌' : '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{s.original_name}</p>
                <p className="text-xs text-gray-400 truncate">{s.filename}</p>
                <p className="text-xs text-gray-400">{fmtSize(s.size_bytes || 0)}</p>
              </div>
              <button
                type="button"
                onClick={() => del(s.id)}
                className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                aria-label="Delete sound"
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

        {sounds.length === 0 && loaded && !error && (
          <div className="col-span-full rounded-2xl py-10 text-center text-sm text-gray-400" style={glass}>
            No {type} sounds uploaded yet
          </div>
        )}
      </div>
    </section>
  );
}
