import { useState } from 'react';
import { auth, db } from '../firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

export default function Auth({ setPage, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('pengunjung');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kodeGenerated, setKodeGenerated] = useState('');
  const [authForm, setAuthForm] = useState({nama: '', umur: '', domisili: '', bidang: '', wa: '', email: '', password: '', kodeUnik: ''});

  const generateKodeUnik = () => { const kode = 'QUA-' + Math.random().toString(36).substring(2, 8).toUpperCase(); setKodeGenerated(kode); setAuthForm({...authForm, kodeUnik: kode}); }

  const handleAuth = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if(!authForm.email ||!authForm.password){ setError('Email dan Password wajib diisi!'); setLoading(false); return; }
      if(!isLogin && userType === 'anggota' && (!authForm.nama ||!authForm.kodeUnik)){ setError('Data Anggota wajib lengkap!'); setLoading(false); return; }
      if(!isLogin && userType === 'pengunjung' &&!authForm.nama){ setError('Nama wajib diisi!'); setLoading(false); return; }

      if(isLogin){
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
         ...authForm, type: userType, role: 'user', createdAt: serverTimestamp()
        });
      }
      showToast(`Selamat datang!`);
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div className="auth-wrapper glassmorphic gelap">
      <div className="glass-box">
        <p className="welcome-top">Welcome to</p><h1 className="logo-big">QUANTA</h1>
        <div className="auth-tabs">
          <button className={isLogin? 'tab-active' : ''} onClick={() => {setIsLogin(true); setError('')}}>Masuk</button>
          <button className={!isLogin? 'tab-active' : ''} onClick={() => {setIsLogin(false); setError('')}}>Daftar</button>
        </div>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleAuth}>
          {!isLogin && (<div className="user-type-selector"><p>Pilih Tipe Akun:</p><div className="type-buttons"><button type="button" className={userType === 'pengunjung'? 'type-active' : ''} onClick={() => setUserType('pengunjung')}>Pengunjung</button><button type="button" className={userType === 'anggota'? 'type-active' : ''} onClick={() => setUserType('anggota')}>Anggota</button></div></div>)}
          {!isLogin && <input type="text" placeholder="Nama Lengkap *" className="auth-input" value={authForm.nama} onChange={e => setAuthForm({...authForm, nama: e.target.value})} required />}
          <input type="email" placeholder="Email *" className="auth-input" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} required />
          <div className="password-wrapper"><input type={showPassword? 'text' : 'password'} placeholder="Password *" className="auth-input" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required /><span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword? '🙈' : '👁️'}</span></div>
          {!isLogin && userType === 'anggota' && (<>
            <input type="tel" placeholder="No. WhatsApp *" className="auth-input" value={authForm.wa} onChange={e => setAuthForm({...authForm, wa: e.target.value})} required />
            <input type="number" placeholder="Umur *" className="auth-input" value={authForm.umur} onChange={e => setAuthForm({...authForm, umur: e.target.value})} required />
            <input type="text" placeholder="Bidang Studi *" className="auth-input" value={authForm.bidang} onChange={e => setAuthForm({...authForm, bidang: e.target.value})} required />
            <div className="kode-unik-box"><h3>ID Verifikasi Anggota:</h3><button type="button" className="btn-generate" onClick={generateKodeUnik}>Generate ID</button>{kodeGenerated && <div className="kode-hasil">{kodeGenerated}</div>}</div>
          </>)}
          <button className="btn-primary" type="submit" disabled={loading}>{loading? 'Loading...' : isLogin? 'Masuk' : 'Daftar Sekarang'}</button>
        </form>
      </div>
    </div>
  );
}