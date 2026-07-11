import { useState, useEffect } from 'react';
import './App.css';
import { auth, db, storage } from './firebase.js'; // <-- TAMBAH storage
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js"; // <-- TAMBAH

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('pengunjung');
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState('glassmorphic');
  const [mode, setMode] = useState('gelap');
  const [animation, setAnimation] = useState(true);

  const [authForm, setAuthForm] = useState({nama: '', umur: '', domisili: '', bidang: '', wa: '', email: '', password: '', kodeUnik: ''});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kodeGenerated, setKodeGenerated] = useState('');

  // GANTI posts JADI materi
  const [materi, setMateri] = useState([]);
  const [materiForm, setMateriForm] = useState({judul: '', abstrak: '', bidangUtama: '', subBidang: '', tingkat: 'Umum', tipe: 'Ringkasan', file: null});
  const [previewFile, setPreviewFile] = useState(null);
  const [filter, setFilter] = useState({bidang: 'Semua', tingkat: 'Semua', tipe: 'Semua'});

  const [selectedMateri, setSelectedMateri] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [following, setFollowing] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [likedMateri, setLikedMateri] = useState([]);
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [users] = useState([{nama: 'Budi', type: 'anggota'}, {nama: 'Ani', type: 'pengunjung'}]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500);
    const isApp = window.Capacitor?.isNativePlatform;
    if (isApp) { setShowLanding(false); }
    fetchMateri(); // Ambil data materi
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        const userDoc = await getDoc(doc(db, "users", userAuth.uid));
        if(userDoc.exists()){
          const userData = { uid: userAuth.uid,...userDoc.data() };
          setUser(userData);
          setIsAdmin(userData.role === 'admin'); // Cek role admin
          setShowLanding(false);
        }
      } else {
        setUser(null); setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); }
  const generateKodeUnik = () => { const kode = 'QUA-' + Math.random().toString(36).substring(2, 8).toUpperCase(); setKodeGenerated(kode); setAuthForm({...authForm, kodeUnik: kode}); }
  const truncateText = (text, maxLength) => text.length > maxLength? text.substring(0, maxLength) + '...' : text;

  const fetchMateri = async () => {
    const q = query(collection(db, "materi"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setMateri(snapshot.docs.map(d => ({id: d.id,...d.data()})));
  }

  const handleAuth = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if(!authForm.email ||!authForm.password){ setError('Email dan Password wajib diisi!'); setLoading(false); return; }
      if(!isLogin && userType === 'anggota'){
        if(!authForm.nama ||!authForm.umur ||!authForm.bidang ||!authForm.wa ||!authForm.kodeUnik){
          setError('Semua data Anggota wajib diisi + Generate Kode Unik!'); setLoading(false); return;
        }
      }
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

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null); setPage('home'); setShowLanding(true); setViewProfile(null);
    setAuthForm({nama: '', umur: '', domisili: '', bidang: '', wa: '', email: '', password: '', kodeUnik: ''});
    setKodeGenerated(''); showToast('Logout berhasil');
  }

  // FITUR UPLOAD MATERI + KE FIREBASE STORAGE
  const handleUploadMateri = async () => {
    if(!materiForm.judul ||!materiForm.abstrak ||!materiForm.bidangUtama ||!materiForm.file){
      showToast('Judul, Abstrak, Bidang, dan File wajib diisi!'); return;
    }
    setLoading(true);
    try {
      const storageRef = ref(storage, `materi/${user.uid}/${Date.now()}-${materiForm.file.name}`);
      const snap = await uploadBytes(storageRef, materiForm.file);
      const fileUrl = await getDownloadURL(snap.ref);

      await addDoc(collection(db, "materi"), {
       ...materiForm, fileUrl, penulis: user.nama, penulisId: user.uid,
        status: 'pending', createdAt: serverTimestamp(), likes: 0
      });
      setMateriForm({judul: '', abstrak: '', bidangUtama: '', subBidang: '', tingkat: 'Umum', tipe: 'Ringkasan', file: null});
      setPreviewFile(null); setPage('home'); fetchMateri();
      showToast('Materi dikirim! Menunggu persetujuan Kurator');
    } catch(err) { showToast(err.message); }
    setLoading(false);
  }

  const handleSetujui = async (id) => {
    await updateDoc(doc(db, "materi", id), {status: 'published'});
    fetchMateri(); showToast('Materi disetujui');
  }

  const handleLike = (materiId) => {
    if(likedMateri.includes(materiId)) return;
    setLikedMateri([...likedMateri, materiId]);
    setMateri(materi.map(m => m.id === materiId? {...m, likes: m.likes + 1} : m));
  }

  if (showLanding &&!user) { /*... KODE LANDING KAMU TETAP... */ }
  if (isLoading) { return (<div className={`loading-screen ${theme} ${mode}`}><div className="loading-logo">QUANTA</div></div>); }
  if (!user) { /*... KODE AUTH KAMU TETAP... */ }

  return (
    <div className={`app-container ${theme} ${mode} ${animation? 'anim' : ''}`}>
      <TopNavbar page={page} onRefresh={fetchMateri} setMode={setMode} mode={mode} />
      <div className="page-content">

        {/* 1. BERANDA MATERI */}
        {page === 'home' && (<>
          <h2>📚 Beranda Materi</h2>
          {materi.filter(m => m.status === 'published').length === 0? <p className="empty-state">Belum ada materi. Yuk jadi kontributor pertama!</p> :
          materi.filter(m => m.status === 'published').map(m => (
            <div key={m.id} className="materi-card" onClick={() => setSelectedMateri(m)}>
              <span className="tag">{m.bidangUtama}</span>
              <h3>{m.judul}</h3>
              <p>{truncateText(m.abstrak, 120)}</p>
              <small>Oleh: {m.penulis} • {m.tipe} • {m.tingkat}</small>
            </div>
          ))}</>
        )}

        {/* 2. DETAIL MATERI */}
        {selectedMateri && (
          <div className="post-detail-page">
            <button className="btn-back" onClick={() => setSelectedMateri(null)}>← Kembali</button>
            <span className="tag">{selectedMateri.bidangUtama}</span>
            <h2>{selectedMateri.judul}</h2>
            <p><b>Penulis:</b> {selectedMateri.penulis} | <b>Tingkat:</b> {selectedMateri.tingkat}</p>
            <p>{selectedMateri.abstrak}</p>
            <a href={selectedMateri.fileUrl} target="_blank" className="btn-primary">📥 Download Materi</a>
            <div className="post-footer">
              <button className="like-btn" onClick={() => handleLike(selectedMateri.id)}>{likedMateri.includes(selectedMateri.id)? '❤️' : '🤍'} {selectedMateri.likes}</button>
            </div>
          </div>
        )}

        {/* 3. HALAMAN UPLOAD MATERI PRO */}
        {page === 'upload' && (
          <div className="upload-page">
            <h2>📤 Upload Materi Baru</h2>
            <input type="text" placeholder="Judul Materi *" className="auth-input" value={materiForm.judul} onChange={e => setMateriForm({...materiForm, judul: e.target.value})} />
            <textarea placeholder="Abstrak / Deskripsi Singkat *" className="auth-input textarea" value={materiForm.abstrak} onChange={e => setMateriForm({...materiForm, abstrak: e.target.value})} rows="3"></textarea>
            <div className="filter-row">
              <select className="auth-input" value={materiForm.bidangUtama} onChange={e => setMateriForm({...materiForm, bidangUtama: e.target.value})}>
                <option value="">Pilih Bidang Utama *</option>
                <option>Ekonomi</option><option>Psikologi</option><option>Sosiologi</option><option>Politik</option><option>Hukum</option>
              </select>
              <select className="auth-input" value={materiForm.tingkat} onChange={e => setMateriForm({...materiForm, tingkat: e.target.value})}>
                <option>SMA</option><option>Kuliah</option><option>Umum</option>
              </select>
              <select className="auth-input" value={materiForm.tipe} onChange={e => setMateriForm({...materiForm, tipe: e.target.value})}>
                <option>Ringkasan</option><option>Jurnal</option><option>PPT</option><option>Soal</option>
              </select>
            </div>
            <label className="upload-label">📎 Upload File PDF/PPT/JPG<input type="file" accept=".pdf,.ppt,.jpg,.png" onChange={e => {setMateriForm({...materiForm, file: e.target.files[0]}); setPreviewFile(URL.createObjectURL(e.target.files[0]))}} hidden /></label>
            {previewFile && <p>File: {materiForm.file.name}</p>}
            <button className="btn-primary" onClick={handleUploadMateri} disabled={loading}>{loading? 'Mengupload...' : 'Kirim Untuk Ditinjau'}</button>
          </div>
        )}

        {/* 4. HALAMAN EKSPLORASI + FILTER */}
        {page === 'eksplorasi' && (
          <div className="eksplorasi-page">
            <h2>🔍 Eksplorasi Materi</h2>
            <div className="filter-bar">
              <select className="auth-input" onChange={e => setFilter({...filter, bidang: e.target.value})}><option>Semua</option><option>Psikologi</option><option>Ekonomi</option><option>Sosiologi</option></select>
              <select className="auth-input" onChange={e => setFilter({...filter, tingkat: e.target.value})}><option>Semua</option><option>Kuliah</option><option>SMA</option></select>
              <select className="auth-input" onChange={e => setFilter({...filter, tipe: e.target.value})}><option>Semua</option><option>Jurnal</option><option>Ringkasan</option></select>
            </div>
            <div className="materi-grid">
              {materi.filter(m => m.status === 'published' && (filter.bidang === 'Semua' || m.bidangUtama === filter.bidang)).map(m => (
                <div key={m.id} className="materi-card" onClick={() => setSelectedMateri(m)}>
                  <span className="tag">{m.bidangUtama}</span>
                  <h3>{m.judul}</h3>
                  <p>{truncateText(m.abstrak, 80)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. PANEL ADMIN */}
        {page === 'admin' && isAdmin && (
          <div className="admin-page">
            <h2>👑 Ruang Kurator</h2>
            <h3>Antrian Moderasi: {materi.filter(m => m.status === 'pending').length} materi</h3>
            {materi.filter(m => m.status === 'pending').map(m => (
              <div key={m.id} className="admin-card">
                <h4>{m.judul}</h4>
                <p>{m.penulis} - {m.bidangUtama} - {m.tipe}</p>
                <a href={m.fileUrl} target="_blank">Lihat File</a>
                <button className="btn-primary" onClick={() => handleSetujui(m.id)}>Setujui</button>
              </div>
            ))}
          </div>
        )}

        {/*... SISA KODE PROFIL, PENGATURAN KAMU TETAP... */}
        {page === 'profil' && (<div className="profil-page"><h2>Profil {user.nama}</h2><button onClick={handleLogout} className="btn-logout">Logout</button></div>)}

      </div>
      <BottomNav page={page} setPage={setPage} isAdmin={isAdmin} />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );

  function TopNavbar({ page, onRefresh, setMode, mode }) { return (<nav className="top-navbar"><div><h1>Quanta Academic</h1></div><button className="icon-btn" onClick={() => setMode(mode === 'gelap'? 'terang' : 'gelap')}>{mode === 'gelap'? '☀️' : '🌙'}</button></nav>) }

  function BottomNav({ page, setPage, isAdmin }) { return (
    <nav className="navbar">
      <button onClick={() => setPage('home')} className={`nav-item ${page === 'home'? 'active' : ''}`}><span>🏠</span>Beranda</button>
      <button onClick={() => setPage('eksplorasi')} className={`nav-item ${page === 'eksplorasi'? 'active' : ''}`}><span>🔍</span>Eksplorasi</button>
      <button onClick={() => setPage('upload')} className="nav-item nav-add"><span>+</span></button>
      {isAdmin && <button onClick={() => setPage('admin')} className={`nav-item ${page === 'admin'? 'active' : ''}`}><span>👑</span>Admin</button>}
      <button onClick={() => setPage('profil')} className={`nav-item ${page === 'profil'? 'active' : ''}`}><span>👤</span>Profil</button>
    </nav>
  );}
}