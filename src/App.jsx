import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, collection, query, orderBy, getDocs, doc, getDoc, setDoc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import './App.css'

// CONFIG FIREBASE KAMU
const firebaseConfig = {
  apiKey: "AIzaSyAQnPtiko5TZ_ydHFty4SoJhVhjV_kVA_E",
  authDomain: "nalarku-app.firebaseapp.com",
  projectId: "nalarku-app",
  storageBucket: "nalarku-app.firebasestorage.app",
  messagingSenderId: "226783235192",
  appId: "1:226783235192:web:4ed40d9ac18574636b718d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [page, setPage] = useState('login') // login, daftar, beranda, posting, profil, inbox
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if(u) {
        setUser(u)
        const userDoc = await getDoc(doc(db, "users", u.uid))
        setUserData(userDoc.data())
        setPage('beranda')
        loadPosts()
      } else {
        setUser(null)
        setPage('login')
      }
      setLoading(false)
    })
  }, [])

  async function loadPosts() {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
    const snap = await getDocs(q)
    const data = []
    for(const docSnap of snap.docs) {
      const p = docSnap.data()
      const authorDoc = await getDoc(doc(db, "users", p.uid))
      data.push({ id: docSnap.id, ...p, authorData: authorDoc.data() })
    }
    setPosts(data)
  }

  function avatarUrl(nama, size=40) {
    return `https://ui-avatars.com/api/?name=${nama || 'U'}&background=6366f1&color=fff&size=${size}`
  }

  async function toggleLike(postId, ownerUid) {
    const postRef = doc(db, "posts", postId)
    const post = posts.find(p => p.id === postId)
    const isLiked = post.likes?.includes(user.uid)
    
    if(isLiked){
      await updateDoc(postRef, { likes: arrayRemove(user.uid) })
    } else {
      await updateDoc(postRef, { likes: arrayUnion(user.uid) })
    }
    loadPosts()
  }

  if(loading) return <div className="loading-full">Loading...</div>

  return (
    <div className="container">
      
      {/* PAGE LOGIN */}
      {page === 'login' && <LoginPage setPage={setPage} />}

      {/* PAGE DAFTAR */}
      {page === 'daftar' && <DaftarPage setPage={setPage} />}

      {user && (
        <>
          {/* HEADER */}
          {page !== 'profil' && (
            <div className="header">
              <div className="logo">QUANTA<span>SSI</span></div>
              <button className="icon-btn" onClick={() => signOut(auth)}>⚙️</button>
            </div>
          )}

          {/* PAGE BERANDA */}
          {page === 'beranda' && (
            <div className="content">
              <div className="banner"></div>
              {posts.length === 0 ? <p className="loading">Belum ada postingan</p> : 
                posts.map(p => (
                  <div className="post-card" key={p.id}>
                    <div className="post-header">
                      <img src={avatarUrl(p.authorData?.nama)} className="post-avatar" />
                      <div className="post-userinfo">
                        <div className="post-author">
                          {p.authorData?.nama || 'User'} 
                          {p.authorData?.isMember && <span className="badge-member">Anggota</span>}
                        </div>
                        <div className="post-time">Baru saja</div>
                      </div>
                    </div>
                    {!p.authorData?.isMember && <span className="post-tag pending">⏳ Menunggu Verifikasi</span>}
                    {p.authorData?.isMember && <span className="post-tag">{p.tag || 'Edukasi'}</span>}
                    <div className="post-title">{p.judul}</div>
                    {p.imageUrl && <img src={p.imageUrl} className="post-image" />}
                    <div className="post-text">{p.text}</div>
                    <div className="post-actions">
                      <button className={`action-btn ${p.likes?.includes(user.uid) ? 'liked' : ''}`} onClick={() => toggleLike(p.id, p.uid)}>
                        {p.likes?.includes(user.uid) ? '❤️' : '🤍'} {p.likes?.length || 0}
                      </button>
                      <button className="action-btn">💬 {p.commentCount || 0}</button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* PAGE POSTING */}
          {page === 'posting' && <PostingPage user={user} userData={userData} setPage={setPage} />}

          {/* PAGE PROFIL */}
          {page === 'profil' && <ProfilPage user={user} userData={userData} setPage={setPage} />}

          {/* PAGE INBOX */}
          {page === 'inbox' && <InboxPage />}

          {/* NAVBAR BAWAH */}
          <div className="navbar">
            <button onClick={() => setPage('beranda')} className={`nav-item ${page==='beranda'?'active':''}`}>🏠<br/>Home</button>
            <button className="nav-item">🔍<br/>Cari</button>
            <button onClick={() => setPage('posting')} className={`nav-item ${page==='posting'?'active':''}`}>➕<br/>Post</button>
            <button onClick={() => setPage('inbox')} className={`nav-item ${page==='inbox'?'active':''}`}>💬<br/>Inbox</button>
            <button onClick={() => setPage('profil')} className={`nav-item ${page==='profil'?'active':''}`}>👤<br/>Profil</button>
          </div>
        </>
      )}
    </div>
  )
}

// KOMPONEN LOGIN
function LoginPage({ setPage }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  return (
    <div className="auth-page">
      <h1>QUANTA <span>SSI</span></h1>
      <p>Masuk ke akunmu</p>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} />
      <button className="btn-primary" onClick={() => signInWithEmailAndPassword(auth, email, pass)}>Masuk</button>
      <p>Belum punya akun? <span className="link" onClick={() => setPage('daftar')}>Daftar disini</span></p>
    </div>
  )
}

// KOMPONEN DAFTAR ANGGOTA & PENGUNJUNG
function DaftarPage({ setPage }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [nama, setNama] = useState('')
  const [tipe, setTipe] = useState('pengunjung')

  async function daftar() {
    if(!nama || !email || !pass) return alert('Isi semua data')
    const res = await createUserWithEmailAndPassword(auth, email, pass)
    await setDoc(doc(db, "users", res.user.uid), {
      nama: nama,
      email: email,
      isMember: tipe === 'anggota',
      status: tipe === 'anggota' ? 'pending' : 'aktif',
      following: [],
      createdAt: serverTimestamp()
    })
    alert(tipe === 'anggota' ? 'Daftar Anggota terkirim! Tunggu verifikasi admin' : 'Daftar Pengunjung Berhasil!')
  }

  return (
    <div className="auth-page">
      <h1>Daftar QUANTA</h1>
      <input placeholder="Nama Lengkap" value={nama} onChange={e => setNama(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} />
      
      <label>Daftar sebagai:</label>
      <select value={tipe} onChange={e => setTipe(e.target.value)} className="input-select">
        <option value="pengunjung">Pengunjung - Bebas Lihat</option>
        <option value="anggota">Anggota SSI - Bisa Posting</option>
      </select>
      <p className="note">*Anggota wajib join grup SSI dulu. Nanti di verifikasi admin</p>

      <button className="btn-primary" onClick={daftar}>Daftar</button>
      <p>Sudah punya akun? <span className="link" onClick={() => setPage('login')}>Masuk</span></p>
    </div>
  )
}

// KOMPONEN POSTING
function PostingPage({ user, userData, setPage }) {
  const [judul, setJudul] = useState('')
  const [text, setText] = useState('')
  const [tag, setTag] = useState('Edukasi')

  async function posting() {
    if(!userData.isMember) return alert('Maaf, hanya Anggota SSI yang bisa posting')
    if(!judul || !text) return alert('Judul dan isi wajib diisi')
    await addDoc(collection(db, "posts"), {
      uid: user.uid,
      judul, text, tag,
      likes: [], commentCount: 0,
      createdAt: serverTimestamp()
    })
    alert('Postingan berhasil!')
    setPage('beranda')
  }

  return (
    <div className="content">
      <div className="posting-box">
        <h2>Buat Postingan</h2>
        <select value={tag} onChange={e => setTag(e.target.value)} className="input-select">
          <option>🧠 Edukasi</option>
          <option>👥 Sosial</option>
          <option>💻 Teknologi</option>
        </select>
        <input placeholder="Judul Postingan" value={judul} onChange={e => setJudul(e.target.value)} />
        <textarea rows="5" placeholder="Isi Postingan..." value={text} onChange={e => setText(e.target.value)}></textarea>
        <button className="btn-primary" onClick={posting}>Posting Sekarang</button>
      </div>
    </div>
  )
}

// KOMPONEN PROFIL
function ProfilPage({ user, userData, setPage }) {
  return (
    <div className="profil-page">
      <div className="profil-header">
        <button onClick={() => setPage('beranda')}>←</button>
        <h2>Profil</h2>
      </div>
      <div className="profil-body">
        <img className="avatar-big" src={avatarUrl(userData?.nama, 100)} />
        <h3>{userData?.nama}</h3>
        <p className="profil-status">{userData?.isMember ? 'Anggota SSI' : 'Pengunjung'}</p>
        <div className="stats">
          <div><b>0</b><span>Post</span></div>
          <div><b>0</b><span>Pengikut</span></div>
          <div><b>0</b><span>Mengikuti</span></div>
        </div>
        <button className="btn-logout" onClick={() => signOut(auth)}>Keluar</button>
        <h4>Postingan</h4>
        <p className="loading">Loading...</p>
      </div>
    </div>
  )
}

// KOMPONEN INBOX
function InboxPage() {
  return (
    <div className="content">
      <h2>Kotak Masuk</h2>
      <div className="post-card">
        <p>Belum ada notifikasi</p>
      </div>
    </div>
  )
}

export default App