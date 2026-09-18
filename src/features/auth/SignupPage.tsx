import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { signupApi } from '../../api/auth';
import { UserRole } from '../../types/user';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { AuthFrame, RolePicker } from './LoginPage';

export function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('dealership');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSignup(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setIsLoading(true);
    setError('');
    try {
      await signupApi({ name, email, password, role });
      navigate('/login', { replace: true, state: { message: 'Account created. Sign in with your selected role.' } });
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || requestError.response?.data?.details?.[0]?.message || 'Unable to create the account.');
    } finally {
      setIsLoading(false);
    }
  }

  return <AuthFrame>
    <Card variant="glass" className="border-[#deded9] p-7 shadow-2xl">
      <form onSubmit={handleSignup} className="space-y-4">
        <div><h2 className="text-lg font-semibold text-[#252525]">Create account</h2><p className="text-xs text-[#858580] mt-1">Choose the role you will use when signing in.</p></div>
        {error && <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-xs text-[#b92b24]">{error}</div>}
        <RolePicker value={role} onChange={setRole}/>
        <Input label="Full name" required value={name} onChange={event => setName(event.target.value)} placeholder="Your name" />
        <Input label="Email Address" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="name@dealership.com.au" />
        <Input label="Password" type="password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" />
        <Input label="Confirm password" type="password" required minLength={8} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Repeat your password" />
        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}><span>Create account</span><ArrowRight className="w-4 h-4"/></Button>
      </form>
      <div className="mt-5 pt-5 border-t border-[#deded9] text-center text-xs text-[#858580]">Already registered? <Link className="font-semibold text-[#2936ff]" to="/login">Sign in</Link></div>
    </Card>
  </AuthFrame>;
}
