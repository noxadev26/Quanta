import React, { useState, useEffect } from 'react';
import './App.css';

// VERSI 5 NAVBAR FINAL 21 APRIL
const API_URL = "https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxx/exec"; 

function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [tipe, setTipe] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [posts, setPosts] = useState([]);
  const [notif, setNotif] = useState('');
  const [form, setForm] = useState({ judul: '', isi: '' });
  const [authForm, setAuthForm] = useState({ nama: '', email: '', password: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getPosts`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=${tipe}`, {
        method: 'POST',
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setUser(data.user);
        setPage('home');
      } else {
        setNotif(data.message);
      }
    } catch (e) {
      setNotif('Gagal konek ke server');
    }
    setLoading(false);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=addPost`, {
        method: 'POST',
        body: JSON.stringify({ ...form, email: user.email })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setShowForm(false);
        setForm({ judul: '', isi: '' });
        fetchData();
      }
    } catch (e) {
      setNotif('Gagal posting');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
  };

  // HALAMAN LOGIN / REGISTER
  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="glass-box">
          <h1 className="logo-big">NITA</h1>
          <p className="welcome-sub">SELAMAT DATANG</p>
          <div className="tipe-selector">
            <button className={tipe === 'login' ? 'active' : ''} onClick={() => setTipe('login')}>Login</button>
            <button className={tipe === 'register' ? 'active' : ''} onClick={() => setTipe('register')}>Daftar</button>
          </div>
          <form onSubmit={handleAuth}>
            {tipe === 'register' && <input type="text" placeholder="Nama" className="auth-input" value={authForm.nama} onChange={e => setAuthForm({...authForm, nama: e.target.value})} required />}
            <input type="email" placeholder="Email" className="auth-input" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} required />
            <div className="input-password">
              <input type="password" placeholder="Password" className="auth-input" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
              <span>👁️</span>
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Loading...' : tipe === 'login' ? 'MASUK' : 'DAFTAR'}</button>
          </form>
          {notif && <p style={{color: 'red', textAlign: 'center'}}>{notif}</p>}
        </div>
      </div>
    );
  }

  // HALAMAN UTAMA
  return (
    <div className="container">
      <header className="header">
        <h1 className="logo">NITA<span>beta</span></h1>
        <button className="icon-btn">🔔</button>
      </header>

      <div className="content">
        {page === 'home' && (
          <>
            <h2>Beranda</h2>
            {loading ? <div className="loading-full"><div className="loader"></div></div> : 
              posts.length === 0 ? <p className="empty-state">Belum ada postingan</p> :
              posts.map(p => (
                <div key={p.id} className="admin-card">
                  <h3>{p.judul}</h3>
                  <p>{p.isi}</p>
                  <small>by {p.nama}</small>
                </div>
              ))
            }
          </>
        )}

        {page === 'cari' && <h2>Halaman Cari 🔍</h2>}
        {page === 'inbox' && <h2>Halaman Inbox 💬</h2>}
        
        {page === 'profil' && (
          <div className="profil-page">
            <div className="profil-header">
              <div className="avatar-big">{user.nama.charAt(0)}</div>
              <div>
                <h2>{user.nama}</h2>
                <p className="profil-status">{user.status || 'pengunjung'}</p>
                <p>{user.email}</p>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>Keluar</button>
          </div>
        )}
      </div>

      {/* INI NAVBAR LENGKAP 5 TOMBOL */}
      <BottomNav />

      {/* POPUP FORM POST */}
      {showForm && (
        <div className="popup-overlay" onClick={() => setShowForm(false)}>
          <div className="popup-box" onClick={e => e.stopPropagation()}>
            <h3>Buat Postingan Baru</h3>
            <form onSubmit={handlePost}>
              <input type="text" placeholder="Judul" className="auth-input" value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} required />
              <textarea placeholder="Isi postingan..." className="auth-input" rows="4" value={form.isi} onChange={e => setForm({...form, isi: e.target.value})} required></textarea>
              <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Posting...' : 'Kirim'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // NAVBAR COMPONENT LENGKAP
  function BottomNav() {
    return (
      <nav className="navbar">
        <button onClick={() => setPage('home')} className={`nav-item ${page === 'home' ? 'active' : ''}`}>
          <span>🏠</span>Home
        </button>
        <button onClick={() => setPage('cari')} className={`nav-item ${page === 'cari' ? 'active' : ''}`}>
          <span>🔍</span>Cari
        </button>
        <button onClick={() => {setShowForm(true)}} className="nav-item nav-add">
          <span>+</span>
        </button>
        <button onClick={() => setPage('inbox')} className={`nav-item ${page === 'inbox' ? 'active' : ''}`}>
          <span>💬</span>Inbox
        </button>
        <button onClick={() => setPage('profil')} className={`nav-item ${page === 'profil' ? 'active' : ''}`}>
          <span>👤</span>Profil
        </button>
      </nav>
    );
  }
}

export default App;