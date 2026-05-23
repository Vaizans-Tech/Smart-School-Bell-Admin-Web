import SoundLibrary from '../components/SoundLibrary';
import BellSchedules from '../components/BellSchedules';

const pageBg = {
  background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 50%, #ede9fe 100%)',
};

const glass = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 8px 32px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
};

export default function Bell() {
  return (
    <div className="min-h-screen relative p-4 sm:p-6 space-y-6" style={pageBg}>
      <div
        className="fixed top-[-5%] right-[-5%] w-80 h-80 bg-blue-300 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ animation: 'blob 10s infinite ease-in-out' }}
      />

      <header className="rounded-2xl px-5 py-4" style={glass}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">Bell</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Bell audio library + default schedules for all app users
            </p>
          </div>
        </div>
      </header>

      <SoundLibrary
        type="bell"
        title="Bell sounds"
        description="Upload alarm / class-change audio (.mp3, .wav, .ogg). Used in schedules below."
      />

      <BellSchedules />

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
