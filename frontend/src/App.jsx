import { useEffect, useState } from 'react';
import api from './api';

export default function App() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [token, setToken] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setProfileMessage('');

    try {
      const res = await api.post('/login', { email, password });
      setToken(res.data.token || '');
      setLoginMessage(`Connecte: ${res.data.user?.name || email}`);
    } catch (err) {
      setToken('');
      setLoginMessage('');
      setErrorMessage(err.response?.data?.message || 'Echec login');
    }
  };

  const handleProfile = async () => {
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Aucun token. Faites un login avant.');
      return;
    }

    try {
      const res = await api.get('/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfileMessage(res.data.message || 'Profile OK');
    } catch (err) {
      setProfileMessage('');
      setErrorMessage(err.response?.data?.message || 'Echec profile');
    }
  };

  return (
    <div>
      <h1>Users</h1>
      {users.map(user => (
        <p key={user.id}>{user.name}</p>
      ))}

      <hr />
      <h2>Test front vers back</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">POST /api/login</button>
      </form>

      <button type="button" onClick={handleProfile}>GET /api/profile avec Bearer</button>

      {loginMessage && <p>{loginMessage}</p>}
      {token && <p>Token: {token}</p>}
      {profileMessage && <p>{profileMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
}