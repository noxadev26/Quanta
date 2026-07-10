import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, collection, query, orderBy, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
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
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [isMember, setIsMember] = useState(false)

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if(u) {
        setUser(u)
        const userDoc = await getDoc(doc(db, "users", u.uid))
        if(userDoc.exists()) {
          setIsMember(userDoc.data().isMember || false) // INI KUNCINYA: CEK ANGGOTA
        }
        loadPosts()
      } else {
        setUser(null)
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

  function avatarUrl(data) {
    const nama = data?.nama || 'U'
    return `https://ui-avatars.com/api/?name=${nama}&background=6366f1&color=fff&size=40`
  }

  if(!user) return <LoginPage />

  return (
    <div className="container">
      <div className="header">
        <div className="logo">QUANTA<span>SSI</span></div>
        <button className="icon-btn" onClick={() => signOut(auth)}>⚙️</button>
      </div>

      <div className="content">
        {posts.length === 0 ? <p className="loading">Loading postingan...</p> : 
          posts.map(p => (
            <div className="post-card" key={p.id}>
              <div className="post-header">
                <img src={avatarUrl(p.authorData)} className="post-avatar" />
                <div className="post-userinfo">
                  <div className="post-author">
                    {p.authorData?.nama || 'User'} 
                    {p.authorData?.isMember && <span className="badge-member">Anggota</span>}
                  </div>
                  <div className="post-time">Baru saja</div>
                </div>
              </div>

              {/* KALAU PENGUNJUNG POSTING KASIH TANDA */}
              {!p.authorData?.isMember && <span className="post-tag pending">⏳ Menunggu Verifikasi</span>}
              {p.authorData?.isMember && <span className="post-tag">{p.tag || 'Edukasi'}</span>}
              
              <div className="post-title">{p.judul}</div>
              {p.imageUrl && <img src={p.imageUrl} className="post-image" />}
              <div className="post-text">{p.text}</div>

              <div className="post-actions">
                <button className="action-btn">🤍 {p.likes?.length || 0}</button>
                <button className="action-btn">💬 {p.commentCount || 0}</button>
              </div>
            </div>
          ))
        }
      </div>

      {/* NAVBAR BAWAH SAMA PERSIS */}
      <div className="navbar">
        <a href="#" className="nav-item active">🏠<br/>Home</a>
        <a href="#" className="nav-item">🔍<br/>Cari</a>
        <a href="#" className="nav-item">➕<br/>Post</a>
        <a href="#" className="nav-item">💬<br/>Chat</a>
        <a href="#" className="nav-item">👤<br/>Profil</a>
      </div>
    </div>
  )
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  return (
    <div className="login-page">
      <h1>QUANTA <span>SSI</span></h1>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} />
      <button onClick={() => signInWithEmailAndPassword(auth, email, pass)}>Masuk</button>
      <button onClick={() => createUserWithEmailAndPassword(auth, email, pass)}>Daftar Pengunjung</button>
      <p>*Daftar sebagai Anggota wajib join grup SSI dulu</p>
    </div>
  )
}

export default App