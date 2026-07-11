import { useState } from 'react';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('pengunjung'); // pengunjung / anggota
  const [showPassword, setShowPassword] = useState(false);

  const [authForm, setAuthForm] = useState({
    nama: '', umur: '', domisili: '', bidang: '', wa: '', email: '', password: '', kodeUnik: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kodeGenerated, setKodeGenerated] = useState(''); // buat nyimpen kode unik

  // FUNCTION GENERATE KODE UNIK
  const generateKodeUnik = () => {
    const kode = 'QUA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setKodeGenerated(kode);
    setAuthForm({...authForm, kodeUnik: kode});
  }

  const handleAuth = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if(!authForm.email ||!authForm.password){
        setError('Email dan Password wajib diisi!');
        setLoading(false);
        return;
      }
      // VALIDASI KALO ANGGOTA
      if(!isLogin && userType === 'anggota'){
        if(!authForm.nama ||!authForm.umur ||!authForm.bidang ||!authForm.wa ||!authForm.kodeUnik){
          setError('Semua data Anggota wajib diisi + Generate Kode Unik!');
          setLoading(false);
          return;
        }
      }
      setUser({nama: authForm.nama || authForm.email.split('@')[0], type: userType});
      setLoading(false);
    }, 1000);
  }

  const handleLogout = () => {
    setUser(null);
    setAuthForm({nama: '', umur: '', domisili: '', bidang: '', wa: '', email: '', password: '', kodeUnik: ''});
    setKodeGenerated('');
  }

  // ===== HALAMAN LOGIN / REGISTER =====
  if (!user) {
    return (
      <div className="auth-wrapper">
        <div className="glass-box">
          <h1 className="logo-big">QUANTA</h1>
          <p className="welcome-sub">Platform Kreatif Indonesia</p>

          <div className="auth-tabs">
            <button className={isLogin? 'tab-active' : ''} onClick={() => {setIsLogin(true); setError('')}}>Masuk</button>
            <button className={!isLogin? 'tab-active' : ''} onClick={() => {setIsLogin(false); setError('')}}>Daftar</button>
          </div>

          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleAuth}>

            {/* PILIHAN PENGUNJUNG / ANGGOTA - CUMA MUNCUL SAAT DAFTAR */}
            {!isLogin && (
              <div className="user-type-selector">
                <p>Pilih Tipe Akun:</p>
                <div className="type-buttons">
                  <button type="button" className={userType === 'pengunjung'? 'type-active' : ''} onClick={() => setUserType('pengunjung')}>Pengunjung</button>
                  <button type="button" className={userType === 'anggota'? 'type-active' : ''} onClick={() => setUserType('anggota')}>Anggota</button>
                </div>
              </div>
            )}

            {/* FORM ANGGOTA LENGKAP */}
            {!isLogin && userType === 'anggota' && (
              <>
                <input type="text" placeholder="Nama Lengkap" className="auth-input" value={authForm.nama} onChange={e => setAuthForm({...authForm, nama: e.target.value})} required />
                <input type="number" placeholder="Umur" className="auth-input" value={authForm.umur} onChange={e => setAuthForm({...authForm, umur: e.target.value})} required />
                <input type="text" placeholder="Domisili (Opsional)" className="auth-input" value={authForm.domisili} onChange={e => setAuthForm({...authForm, domisili: e.target.value})} />
                <input type="text" placeholder="Bidang Studi Favorit" className="auth-input" value={authForm.bidang} onChange={e => setAuthForm({...authForm, bidang: e.target.value})} required />
                <input type="tel" placeholder="Nomor WA 08xxxxxxxx" className="auth-input" value={authForm.wa} onChange={e => setAuthForm({...authForm, wa: e.target.value})} required />

                {/* TOMBOL GENERATE KODE UNIK */}
                <div className="kode-unik-box">
                  <button type="button" className="btn-generate" onClick={generateKodeUnik}>Generate Kode Unik</button>
                  {kodeGenerated && (
                    <>
                      <div className="kode-hasil">{kodeGenerated}</div>
                      <p className="kode-info">Berikan kode unik tersebut kepada admin di grup komunitas untuk di verifikasi akun</p>
                    </>
                  )}
                </div>
              </>
            )}

            {/* FORM PENGUNJUNG - SIMPLE */}
            {!isLogin && userType === 'pengunjung' && (
              <input type="text" placeholder="Nama" className="auth-input" value={authForm.nama} onChange={e => setAuthForm({...authForm, nama: e.target.value})} required />
            )}

            {/* EMAIL & PASSWORD UNTUK SEMUA */}
            <input type="email" placeholder="Email" className="auth-input" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} required />

            <div className="password-wrapper">
              <input type={showPassword? 'text' : 'password'} placeholder="Password" className="auth-input" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword? '🙈' : '👁️'}</span>
            </div>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading? 'Loading...' : isLogin? 'MASUK' : 'DAFTAR SEKARANG'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===== HALAMAN UTAMA =====
  return (
    <div className="app-container">
      <div className="page-content">
        <h1>📄 Halaman {page}</h1>
        <p>Selamat datang, <b>{user.nama}</b>!</p>
        <p>Tipe Akun: <b>{user.type}</b></p>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
      <BottomNav />
    </div>
  );

  function BottomNav() {
    return (
      <nav className="navbar">
        <button onClick={() => setPage('home')} className={`nav-item ${page === 'home'? 'active' : ''}`}><span>🏠</span>Home</button>
        <button onClick={() => setPage('cari')} className={`nav-item ${page === 'cari'? 'active' : ''}`}><span>🔍</span>Cari</button>
        <button onClick={() => setPage('post')} className="nav-item nav-add"><span>+</span></button>
        <button onClick={() => setPage('inbox')} className={`nav-item ${page === 'inbox'? 'active' : ''}`}><span>💬</span>Inbox</button>
        <button onClick={() => setPage('profil')} className={`nav-item ${page === 'profil'? 'active' : ''}`}><span>👤</span>Profil</button>
      </nav>
    );
  }
}