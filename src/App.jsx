import { useState } from 'react';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');
  const [isLogin, setIsLogin] = useState(true); // untuk tab login/register
  const [authForm, setAuthForm] = useState({nama: '', email: '', password: ''});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // SIMULASI LOGIN/REGISTER - nanti kita sambungin ke database
    setTimeout(() => {
      if(!authForm.email ||!authForm.password){
        setError('Email dan Password wajib diisi!');
        setLoading(false);
        return;
      }
      setUser({nama: authForm.nama || authForm.email.split('@')[0]});
      setLoading(false);
    }, 1000);
  }

  const handleLogout = () => {
    setUser(null);
    setAuthForm({nama: '', email: '', password: ''});
  }

  // ===== HALAMAN LOGIN / REGISTER =====
  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="glass-box">
          <h1 className="logo-big">QUANTA</h1>
          <p className="welcome-sub">Platform Kreatif Indonesia</p>

          {/* TAB LOGIN / DAFTAR */}
          <div className="auth-tabs">
            <button className={isLogin? 'tab-active' : ''} onClick={() => {setIsLogin(true); setError('')}}>Masuk</button>
            <button className={!isLogin? 'tab-active' : ''} onClick={() => {setIsLogin(false); setError('')}}>Daftar</button>
          </div>

          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleAuth}>
            {/* INPUT NAMA CUMA MUNCUL KALO DAFTAR */}
            {!isLogin &&
              <input
                type="text"
                placeholder="Nama Lengkap"
                className="auth-input"
                value={authForm.nama}
                onChange={e => setAuthForm({...authForm, nama: e.target.value})}
                required
              />
            }

            <input
              type="email"
              placeholder="Email"
              className="auth-input"
              value={authForm.email}
              onChange={e => setAuthForm({...authForm, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="auth-input"
              value={authForm.password}
              onChange={e => setAuthForm({...authForm, password: e.target.value})}
              required
            />

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading? 'Loading...' : isLogin? 'MASUK' : 'DAFTAR SEKARANG'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===== HALAMAN UTAMA KALAU UDAH LOGIN =====
  return (
    <div className="app-container">
      <div className="page-content">
        <h1>📄 Halaman {page}</h1>
        <p>Selamat datang, <b>{user.nama}</b>!</p>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>

      <BottomNav />
    </div>
  );

  function BottomNav() {
    return (
      <nav className="navbar">
        <button onClick={() => setPage('home')} className={`nav-item ${page === 'home'? 'active' : ''}`}>
          <span>🏠</span>Home
        </button>
        <button onClick={() => setPage('cari')} className={`nav-item ${page === 'cari'? 'active' : ''}`}>
          <span>🔍</span>Cari
        </button>
        <button onClick={() => setPage('post')} className="nav-item nav-add">
          <span>+</span>
        </button>
        <button onClick={() => setPage('inbox')} className={`nav-item ${page === 'inbox'? 'active' : ''}`}>
          <span>💬</span>Inbox
        </button>
        <button onClick={() => setPage('profil')} className={`nav-item ${page === 'profil'? 'active' : ''}`}>
          <span>👤</span>Profil
        </button>
      </nav>
    );
  }
}