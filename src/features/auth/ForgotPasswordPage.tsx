import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { forgotPasswordApi } from '../../api/auth';
import { UserRole } from '../../types/user';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { AuthFrame, RolePicker } from './LoginPage';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('dealership');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function requestReset(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await forgotPasswordApi(normalizedEmail, role);
      navigate('/verify-reset-otp', { replace: true, state: { email: normalizedEmail, role, requestId: response.requestId, message: response.message } });
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Unable to send a verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return <AuthFrame>
    <Card variant="glass" className="border-[#deded9] p-7 shadow-2xl">
      <form onSubmit={requestReset} className="space-y-4">
        <div><h2 className="text-lg font-semibold text-[#252525]">Forgot password</h2><p className="text-xs text-[#858580] mt-1">We’ll email a 6-digit verification code to your registered address.</p></div>
        {error && <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-xs text-[#b92b24]">{error}</div>}
        <RolePicker value={role} onChange={setRole}/>
        <div className="relative">
          <Input label="Email Address" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="name@dealership.com.au" />
          <Mail className="w-4 h-4 text-[#858580] absolute right-3 top-8 pointer-events-none" />
        </div>
        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Send OTP</Button>
      </form>
      <div className="mt-5 pt-5 border-t border-[#deded9] text-center text-xs"><Link className="font-semibold text-[#2936ff]" to="/login">Back to sign in</Link></div>
    </Card>
  </AuthFrame>;
}
