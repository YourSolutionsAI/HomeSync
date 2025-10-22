'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        alert('Registrierung erfolgreich! Bitte überprüfe deine E-Mail zur Bestätigung.');
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-12">
      <div className="card max-w-md w-full fade-in">
        <div className="text-center mb-8">
          <div className="mb-4">
            <span className="text-6xl animate-bounce">🧳</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Reise Checkliste
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            {isLogin ? 'Willkommen zurück!' : 'Neues Konto erstellen'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input bg-gray-50"
              placeholder="ihre-email@beispiel.de"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input bg-gray-50"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 slide-up">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner w-5 h-5 border-2"></div>
                Bitte warten...
              </span>
            ) : isLogin ? (
              'Anmelden'
            ) : (
              'Registrieren'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
          >
            {isLogin
              ? 'Noch kein Konto? Jetzt registrieren →'
              : '← Bereits registriert? Anmelden'}
          </button>
        </div>
      </div>
    </div>
  );
}

