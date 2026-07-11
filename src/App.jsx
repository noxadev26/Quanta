import { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');
  const [authForm, setAuthForm] = useState({nama: '', email: '', password: ''});
  const [loading, setLoading] = useState(false);

  const handleAuth = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { // simulasi login
      setUser({nama: authForm.nama || 'User'});
      setLoading(false);
    }, 1000);
  }

  // KALAU BELUM LOGIN
  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="glass-box">
          <h1 className="logo-big">QUANTA</h1>
          <p className="welcome-sub">SELAMAT DATANG</p>
          
          <form onSubmit={handleAuth}>
            <input type="text" placeholder="Nama" className="auth-input" value={authForm.nama} onChange={e => setAuthForm({...authForm, nama: e.target.value})} required />
            <input type="email" placeholder="Email" className="auth-input" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} required />
            <input type="password" placeholder="Password" className="auth-input" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
            <button className="btn-primary" type="submit" disabled={loading}>{loading? 'Loading...' : 'DAFTAR / MASUK'}</button>
          </form>
        </div>
      </div>
    );
  }

  // KALAU UDAH LOGIN
  return (
    <div className="app-container">
      <h1>Halaman {page}</h1> 
      <p>Selamat datang, {user.nama}!</p>
      
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
        <button className="nav-item nav-add">
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