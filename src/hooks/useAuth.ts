import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/user';
import { getMeApi } from '../api/auth';
import { clearStoredSession, getStoredToken, getTokenExpiryMs, isTokenExpired } from '../lib/authSession';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('user');
    try { return cached ? JSON.parse(cached) : null; } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const expired = () => {
      clearStoredSession();
      setUser(null);
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth-expired', expired);
    return () => window.removeEventListener('auth-expired', expired);
  }, [navigate]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    const expiresAt = getTokenExpiryMs(token);
    if (!expiresAt) return;

    const delay = expiresAt - Date.now();
    if (delay <= 0) {
      window.dispatchEvent(new Event('auth-expired'));
      return;
    }

    const timeout = window.setTimeout(() => {
      window.dispatchEvent(new Event('auth-expired'));
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [user]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (isTokenExpired(token)) {
      clearStoredSession();
      setUser(null);
      setIsLoading(false);
      navigate('/login', { replace: true });
      return;
    }

    getMeApi()
      .then((res) => {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
      })
      .catch((error) => {
        if (error.response?.status !== 401) return;
        clearStoredSession();
        setUser(null);
        navigate('/login', { replace: true });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const logout = () => {
    clearStoredSession();
    setUser(null);
    navigate('/login');
  };

  return { user, setUser, isLoading, logout };
}
