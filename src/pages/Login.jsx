import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/** Set in `.env.local`: VITE_DEFAULT_LOGIN_USERNAME / VITE_DEFAULT_LOGIN_PASSWORD (optional, dev convenience). */
const defaultForm = {
  username: import.meta.env.VITE_DEFAULT_LOGIN_USERNAME ?? '',
  password: import.meta.env.VITE_DEFAULT_LOGIN_PASSWORD ?? '',
};

export default function Login() {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/api/auth/admin/login', form);
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      const body = err.response?.data;
      const status = err.response?.status;

      const fromServer =
        (typeof body === 'string' && body.trim()) ||
        (typeof body?.error === 'string' && body.error.trim()) ||
        (typeof body?.message === 'string' && body.message.trim()) ||
        (typeof body?.detail === 'string' && body.detail.trim());

      if (import.meta.env.DEV && status >= 400) {
        // eslint-disable-next-line no-console
        console.error('[login] API error', { status, data: body });
      }

      if (fromServer) setError(String(fromServer));
      else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error')
        setError('Cannot reach API server. Check your network or VITE_API_BASE_URL, then retry.');
      else if (status === 502 || status === 503 || status === 504)
        setError(
          'API server is unreachable or returned a gateway error (HTTP ' +
            status +
            '). The API may be down or misconfigured — try again later or contact support.'
        );
      else if (status === 500)
        setError(
          'Server error (HTTP 500). The API rejected the request internally — check credentials or try again later.'
        );
      else if (status)
        setError(`Login failed (HTTP ${status})`);
      else setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1e3a8a 0%, #3730a3 50%, #4f46e5 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="absolute top-[30%] right-[-40px] w-48 h-48 rounded-full opacity-10" style={{ background: 'white' }} />
        <div
          className="absolute bottom-[15%] left-[10%] w-32 h-32 rounded-full opacity-20"
          style={{ background: 'rgba(255,255,255,0.15)', animation: 'pulse 4s infinite ease-in-out' }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-12 max-w-md">
          {/* Logo mark */}
          <div className="mb-8 flex justify-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}
            >
              EK
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Edukit</h1>
          <p className="text-indigo-200 text-base leading-relaxed mb-10">
            Smart school bell management system. Schedule, control, and manage your school bells from one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-3">
            {[
              { icon: '🔔', text: 'Automated Bell Scheduling' },
              { icon: '📢', text: 'Real-time Announcements' },
              { icon: '🎵', text: 'Custom Sound Management' },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm text-indigo-100 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom label */}
        <p className="absolute bottom-6 text-indigo-300 text-xs">© 2025 Edukit. All rights reserved.</p>
      </div>

      {/* ── Right panel (form) ── */}
      <div
        className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{ background: '#f8faff' }}
      >
        {/* Subtle background shape */}
        <div
          className="absolute top-[-100px] right-[-100px] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-80px] left-[-80px] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' }}
        />

        <div className="w-full max-w-sm relative z-10">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}
            >
              EK
            </div>
            <h1 className="text-xl font-bold text-gray-800">Edukit</h1>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to your admin account</p>
          </div>

          <form onSubmit={submit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200"
                  style={{
                    background: 'white',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required autoFocus
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200"
                  style={{
                    background: 'white',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48' }}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 relative overflow-hidden group mt-1"
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                boxShadow: '0 4px 24px rgba(99,102,241,0.45)',
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = '0 6px 28px rgba(99,102,241,0.6)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.45)')}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid #e8edf5' }}>
            <p className="text-center text-xs text-gray-400">
              Secure admin access · Edukit School Bell System
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
