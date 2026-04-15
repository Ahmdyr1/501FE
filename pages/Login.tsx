
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Button } from '../components/Button';
import { Loader2, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await login(email, password);

    if (user) {
      // Redirect based on detected role
      switch (user.role) {
        case UserRole.ADMIN: navigate('/admin-dashboard'); break; // Admins go to their portal
        case UserRole.DRIVER: navigate('/driver-dashboard'); break;
        default: navigate('/student-dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">

        <div className="bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Sign in to access your dashboard</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                placeholder="admin / ins / student"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" fullWidth className="h-12 shadow-lg shadow-brand-500/20" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              New student? <Link to="/signup" className="text-brand-600 font-bold hover:underline">Create an account</Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};
