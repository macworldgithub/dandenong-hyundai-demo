import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { resendPasswordOtpApi, verifyPasswordOtpApi } from '../../api/auth';
import { UserRole } from '../../types/user';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { AuthFrame } from './LoginPage';

type OtpState = { email: string; role: UserRole; requestId: string; message?: string };

export function OtpVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initial = location.state as OtpState | null;
  const [requestId, setRequestId] = useState(initial?.requestId || '');
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [message, setMessage] = useState(initial?.message || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  if (!initial?.email || !initial.role || !initial.requestId) return <Navigate to="/forgot-password" replace />;
  const resetRequest = initial;

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError('Enter the complete 6-digit code.');
    setIsLoading(true); setError(''); setMessage('');
    try {
      const response = await verifyPasswordOtpApi(requestId, otp);
      navigate('/reset-password', { replace: true, state: { resetToken: response.resetToken } });
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Unable to verify the code.');
    } finally { setIsLoading(false); }
  }

  async function resend() {
    setIsResending(true); setError(''); setMessage('');
    try {
      const response = await resendPasswordOtpApi(resetRequest.email, resetRequest.role);
      setRequestId(response.requestId); setOtp(''); setSeconds(60); setMessage('A new verification code has been sent.');
    } catch (requestError: any) {
      const retryAfter = Number(requestError.response?.data?.retryAfter || requestError.response?.headers?.['retry-after']);
      if (retryAfter > 0) setSeconds(retryAfter);
      setError(requestError.response?.data?.error || 'Unable to resend the code.');
    } finally { setIsResending(false); }
  }

  const maskedEmail = resetRequest.email.replace(/^(.{2}).*(@.*)$/, '$1••••$2');
  return <AuthFrame>
    <Card variant="glass" className="border-[#deded9] p-7 shadow-2xl">
      <form onSubmit={verify} className="space-y-4">
        <div><h2 className="text-lg font-semibold text-[#252525]">Verify your email</h2><p className="text-xs text-[#858580] mt-1">Enter the code sent to {maskedEmail}. It expires after 5 minutes.</p></div>
        {message && <div role="status" className="p-3 bg-blue-50 border border-blue-200 text-xs text-[#2936ff]">{message}</div>}
        {error && <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-xs text-[#b92b24]">{error}</div>}
        <Input label="6-digit verification code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} className="text-center text-xl tracking-[0.45em] font-semibold" />
        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Verify OTP</Button>
      </form>
      <div className="mt-4 text-center text-xs text-[#858580]">Didn’t receive it? <button type="button" onClick={resend} disabled={seconds > 0 || isResending} className="font-semibold text-[#2936ff] disabled:text-[#858580] disabled:cursor-not-allowed">{isResending ? 'Sending…' : seconds > 0 ? `Resend in ${seconds}s` : 'Resend OTP'}</button></div>
      <div className="mt-5 pt-5 border-t border-[#deded9] text-center text-xs"><Link className="font-semibold text-[#2936ff]" to="/forgot-password">Use a different email</Link></div>
    </Card>
  </AuthFrame>;
}
