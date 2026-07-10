import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, collection, query, orderBy, getDocs, doc, getDoc, setDoc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import './App.css'

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
const ADMIN_UID = "GANTI_DENGAN_UID_KAMU" 

function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if(u) {
        setUser(u)
        const userDoc = await getDoc(doc(db, "users", u.uid))
        const data = userDoc.data()
        setUserData(data)
        setIsAdmin(u.uid === ADMIN_UID)
        setTimeout(() => { // delay biar animasi masuk
          setPage('beranda')
          loadPosts()
          if(u.uid === ADMIN_UID) loadUsers()
        }, 300)
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

  async function loadUsers() {
    const snap = await getDocs(collection(db, "users"))
    setUsers(snap.docs.map(d => ({id: d.id, ...d.data()})))
  }

  function avatarUrl(nama, size=40) {
    return `https://ui-avatars.com/api/?name=${nama || 'U'}&background=6366f1&color=fff&size=${size}`
  }

  async function toggleLike(postId) {
    const postRef = doc(db, "posts", postId)
    const post = posts.find(p => p.id === postId)
    const isLiked = post.likes?.includes(user.uid)
    await updateDoc(postRef, { likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) })
    loadPosts()
  }

  if(loading) return <div className="loading-full"><div className="loader"></div></div>

  return (
    <div className="container">
      {page === 'login' && <LoginPage setPage={setPage} />}
      {page === 'daftar' && <DaftarPage setPage={setPage} />}

      {user && (
        <>
          {page !== 'profil' && (
            <div className="header">
              <div className="logo">QUANTA<span>SSI</span></div>
              {isAdmin && <button className="icon-btn" onClick={() => setPage('admin')}>🛡️</button>}
              {!isAdmin && <button className="icon-btn" onClick={() => signOut(auth)}>⚙️</button>}
            </div>
          )}

          {page === 'beranda' && (
            <div className="content">
              <div className="banner"></div>
              {posts.map((p, i) => (
                <div className="post-card" key={p.id} style={{animationDelay: `${i * 0.1}s`}}>
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
                    <button className={`action-btn ${p.likes?.includes(user.uid) ? 'liked' : ''}`} onClick={() => toggleLike(p.id)}>
                      {p.likes?.includes(user.uid) ? '❤️' : '🤍'} {p.likes?.length || 0}
                    </button>
                    <button className="action-btn">💬 {p.commentCount || 0}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {page === 'posting' && <PostingPage user={user} userData={userData} setPage={setPage} />}
          {page === 'profil' && <ProfilPage user={user} userData={userData} setPage={setPage} avatarUrl={avatarUrl} />}
          {page === 'inbox' && <InboxPage />}
          {page === 'admin' && isAdmin && <AdminPanel users={users} loadUsers={loadUsers} setPage={setPage} />}

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

function LoginPage({ setPage }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  return (
    <div className="auth-wrapper">
      <div className="glass-box">
        <p className="welcome-small">Welcome to</p>
        <h1 className="welcome-main">QUANTA</h1>
        <p className="welcome-sub">PROJECT</p>
        <input className="auth-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <div className="input-password">
          <input className="auth-input" placeholder="Password" type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} />
          <span onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</span>
        </div>
        <button className="btn-primary">Masuk</button>
        <p className="auth-text">Belum punya akun? <span className="link" onClick={() => setPage('daftar')}>Daftar disini</span></p>
      </div>
    </div>
  )
}

function DaftarPage({ setPage }) {
  const [form, setForm] = useState({ nama: '', email: '', pass: '', umur: '', bidang: '', domisili: '', kelamin: 'Laki-laki' })
  const [showPass, setShowPass] = useState(false)

  async function daftar() {
    if(!form.nama || !form.email || !form.pass || !form.umur || !form.bidang) return alert('Isi semua data wajib *')
    const res = await createUserWithEmailAndPassword(auth, form.email, form.pass)
    await setDoc(doc(db, "users", res.user.uid), {
      nama: form.nama, email: form.email, isMember: false, status: 'aktif', tipe: 'pengunjung',
      umur: form.umur, bidangStudi: form.bidang, domisili: form.domisili, kelamin: form.kelamin,
      following: [], createdAt: serverTimestamp()
    })
    alert('Daftar Pengunjung Berhasil!')
  }

  return (
    <div className="auth-wrapper">
      <div className="glass-box">
        <p className="welcome-small">Welcome to</p>
        <h1 className="welcome-main">QUANTA</h1>
        <p className="welcome-sub">PROJECT</p>
        <input className="auth-input" placeholder="Nama Lengkap *" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} />
        <input className="auth-input" placeholder="Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <div className="input-password">
          <input className="auth-input" placeholder="Password *" type={showPass ? "text" : "password"} value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} />
          <span onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</span>
        </div>
        <input className="auth-input" placeholder="Umur *" type="number" value={form.umur} onChange={e => setForm({...form, umur: e.target.value})} />
        <input className="auth-input" placeholder="Bidang Studi *" value={form.bidang} onChange={e => setForm({...form, bidang: e.target.value})} />
        <input className="auth-input" placeholder="Domisili (Opsional)" value={form.domisili} onChange={e => setForm({...form, domisili: e.target.value})} />
        <select value={form.kelamin} onChange={e => setForm({...form, kelamin: e.target.value})} className="auth-input">
          <option>Laki-laki</option><option>Perempuan</option>
        </select>
        <div className="btn-group">
          <button className="btn-primary" onClick={daftar}>Daftar Pengunjung</button>
          <button className="btn-disabled" disabled>Daftar Anggota 🔒</button>
        </div>
        <p className="note">*Anggota sementara ditutup. Tunggu update Admin Panel</p>
        <p className="auth-text">Sudah punya akun? <span className="link" onClick={() => setPage('login')}>Masuk</span></p>
      </div>
    </div>
  )
}

function PostingPage({ user, userData, setPage }) {
  const [judul, setJudul] = useState(''); const [text, setText] = useState(''); const [tag, setTag] = useState('Edukasi')
  async function posting() {
    if(!userData.isMember) return alert('Maaf, hanya Anggota SSI yang bisa posting')
    await addDoc(collection(db, "posts"), { uid: user.uid, judul, text, tag, likes: [], commentCount: 0, createdAt: serverTimestamp() })
    alert('Postingan berhasil!'); setPage('beranda')
  }
  return(<div className="content"><div className="posting-box"><h2>Buat Postingan</h2><select value={tag} onChange={e => setTag(e.target.value)} className="auth-input"><option>🧠 Edukasi</option><option>👥 Sosial</option></select><input className="auth-input" placeholder="Judul Postingan" value={judul} onChange={e => setJudul(e.target.value)} /><textarea rows="5" placeholder="Isi Postingan..." value={text} onChange={e => setText(e.target.value)}></textarea><button className="btn-primary" onClick={posting}>Posting Sekarang</button></div></div>)
}
function ProfilPage({ user, userData, setPage, avatarUrl }) {
  return(<div className="profil-page"><div className="profil-header"><button onClick={() => setPage('beranda')}>←</button><h2>Profil</h2></div><div className="profil-body"><img className="avatar-big" src={avatarUrl(userData?.nama, 100)} /><h3>{userData?.nama}</h3><p className="profil-status">{userData?.tipe}</p><p className="profil-detail">{userData?.bidangStudi} | {userData?.umur} th</p><button className="btn-logout" onClick={() => signOut(auth)}>Keluar</button></div></div>)
}
function InboxPage() {
  return(<div className="content"><h2>Kotak Masuk</h2><div className="post-card"><p>Belum ada notifikasi</p></div></div>)
}
function AdminPanel({ users, loadUsers, setPage }) {
  async function verifikasiAnggota(uid) {
    await updateDoc(doc(db, "users", uid), { isMember: true, status: 'aktif' })
    alert('Anggota berhasil diverifikasi!')
    loadUsers()
  }
  return (
    <div className="content">
      <div className="admin-header">
        <button onClick={() => setPage('beranda')}>← Kembali</button>
        <h2>Admin Panel</h2>
      </div>
      {users.map(u => (
        <div className="admin-card" key={u.id}>
          <div className="admin-info">
            <b>{u.nama}</b> <span className={`badge ${u.isMember ? 'member' : 'visitor'}`}>{u.tipe}</span>
            <p>Email: {u.email}</p>
            <p>Umur: {u.umur} | Bidang: {u.bidangStudi} | Kelamin: {u.kelamin}</p>
            <p>Domisili: {u.domisili || '-'}</p>
          </div>
          <div className="admin-actions">
            {u.tipe === 'anggota' && u.status === 'pending' && 
              <button className="btn-verif" onClick={() => verifikasiAnggota(u.id)}>Verifikasi</button>
            }
          </div>
        </div>
      ))}
    </div>
  )
}

export default App