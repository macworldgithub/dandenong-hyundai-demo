import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { AuthFrame } from './LoginPage';

export function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = (location.state as { resetToken?: string } | null)?.resetToken;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!resetToken) return <Navigate to="/forgot-password" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) return setError('Password must contain at least 8 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setIsLoading(true); setError('');
    try {
      const response = await resetPasswordApi(resetToken!, password);
      navigate('/login', { replace: true, state: { message: response.message } });
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || requestError.response?.data?.details?.[0]?.message || 'Unable to reset the password.');
    } finally { setIsLoading(false); }
  }

  return <AuthFrame>
    <Card variant="glass" className="border-[#deded9] p-7 shadow-2xl">
      <form onSubmit={submit} className="space-y-4">
        <div><h2 className="text-lg font-semibold text-[#252525]">Set new password</h2><p className="text-xs text-[#858580] mt-1">Choose a strong password with at least 8 characters.</p></div>
        {error && <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-xs text-[#b92b24]">{error}</div>}
        <Input label="New password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} />
        <Input label="Confirm new password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Update password</Button>
      </form>
    </Card>
  </AuthFrame>;
}
