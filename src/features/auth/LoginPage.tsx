import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Mail, Building2, UserCheck } from 'lucide-react';
import { loginApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('sarah@dandenonghyundai.com.au');
  const [password, setPassword] = useState('demo1234');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await loginApi(email, password);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f6f3] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background glow & accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Dealership header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-none bg-gradient-to-tr from-sky-600 to-blue-700 text-white shadow-xl shadow-sky-950 border border-sky-400/30 mb-2">
            <span className="font-bold text-2xl tracking-wider">H</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#252525]">
            GOOD SHOWROOM
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#2936ff] font-medium">
            <Building2 className="w-3.5 h-3.5" />
            <span>Dandenong Hyundai • Booran Motor Group</span>
          </div>
          <p className="text-xs text-[#858580]">
            Single-rooftop dealership accounting & audit trail suite
          </p>
        </div>

        {/* Login form */}
        <Card variant="glass" className="border-[#deded9] p-7 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-none text-xs text-[#b92b24]">
                {error}
              </div>
            )}

            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="controller@dandenonghyundai.com.au"
              />
              <Mail className="w-4 h-4 text-[#858580] absolute right-3 top-8 pointer-events-none" />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-[#858580] absolute right-3 top-8 pointer-events-none" />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              <span>Sign in to Dealership Suite</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Fill Demo Roles */}
          <div className="mt-6 pt-5 border-t border-[#deded9]">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#858580] uppercase tracking-wider mb-2.5">
              <UserCheck className="w-3.5 h-3.5 text-[#2936ff]" />
              <span>Quick-Fill Seeded Users</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('sarah@dandenonghyundai.com.au')}
                className="p-2 rounded-none bg-[#f6f6f3] hover:bg-[#f6f6f3] border border-[#deded9] text-left transition-colors"
              >
                <div className="font-medium text-[#252525] truncate">Sarah Mitchell</div>
                <div className="text-[10px] text-[#2936ff]">Dealership Controller</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('michael@dandenonghyundai.com.au')}
                className="p-2 rounded-none bg-[#f6f6f3] hover:bg-[#f6f6f3] border border-[#deded9] text-left transition-colors"
              >
                <div className="font-medium text-[#252525] truncate">Michael Chang</div>
                <div className="text-[10px] text-[#217454]">Senior Accountant</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('jessica@dandenonghyundai.com.au')}
                className="p-2 rounded-none bg-[#f6f6f3] hover:bg-[#f6f6f3] border border-[#deded9] text-left transition-colors"
              >
                <div className="font-medium text-[#252525] truncate">Jessica Taylor</div>
                <div className="text-[10px] text-amber-700">Accounts Payable</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('david@dandenonghyundai.com.au')}
                className="p-2 rounded-none bg-[#f6f6f3] hover:bg-[#f6f6f3] border border-[#deded9] text-left transition-colors"
              >
                <div className="font-medium text-[#252525] truncate">David Wilson</div>
                <div className="text-[10px] text-purple-700">System Admin</div>
              </button>
            </div>
          </div>
        </Card>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[#858580]">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>General Ledger Invariants & Audit Trail Active</span>
        </div>
      </div>
    </div>
  );
};
