import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/user';
import { getMeApi } from '../api/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('user');
    try { return cached ? JSON.parse(cached) : null; } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const expired = () => { setUser(null); navigate('/login', { replace: true }); };
    window.addEventListener('auth-expired', expired);
    return () => window.removeEventListener('auth-expired', expired);
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    getMeApi()
      .then((res) => {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
      })
      .catch((error) => {
        if (error.response?.status !== 401) return;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login', { replace: true });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return { user, setUser, isLoading, logout };
}
