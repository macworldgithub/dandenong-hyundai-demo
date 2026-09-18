import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordApi, resetPasswordApi } from '../../api/auth';
import { UserRole } from '../../types/user';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { AuthFrame, RolePicker } from './LoginPage';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('dealership');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function requestReset(event: FormEvent) {
    event.preventDefault(); setIsLoading(true); setError(''); setMessage('');
    try {
      const response = await forgotPasswordApi(email, role);
      setMessage(response.message);
      if (response.resetToken) setResetToken(response.resetToken);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Unable to create a password reset request.');
    } finally { setIsLoading(false); }
  }

  async function resetPassword(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setIsLoading(true); setError('');
    try {
      await resetPasswordApi(resetToken, password);
      navigate('/login', { replace: true, state: { message: 'Password updated. Sign in with your new password.' } });
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || requestError.response?.data?.details?.[0]?.message || 'Unable to reset the password.');
    } finally { setIsLoading(false); }
  }

  return <AuthFrame>
    <Card variant="glass" className="border-[#deded9] p-7 shadow-2xl">
      {!resetToken ? <form onSubmit={requestReset} className="space-y-4">
        <div><h2 className="text-lg font-semibold text-[#252525]">Forgot password</h2><p className="text-xs text-[#858580] mt-1">Enter the email and role used when you signed up.</p></div>
        {error && <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-xs text-[#b92b24]">{error}</div>}
        {message && <div role="status" className="p-3 bg-blue-50 border border-blue-200 text-xs text-[#2936ff]">{message}</div>}
        <RolePicker value={role} onChange={setRole}/>
        <Input label="Email Address" type="email" required value={email} onChange={event => setEmail(event.target.value)} />
        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Continue</Button>
      </form> : <form onSubmit={resetPassword} className="space-y-4">
        <div><h2 className="text-lg font-semibold text-[#252525]">Set new password</h2><p className="text-xs text-[#858580] mt-1">Your reset request is valid for 15 minutes.</p></div>
        {error && <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-xs text-[#b92b24]">{error}</div>}
        <Input label="New password" type="password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} />
        <Input label="Confirm new password" type="password" required minLength={8} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Update password</Button>
      </form>}
      <div className="mt-5 pt-5 border-t border-[#deded9] text-center text-xs"><Link className="font-semibold text-[#2936ff]" to="/login">Back to sign in</Link></div>
    </Card>
  </AuthFrame>;
}
