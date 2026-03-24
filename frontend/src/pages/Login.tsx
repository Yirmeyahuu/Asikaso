import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-[#000000]' : 'bg-[#f2f2f7]'}`}>
      {/* Theme Toggle - Top Right */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full backdrop-blur-md transition-all ${
          isDark 
            ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20' 
            : 'bg-black/5 border border-black/10 text-black hover:bg-black/10'
        }`}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Left side - iOS Liquid Glass Container */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
        {/* iOS Style Liquid Glass Card */}
        <div className="w-full max-w-md">
          {/* Main Liquid Glass Container - iOS Style */}
          <div className={`
            relative overflow-hidden
            rounded-[40px]
            backdrop-blur-[40px]
            shadow-2xl
            p-10
            ${isDark 
              ? 'bg-gradient-to-b from-white/25 to-white/5 border-t border-l border-white/30 border-r border-b border-white/10 shadow-black/40' 
              : 'bg-gradient-to-b from-white/80 to-white/40 border-t border-l border-white/60 border-r border-b border-white/40 shadow-black/10'
            }
          `}>
            {/* Subtle inner glow */}
            <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-white/10' : 'from-white/30'} to-transparent pointer-events-none`} />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Logo Icon */}
              <div className="mb-8 flex justify-center">
                <img 
                  src="/Asikaso Logo.svg" 
                  alt="Asikaso Logo" 
                  className="w-24 h-24 rounded-2xl"
                />
              </div>
              
              <h1 className={`text-5xl font-bold mb-3 tracking-tight text-center ${isDark ? 'text-white' : 'text-black'}`}>ASIK</h1>
              <p className={`text-lg font-light text-center mb-8 ${isDark ? 'text-white/70' : 'text-black/60'}`}>Company-wide Task Management</p>
              
              <div className="space-y-3">
                <div className={`flex items-center gap-4 p-3 rounded-2xl backdrop-blur-sm ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/20' : 'bg-black/10'}`}>
                    <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className={isDark ? 'text-white/80' : 'text-black/70'}>Manage tasks efficiently</span>
                </div>
                <div className={`flex items-center gap-4 p-3 rounded-2xl backdrop-blur-sm ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/20' : 'bg-black/10'}`}>
                    <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className={isDark ? 'text-white/80' : 'text-black/70'}>Collaborate with your team</span>
                </div>
                <div className={`flex items-center gap-4 p-3 rounded-2xl backdrop-blur-sm ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/20' : 'bg-black/10'}`}>
                    <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className={isDark ? 'text-white/80' : 'text-black/70'}>Track progress easily</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form - iOS style */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <img 
              src="/Asikaso Logo.svg" 
              alt="Asikaso Logo" 
              className="w-20 h-20 rounded-2xl"
            />
          </div>

          <div className="text-center mb-8">
            <h2 className={`page-title ${isDark ? 'text-white' : 'text-black'}`}>Welcome Back</h2>
            <p className={`page-subtitle mt-2 ${isDark ? 'text-white/60' : 'text-black/50'}`}>Sign in to continue to ASIK</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-4 py-4 px-6 backdrop-blur-sm border rounded-2xl hover:transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark 
                ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                : 'bg-black/5 border-black/10 text-black hover:bg-black/10'
            }`}
          >
            {isLoading ? (
              <div className="spinner w-5 h-5"></div>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-black'}`}>Continue with Google</span>
              </>
            )}
          </button>

          <p className={`text-center text-sm mt-8 ${isDark ? 'text-white/40' : 'text-black/40'}`}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
