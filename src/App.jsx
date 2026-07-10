import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, collection, query, orderBy, getDocs, doc, getDoc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore'
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

  function avatarUrl(nama) {
    return `https://ui-avatars.com/api/?name=${nama}&background=6366f1&color=fff&size=40`
  }

  return (
    <div className="container">
      
      {/* PAGE LOGIN */}
      {page === 'login' && <LoginPage setPage={setPage} />}

      {/* PAGE DAFTAR */}
      {page === 'daftar' && <DaftarPage setPage={setPage} />}

      {user && (
        <>
          {/* HEADER */}
          <div className="header">
            <div className="logo">QUANTA<span>SSI</span></div>
            <button className="icon-btn" onClick={() => signOut(auth)}>⚙️</button>
          </div>

          {/* PAGE BERANDA */}
          {page === 'beranda' && (
            <div className="content">
              {posts.map(p => (
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
                  <div className="post-text">{p.text}</div>
                  <div className="post-actions">
                    <button className="action-btn">🤍 {p.likes?.length || 0}</button>
                    <button className="action-btn">💬 {p.commentCount || 0}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAGE POSTING */}
          {page === 'posting' && <PostingPage user={user} userData={userData} />}

          {/* PAGE PROFIL */}
          {page === 'profil' && <ProfilPage userData={userData} />}

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
  const [tipe, setTipe] = useState('pengunjung') // anggota, pengunjung

  async function daftar() {
    const res = await createUserWithEmailAndPassword(auth, email, pass)
    await setDoc(doc(db, "users", res.user.uid), {
      nama: nama,
      email: email,
      isMember: tipe === 'anggota', // KUNCINYA DI SINI
      status: tipe === 'anggota' ? 'pending' : 'aktif', // anggota nunggu verifikasi admin
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
        <option value="pengunjung">Pengunjung - Bebas Posting</option>
        <option value="anggota">Anggota SSI - Perlu Verifikasi</param>
      </select>
      <p className="note">*Anggota wajib join grup SSI dulu</p>

      <button className="btn-primary" onClick={daftar}>Daftar</button>
      <p>Sudah punya akun? <span className="link" onClick={() => setPage('login')}>Masuk</span></p>
    </div>
  )
}

// KOMPONEN POSTING
function PostingPage({ user, userData }) {
  const [judul, setJudul] = useState('')
  const [text, setText] = useState('')
  const [tag, setTag] = useState('Edukasi')

  async function posting() {
    if(!userData.isMember) return alert('Hanya Anggota yang bisa posting langsung')
    await addDoc(collection(db, "posts"), {
      uid: user.uid,
      judul, text, tag,
      likes: [], commentCount: 0,
      createdAt: serverTimestamp()
    })
    alert('Postingan berhasil!')
    setJudul(''); setText('')
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
function ProfilPage({ userData }) {
  return (
    <div className="content">
      <div className="profil-box">
        <img className="avatar-big" src={avatarUrl(userData?.nama)} />
        <h3>{userData?.nama}</h3>
        <p>{userData?.isMember ? 'Anggota SSI' : 'Pengunjung'}</p>
        <div className="stats">
          <div><b>0</b><span>Post</span></div>
          <div><b>0</b><span>Pengikut</span></div>
          <div><b>0</b><span>Mengikuti</span></div>
        </div>
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