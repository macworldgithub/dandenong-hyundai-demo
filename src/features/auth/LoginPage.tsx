import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { loginApi } from '../../api/auth';
import { UserRole } from '../../types/user';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const roles: { value: UserRole; label: string }[] = [
  { value: 'dealership', label: 'Dealership' },
  { value: 'admin', label: 'Admin' },
];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('dealership');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const message = (location.state as { message?: string } | null)?.message;

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await loginApi(email, password, role);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/');
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Login failed. Check your email, password, and role.');
    } finally {
      setIsLoading(false);
    }
  }

  return <AuthFrame>
    <Card variant="glass" className="border-[#deded9] p-7 shadow-2xl">
      <form onSubmit={handleLogin} className="space-y-4">
        <h2 className="text-lg font-semibold text-[#252525]">Sign in</h2>
        {message && <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-[#217454]">{message}</div>}
        {error && <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-xs text-[#b92b24]">{error}</div>}
        <RolePicker value={role} onChange={setRole}/>
        <div className="relative">
          <Input label="Email Address" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="name@dealership.com.au" />
          <Mail className="w-4 h-4 text-[#858580] absolute right-3 top-8 pointer-events-none" />
        </div>
        <div className="relative">
          <Input label="Password" type="password" required value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" />
          <Lock className="w-4 h-4 text-[#858580] absolute right-3 top-8 pointer-events-none" />
        </div>
        <div className="flex justify-end"><Link className="text-xs text-[#2936ff]" to="/forgot-password">Forgot password?</Link></div>
        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          <span>Sign in to Dealership Suite</span><ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      <div className="mt-5 pt-5 border-t border-[#deded9] text-center text-xs text-[#858580]">
        New user? <Link className="font-semibold text-[#2936ff]" to="/signup">Create an account</Link>
      </div>
    </Card>
  </AuthFrame>;
}

export function RolePicker({ value, onChange }: { value: UserRole; onChange: (role: UserRole) => void }) {
  return <fieldset>
    <legend className="mb-2 text-xs font-medium text-[#252525]">Role</legend>
    <div className="grid grid-cols-2 gap-2">
      {roles.map(option => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={`border px-3 py-2 text-xs font-semibold ${value === option.value ? 'border-[#2936ff] bg-blue-50 text-[#2936ff]' : 'border-[#deded9] bg-[#f6f6f3] text-[#858580]'}`}>{option.label}</button>)}
    </div>
  </fieldset>;
}

export function AuthFrame({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen w-full bg-[#f6f6f3] flex flex-col justify-center items-center p-4 relative overflow-hidden">
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
    <div className="w-full max-w-md z-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-sky-600 to-blue-700 text-white shadow-xl border border-sky-400/30 mb-2"><span className="font-bold text-2xl">H</span></div>
        <h1 className="text-2xl font-bold tracking-tight text-[#252525]">GOOD SHOWROOM</h1>
        <div className="flex items-center justify-center gap-1.5 text-xs text-[#2936ff] font-medium"><Building2 className="w-3.5 h-3.5"/><span>Dandenong Hyundai · Booran Motor Group</span></div>
        <p className="text-xs text-[#858580]">Single-rooftop dealership accounting & audit trail suite</p>
      </div>
      {children}
      <div className="flex items-center justify-center gap-2 text-[11px] text-[#858580]"><ShieldCheck className="w-4 h-4 text-emerald-500"/><span>General Ledger Invariants & Audit Trail Active</span></div>
    </div>
  </div>;
}
