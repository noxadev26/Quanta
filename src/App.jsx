import { useState, useEffect } from 'react';
import './App.css';
import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

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

  const [posts, setPosts] = useState([]);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [postSettings, setPostSettings] = useState({ like: true, comment: true, tampil: 'semua' });
  const [showSettingPopup, setShowSettingPopup] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users] = useState([{nama: 'Budi', type: 'anggota'}, {nama: 'Ani', type: 'pengunjung'}, {nama: 'Joko', type: 'anggota'}, {nama: 'Sari', type: 'anggota'}]);

  // STATE BARU BUAT FITUR BARU
  const [selectedPost, setSelectedPost] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [following, setFollowing] = useState([]);

  // LOADING + AUTO SKIP
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
    const isApp = window.Capacitor?.isNativePlatform;
    if (isApp) { setShowLanding(false); }
  }, []);

  // CEK LOGIN DARI FIREBASE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        const userDoc = await getDoc(doc(db, "users", userAuth.uid));
        if(userDoc.exists()){
          setUser({ uid: userAuth.uid,...userDoc.data() });
          setShowLanding(false);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); }
  const generateKodeUnik = () => { const kode = 'QUA-' + Math.random().toString(36).substring(2, 8).toUpperCase(); setKodeGenerated(kode); setAuthForm({...authForm, kodeUnik: kode}); }
  const handleImageUpload = (e) => { const file = e.target.files[0]; if(file) setPostImage(URL.createObjectURL(file)); }
  const truncateText = (text, maxLength) => text.length > maxLength? text.substring(0, maxLength) + '...' : text;

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
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
      ...authForm, type: userType, createdAt: serverTimestamp()
        });
      }
      showToast(`Selamat datang!`);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null); setPage('home'); setShowLanding(true); setViewProfile(null);
    setAuthForm({nama: '', umur: '', domisili: '', bidang: '', wa: '', email: '', password: '', kodeUnik: ''});
    setKodeGenerated(''); showToast('Logout berhasil');
  }

  const handlePost = () => {
    if(!postTitle ||!postContent){ showToast('Judul dan Isi wajib diisi!'); return; }
    const newPost = { id: Date.now(), title: postTitle, content: postContent, image: postImage, author: user.nama, authorId: user.uid, settings: postSettings, likes: 0 };
    setPosts([newPost,...posts]); setPostTitle(''); setPostContent(''); setPostImage(null); setPage('home'); showToast('Postingan berhasil!');
  }

  const handleLike = (postId) => {
    if(likedPosts.includes(postId)) return;
    setLikedPosts([...likedPosts, postId]);
    setPosts(posts.map(p => p.id === postId? {...p, likes: p.likes + 1} : p));
  }

  const handleComment = (postId) => {
    if(!commentInput) return;
    const newComment = {author: user.nama, text: commentInput};
    setComments({...comments, [postId]: [...(comments[postId] || []), newComment]});
    setCommentInput(''); showToast('Komentar ditambahkan');
  }

  const handleReset = () => { setPostTitle(''); setPostContent(''); setShowResetConfirm(false); setShowSettingPopup(false); showToast('Form direset'); }

  const handleFollow = (userId) => {
    if(following.includes(userId)){
      setFollowing(following.filter(id => id!== userId));
      showToast('Unfollow');
    } else {
      setFollowing([...following, userId]);
      showToast('Followed');
    }
  }

  // 1. LANDING PAGE
  if (showLanding &&!user) {
    return (
      <div className={`landing-container ${theme} ${mode}`}>
        <div className="dev-banner">🚧 PERINGATAN: Website ini masih dalam tahap pengembangan. Beberapa fitur belum tersedia sepenuhnya. 🚧</div>
        <nav className="landing-nav">
          <div className="nav-left"><h1>QUANTA</h1><p>PROJECT</p></div>
          <div className="nav-right"><button className="btn-nav" onClick={() => setShowLanding(false)}>Masuk</button></div>
        </nav>
        <section className="hero">
          <h1>Platform Edukasi Digital<br/>untuk Anggota SSI</h1>
          <p>QUANTA adalah ruang kolaborasi profesional. Berbagi materi, diskusi akademik, dan terhubung dengan sesama anggota dalam lingkungan yang terstruktur dan terfokus pada pembelajaran.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => setShowLanding(false)}>Mulai Bergabung</button>
            <a href="#fitur" className="btn-secondary">Pelajari Fitur</a>
          </div>
        </section>
        <section id="fitur" className="features">
          <h2>Standar Profesional. Fokus Edukasi.</h2>
          <div className="feature-grid">
            <div className="feature-card"><div className="icon">📝</div><h3>Berbagi Materi</h3><p>Unggah materi edukasi dan ringkasan dengan format yang rapi.</p></div>
            <div className="feature-card"><div className="icon">💬</div><h3>Diskusi Terarah</h3><p>Kolaborasi dalam forum diskusi yang konstruktif dan relevan.</p></div>
            <div className="feature-card"><div className="icon">🔒</div><h3>Lingkungan Aman</h3><p>Akses untuk Anggota dan Pengunjung terverifikasi SSI.</p></div>
          </div>
        </section>
        <footer className="landing-footer">
          <div className="footer-content">
            <div><h4>QUANTA PROJECT</h4><p>Platform Edukasi Digital SSI</p></div>
            <div><h4>Kontak</h4><p>Email: socialscience.id@gmail.com</p></div>
          </div>
          <p className="copyright">© 2026 QUANTA by SSI. All rights reserved.</p>
        </footer>
      </div>
    )
  }

  // 2. LOADING
  if (isLoading) { return (<div className={`loading-screen ${theme} ${mode}`}><div className="loading-logo">QUANTA</div><div className="loading-spinner"></div></div>); }

  // 3. LOGIN/DAFTAR
  if (!user) {
    return (
      <div className={`auth-wrapper ${theme} ${mode}`}>
        <div className="glass-box">
          <p className="welcome-top">Welcome to</p><h1 className="logo-big">QUANTA</h1><p className="welcome-sub">PROJECT</p>
          <div className="auth-tabs">
            <button className={isLogin? 'tab-active' : ''} onClick={() => {setIsLogin(true); setError('')}}>Masuk</button>
            <button className={!isLogin? 'tab-active' : ''} onClick={() => {setIsLogin(false); setError('')}}>Daftar</button>
          </div>
          {error && <p className="error-text">{error}</p>}
          <form onSubmit={handleAuth}>
            {!isLogin && (<div className="user-type-selector"><p>Pilih Tipe Akun:</p><div className="type-buttons"><button type="button" className={userType === 'pengunjung'? 'type-active' : ''} onClick={() => setUserType('pengunjung')}>Pengunjung</button><button type="button" className={userType === 'anggota'? 'type-active' : ''} onClick={() => setUserType('anggota')}>Anggota</button></div></div>)}
            {!isLogin && userType === 'anggota' && (<><input type="text" placeholder="Nama Lengkap *" className="auth-input" value={authForm.nama} onChange={e => setAuthForm({...authForm, nama: e.target.value})} required /><input type="email" placeholder="Email *" className="auth-input" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} required /><div className="password-wrapper"><input type={showPassword? 'text' : 'password'} placeholder="Password *" className="auth-input" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required /><span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword? '🙈' : '👁️'}</span></div><input type="tel" placeholder="No. WhatsApp *" className="auth-input" value={authForm.wa} onChange={e => setAuthForm({...authForm, wa: e.target.value})} required /><input type="number" placeholder="Umur *" className="auth-input" value={authForm.umur} onChange={e => setAuthForm({...authForm, umur: e.target.value})} required /><input type="text" placeholder="Bidang Studi *" className="auth-input" value={authForm.bidang} onChange={e => setAuthForm({...authForm, bidang: e.target.value})} required /><input type="text" placeholder="Domisili *" className="auth-input" value={authForm.domisili} onChange={e => setAuthForm({...authForm, domisili: e.target.value})} required /><div className="kode-unik-box"><h3>ID Verifikasi Anggota:</h3><button type="button" className="btn-generate" onClick={generateKodeUnik}>Generate ID</button>{kodeGenerated && <div className="kode-hasil">{kodeGenerated}</div>}</div></>)}
            {!isLogin && userType === 'pengunjung' && (<><input type="text" placeholder="Nama *" className="auth-input" value={authForm.nama} onChange={e => setAuthForm({...authForm, nama: e.target.value})} required /><input type="email" placeholder="Email *" className="auth-input" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} required /><div className="password-wrapper"><input type={showPassword? 'text' : 'password'} placeholder="Password *" className="auth-input" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required /><span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword? '🙈' : '👁️'}</span></div></>)}
            {isLogin && (<><input type="email" placeholder="Email" className="auth-input" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} required /><div className="password-wrapper"><input type={showPassword? 'text' : 'password'} placeholder="Password" className="auth-input" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required /><span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword? '🙈' : '👁️'}</span></div></>)}
            <button className="btn-primary" type="submit" disabled={loading}>{loading? 'Loading...' : isLogin? 'Masuk' : 'Daftar Sekarang'}</button>
          </form>
        </div>
      </div>
    );
  }

  // 4. APP UTAMA
  return (
    <div className={`app-container ${theme} ${mode} ${animation? 'anim' : ''}`}>
      <TopNavbar page={page} onRefresh={() => window.location.reload()} setMode={setMode} mode={mode} />
      <div className="page-content">

        {/* PAGE HOME - CARD DIPOTONG + ADA AVATAR */}
        {page === 'home' && (<>
          <h2>Beranda</h2>
          {posts.length === 0? <p className="empty-state">Belum ada postingan. Yuk posting pertama!</p> :
          posts.map(p => (
            <div key={p.id} className="post-card">
              <div className="post-header" onClick={() => setViewProfile(p.author)}>
                <div className="avatar-small">{p.author.charAt(0)}</div>
                <div><h4>{p.author}</h4><small>{new Date(p.id).toLocaleDateString()}</small></div>
              </div>
              <div onClick={() => setSelectedPost(p)}>
                <h3>{p.title}</h3>
                {p.image && <img src={p.image} className="post-image" />}
                <p>{truncateText(p.content, 150)}</p>
                {p.content.length > 150 && <span className="read-more">Baca Selengkapnya</span>}
              </div>
              <div className="post-footer">
                <button className="like-btn" onClick={() => handleLike(p.id)}>{likedPosts.includes(p.id)? '❤️' : '🤍'} {p.likes}</button>
                <span>{(comments[p.id] || []).length} Komentar</span>
              </div>
            </div>
          ))}</>
        )}

        {/* PAGE DETAIL POST */}
        {selectedPost && (
          <div className="post-detail-page">
            <button className="btn-back" onClick={() => setSelectedPost(null)}>← Kembali</button>
            <div className="post-header" onClick={() => {setViewProfile(selectedPost.author); setSelectedPost(null)}}>
              <div className="avatar">{selectedPost.author.charAt(0)}</div>
              <h3>{selectedPost.author}</h3>
            </div>
            <h2>{selectedPost.title}</h2>
            {selectedPost.image && <img src={selectedPost.image} className="post-image-full" />}
            <p>{selectedPost.content}</p>
            <div className="post-footer">
              <button className="like-btn" onClick={() => handleLike(selectedPost.id)}>{likedPosts.includes(selectedPost.id)? '❤️' : '🤍'} {selectedPost.likes} Like</button>
            </div>
            <div className="comment-section">
              <h4>Komentar</h4>
              {(comments[selectedPost.id] || []).map((c,i) => <div key={i} className="comment"><b>{c.author}:</b> {c.text}</div>)}
              <div className="comment-input-wrap">
                <input type="text" placeholder="Tulis komentar..." className="auth-input" value={commentInput} onChange={e => setCommentInput(e.target.value)} />
                <button onClick={() => handleComment(selectedPost.id)}>Kirim</button>
              </div>
            </div>
          </div>
        )}

        {/* PAGE PROFIL ORANG */}
        {viewProfile && (
          <div className="profil-page">
            <button className="btn-back" onClick={() => setViewProfile(null)}>← Kembali</button>
            <div className="profile-card">
              <div className="avatar">{viewProfile.charAt(0)}</div>
              <h2>{viewProfile}</h2>
              <span className={`badge anggota`}>Anggota</span>
              {viewProfile!== user.nama && (
                <button className="btn-primary" onClick={() => handleFollow(viewProfile)}>
                  {following.includes(viewProfile)? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            <div className="stats-grid">
              <div><h3>{posts.filter(p => p.author === viewProfile).length}</h3><p>Postingan</p></div>
              <div><h3>{posts.filter(p => p.author === viewProfile).reduce((a,p) => a + p.likes, 0)}</h3><p>Total Like</p></div>
              <div><h3>{Math.floor(Math.random() * 100)}</h3><p>Followers</p></div>
              <div><h3>{following.length}</h3><p>Following</p></div>
            </div>
            <h3>Postingan {viewProfile}</h3>
            {posts.filter(p => p.author === viewProfile).map(p => <div key={p.id} className="post-card" onClick={() => setSelectedPost(p)}><h4>{p.title}</h4></div>)}
          </div>
        )}

        {page === 'cari' && (<><h2>🔍 Cari User</h2><input type="text" placeholder="Cari nama user..." className="auth-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />{users.filter(u => u.nama.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (<div className="user-card" key={u.nama} onClick={() => setViewProfile(u.nama)}><div className="avatar-small">{u.nama[0]}</div><div><h4>{u.nama}</h4><span className={`badge ${u.type}`}>{u.type}</span></div></div>))}</>)}
        {page === 'post' && (<div className="post-page"><div className="top-nav-small"><h3>Posting</h3><button className="icon-btn" onClick={() => setShowSettingPopup(true)}>⚙️</button></div><input type="text" placeholder="Judul Postingan" className="auth-input" value={postTitle} onChange={e => setPostTitle(e.target.value)} /><textarea placeholder="Isi Postingan..." className="auth-input textarea" value={postContent} onChange={e => setPostContent(e.target.value)} rows="4"></textarea><label className="upload-label">📷 Upload Gambar<input type="file" accept="image/*" onChange={handleImageUpload} hidden /></label>{postImage && <img src={postImage} className="preview-image" />}<button className="btn-primary" onClick={handlePost}>Posting</button></div>)}
        {page === 'inbox' && <h2>💬 [COMING SOON]</h2>}
        {page === 'profil' && (<div className="profil-page"><div className="top-nav-small"><button className="icon-btn" onClick={() => setShowSidebar(true)}>☰</button><h3>Profil</h3><button className="icon-btn" onClick={() => setPage('pengaturan')}>⚙️</button></div><div className="profile-card"><div className="avatar">{user.nama.charAt(0).toUpperCase()}</div><h2>{user.nama}</h2><span className={`badge ${user.type}`}>{user.type}</span></div><div className="stats-grid"><div><h3>{posts.filter(p => p.author === user.nama).length}</h3><p>Postingan</p></div><div><h3>{posts.filter(p => p.author === user.nama).reduce((a,p) => a + p.likes, 0)}</h3><p>Total Like</p></div><div><h3>{Math.floor(Math.random() * 100)}</h3><p>Followers</p></div><div><h3>{following.length}</h3><p>Following</p></div></div><button onClick={handleLogout} className="btn-logout">Logout</button></div>)}
        {page === 'pengaturan' && (<div className="setting-page"><h2>Pengaturan Website</h2><div className="setting-group"><h4>Theme</h4><select value={theme} onChange={e => setTheme(e.target.value)} className="auth-input"><option value="glassmorphic">Glassmorphic</option><option value="basic">Basic</option></select><select value={mode} onChange={e => setMode(e.target.value)} className="auth-input"><option value="gelap">Gelap</option><option value="terang">Terang</option></select><label><input type="checkbox" checked={animation} onChange={e => setAnimation(e.target.checked)} /> Tampilkan Animasi</label></div><div className="setting-group"><h4>Keamanan</h4><button className="btn-secondary">Privat Akun</button><button className="btn-secondary">Edit Password & Email</button></div><div className="setting-group"><h4>Akun</h4><button className="btn-secondary">Edit Profil</button><button className="btn-secondary">Ganti Nama</button><button className="btn-secondary">Edit Bio</button><button className="btn-secondary">Ganti Foto Profil</button><button className="btn-secondary">Notifikasi</button><button className="btn-secondary">Bahasa</button></div><button className="btn-primary" onClick={() => setPage('profil')}>Kembali</button></div>)}
      </div>
      <BottomNav page={page} setPage={setPage} />
      {toast && <div className="toast">{toast}</div>}
      {showSidebar && (<div className="popup-overlay" onClick={() => setShowSidebar(false)}><div className="popup-box"><p>[Coming soon]</p></div></div>)}
      {showSettingPopup && (<div className="popup-overlay"><div className="popup-box"><div className="popup-header"><h3>Pengaturan Postingan</h3><button className="icon-btn-small" onClick={() => setShowSettingPopup(false)}>X</button></div><label><input type="checkbox" checked={postSettings.like} onChange={e => setPostSettings({...postSettings, like: e.target.checked})} /> Izinkan Like</button><label><input type="checkbox" checked={postSettings.comment} onChange={e => setPostSettings({...postSettings, comment: e.target.checked})} /> Izinkan Comment</button><label>Tampilkan pada:<select value={postSettings.tampil} onChange={e => setPostSettings({...postSettings, tampil: e.target.value})} className="auth-input"><option value="semua">Pengunjung & Anggota</option><option value="pengunjung">Pengunjung</option><option value="anggota">Anggota</option></select></button><button className="btn-danger" onClick={() => setShowResetConfirm(true)}>Reset Postingan</button></div></div>)}
      {showResetConfirm && (<div className="popup-overlay"><div className="popup-box"><p>Yakin reset postingan?</p><div className="popup-buttons"><button className="btn-primary" onClick={handleReset}>✓</button><button className="btn-secondary" onClick={() => {setShowResetConfirm(false); setShowSettingPopup(false)}}>X</button></div></div></div>)}
    </div>
  );

  function TopNavbar({ page, onRefresh, setMode, mode }) { return (<nav className="top-navbar"><div><h1>Quanta Project</h1><p>made by SSI</p></div><div style={{display: 'flex', gap: '10px'}}><button className="icon-btn" onClick={() => setMode(mode === 'gelap'? 'terang' : 'gelap')}>{mode === 'gelap'? '☀️' : '🌙'}</button><button className="icon-btn" onClick={onRefresh}>🔄</button></div></nav>) }
  function BottomNav({ page, setPage }) { return (<nav className="navbar"><button onClick={() => {setPage('home'); setSelectedPost(null); setViewProfile(null)}} className={`nav-item ${page === 'home'? 'active' : ''}`}><span>🏠</span>Home</button><button onClick={() => setPage('cari')} className={`nav-item ${page === 'cari'? 'active' : ''}`}><span>🔍</span>Cari</button><button onClick={() => setPage('post')} className="nav-item nav-add"><span>+</span></button><button onClick={() => setPage('inbox')} className={`nav-item ${page === 'inbox'? 'active' : ''}`}><span>💬</span>Inbox</button><button onClick={() => {setPage('profil'); setViewProfile(user.nama)}} className={`nav-item ${page === 'profil'? 'active' : ''}`}><span>👤</span>Profil</button></nav>); }
}