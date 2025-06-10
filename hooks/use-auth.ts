import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/auth')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setUser(data.user);
        setError(null);
      })
      .catch(() => {
        setUser(null);
        setError('Utilisateur non authentifié');
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}
