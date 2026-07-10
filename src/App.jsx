import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, collection, query, orderBy, where, getDocs, doc, getDoc, setDoc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore'
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
  const [notifications, setNotifications] = useState([])
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if(u) {
        setUser(u)
        const userDoc = await getDoc(doc(db, "users", u.uid))
        setUserData(userDoc.data())
        setIsAdmin(u.uid === ADMIN_UID)
        setTimeout(() => { setPage('beranda') }, 300)

        onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), async (snap) => {
          const data = []
          for(const docSnap of snap.docs) {
            const p = docSnap.data()
            const authorDoc = await getDoc(doc(db, "users", p.uid))
            const commentsSnap = await getDocs(collection(db, "posts", docSnap.id, "comments"))
            data.push({ id: docSnap.id,...p, authorData: authorDoc.data(), comments: commentsSnap.docs.map(d=>d.data()) })
          }
          setPosts(data)
        })

        onSnapshot(query(collection(db, "users")), (snap) => {
          setUsers(snap.docs.map(d => ({id: d.id,...d.data()})))
        })

        onSnapshot(query(collection(db, "notifications"), where("to", "==", u.uid), orderBy("createdAt", "desc")), (snap) => {
          setNotifications(snap.docs.map(d => ({id: d.id,...d.data()})))
        })

      } else {
        setUser(null)
        setPage('login')
      }
      setLoading(false)
    })
  }, [])

  function avatarUrl(nama, size=40) {
    return `https://ui-avatars.com/api/?name=${nama || 'U'}&background=6366f1&color=fff&size=${size}`
  }

  async function toggleLike(postId) {
    const postRef = doc(db, "posts", postId)
    const post = posts.find(p => p.id === postId)
    const isLiked = post.likes?.includes(user.uid)
    await updateDoc(postRef, { likes: isLiked? arrayRemove(user.uid) : arrayUnion(user.uid) })
    if(!isLiked && post.uid!== user.uid) {
      await addDoc(collection(db, "notifications"), { to: post.uid, from: user.uid, type: 'like', postId, text: 'menyukai postinganmu', read: false, createdAt: serverTimestamp() })
    }
  }

  async function addComment(postId, text) {
    await addDoc(collection(db, "posts", postId, "comments"), { uid: user.uid, text, createdAt: serverTimestamp() })
    const post = posts.find(p => p.id === postId)
    if(post.uid!== user.uid) {
      await addDoc(collection(db, "notifications"), { to: post.uid, from: user.uid, type: 'comment', postId, text: `mengomentari: ${text}`, read: false, createdAt: serverTimestamp() })
    }
    await updateDoc(doc(db, "posts", postId), { commentCount: (post.commentCount || 0) + 1 })
  }

  async function toggleFollow(targetUid) {
    const meRef = doc(db, "users", user.uid)
    const targetRef = doc(db, "users", targetUid)
    const isFollowing = userData.following?.includes(targetUid)
    await updateDoc(meRef, { following: isFollowing? arrayRemove(targetUid) : arrayUnion(targetUid) })
    await updateDoc(targetRef, { followers: isFollowing? arrayRemove(user.uid) : arrayUnion(user.uid) })
    if(!isFollowing) {
      await addDoc(collection(db, "notifications"), { to: targetUid, from: user.uid, type: 'follow', text: 'mengikuti kamu', read: false, createdAt: serverTimestamp() })
    }
    setUserData({...userData, following: isFollowing? userData.following.filter(id=>id!==targetUid) : [...(userData.following||[]), targetUid]})
  }

  if(loading) return <div className="loading-full"><div className="loader"></div></div>

  return (
    <div className="container">
      {page === 'login' && <LoginPage setPage={setPage} />}
      {page === 'daftar' && <DaftarPage setPage={setPage} />}

      {user && (
        <>
          {page!== 'profil' && page!== 'profilOrang' && (
            <div className="header">
              <div className="logo" onClick={() => setPage('beranda')}>QUANTA<span>SSI</span></div>
              <div className="header-right">
                {notifications.filter(n =>!n.read).length > 0 && <span className="notif-badge">{notifications.filter(n =>!n.read).length}</span>}
                <button className="icon-btn" onClick={() => setPage('inbox')}>🔔</button>
                {isAdmin && <button className="icon-btn" onClick={() => setPage('admin')}>🛡️</button>}
              </div>
            </div>
          )}

          {page === 'beranda' && <BerandaPage posts={posts} user={user} userData={userData} users={users} toggleLike={toggleLike} addComment={addComment} avatarUrl={avatarUrl} setPage={setPage} setSelectedProfile={setSelectedProfile} />}
          {page === 'profilOrang' && <ProfilOrangPage uid={selectedProfile} users={users} posts={posts} user={user} userData={userData} toggleFollow={toggleFollow} avatarUrl={avatarUrl} setPage={setPage} />}
          {page === 'posting' && <PostingPage user={user} userData={userData} setPage={setPage} />}
          {page === 'profil' && <ProfilPage user={user} userData={userData} setPage={setPage} avatarUrl={avatarUrl} />}
          {page === 'inbox' && <InboxPage notifications={notifications} users={users} avatarUrl={avatarUrl} />}
          {page === 'admin' && isAdmin && <AdminPanel users={users} setPage={setPage} />}
          {page === 'cari' && <SearchPage posts={posts} setPage={setPage} />}

          <div className="navbar">
            <button onClick={() => setPage('beranda')} className={`nav-item ${page==='beranda'?'active':''}`}>🏠<br/>Home</button>
            <button onClick={() => setPage('cari')} className={`nav-item ${page==='cari'?'active':''}`}>🔍<br/>Cari</button>
            <button onClick={() => setPage('posting')} className={`nav-item ${page==='posting'?'active':''}`}>➕<br/>Post</button>
            <button onClick={() => setPage('inbox')} className={`nav-item ${page==='inbox'?'active':''}`}>💬<br/>Inbox</button>
            <button onClick={() => setPage('profil')} className={`nav-item ${page==='profil'?'active':''}`}>👤<br/>Profil</button>
          </div>
        </>
      )}
    </div>
  )
}

function BerandaPage({ posts, user, userData, users, toggleLike, addComment, avatarUrl, setPage, setSelectedProfile }) {
  const [filter, setFilter] = useState('Semua')
  const [commentInput, setCommentInput] = useState({})
  const trendingPosts = [...posts].sort((a,b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0,3)
  const filteredPosts = filter === 'Semua'? posts : posts.filter(p => p.tag?.includes(filter))

  const goToProfile = (uid) => { setSelectedProfile(uid); setPage('profilOrang') }

  return (
    <div className="content">
      <div className="story-wrapper">
        {users.slice(0,10).map(u => (
          <div className="story-item" key={u.id} onClick={() => goToProfile(u.id)}>
            <div className={`story-ring ${u.isMember? 'member' : ''}`}><img src={avatarUrl(u.nama, 60)} /></div>
            <p>{u.nama?.split(' ')[0]}</p>
          </div>
        ))}
      </div>
      <div className="banner"></div>
      {trendingPosts.length > 0 && <div className="trending-box"><h3>🔥 Trending</h3>{trendingPosts.map(p => <div className="trending-item" key={p.id}><span>{p.judul}</span><small>❤️ {p.likes?.length || 0}</small></div>)}</div>}
      <div className="filter-tags">{['Semua', 'Edukasi', 'Sosial', 'Riset'].map(tag => <button key={tag} className={`tag-btn ${filter===tag?'active':''}`} onClick={() => setFilter(tag)}>{tag}</button>)}</div>
      
      {filteredPosts.map((p, i) => (
        <div className="post-card" key={p.id} style={{animationDelay: `${i * 0.1}s`}}>
          <div className="post-header">
            <img src={avatarUrl(p.authorData?.nama)} className="post-avatar" onClick={() => goToProfile(p.uid)} />
            <div className="post-userinfo">
              <div className="post-author" onClick={() => goToProfile(p.uid)}>{p.authorData?.nama || 'User'} {p.authorData?.isMember && <span className="badge-member">Anggota</span>}</div>
              <div className="post-time">Baru saja</div>
            </div>
          </div>
          <span className="post-tag">{p.tag || 'Edukasi'}</span>
          <div className="post-title">{p.judul}</div>
          <div className="post-text">{p.text}</div>
          <div className="post-actions">
            <button className={`action-btn ${p.likes?.includes(user.uid)? 'liked' : ''}`} onClick={() => toggleLike(p.id)}>❤️ {p.likes?.length || 0}</button>
            <button className="action-btn">💬 {p.comments?.length || 0}</button>
          </div>
          <div className="comment-section">
            {p.comments?.slice(0,2).map((c,idx) => <div key={idx} className="comment-item"><b>{users.find(u=>u.id===c.uid)?.nama}:</b> {c.text}</div>)}
            <div className="comment-input">
              <input placeholder="Tulis komentar..." value={commentInput[p.id]||''} onChange={e => setCommentInput({...commentInput, [p.id]: e.target.value})} />
              <button onClick={() => {addComment(p.id, commentInput[p.id]); setCommentInput({...commentInput, [p.id]: ''})}}>Kirim</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProfilOrangPage({ uid, users, posts, user, userData, toggleFollow, avatarUrl, setPage }) {
  const profileUser = users.find(u => u.id === uid)
  const userPosts = posts.filter(p => p.uid === uid)
  const isFollowing = userData.following?.includes(uid)
  if(!profileUser) return null

  return(
    <div className="profil-page">
      <div className="profil-header"><button onClick={() => setPage('beranda')}>←</button><h2>Profil</h2></div>
      <div className="profil-body">
        <img className="avatar-big" src={avatarUrl(profileUser.nama, 100)} />
        <h3>{profileUser.nama}</h3>
        <p className="profil-status">{profileUser.tipe}</p>
        <p className="profil-detail">{profileUser.bidangStudi} | {profileUser.umur} th</p>
        <p className="profil-stats">{profileUser.followers?.length||0} Followers • {profileUser.following?.length||0} Following</p>
        {user.uid!== uid && <button className={`btn-follow ${isFollowing?'following':''}`} onClick={() => toggleFollow(uid)}>{isFollowing? 'Following' : 'Follow'}</button>}
      </div>
      <h4 style={{padding:'0 16px'}}>Postingan</h4>
      {userPosts.map(p => <div className="post-card" key={p.id}><b>{p.judul}</b><p>{p.text}</p></div>)}
    </div>
  )
}

// KOMPONEN LAIN
function LoginPage({ setPage }) { const [email, setEmail] = useState(''); const [pass, setPass] = useState(''); const [showPass, setShowPass] = useState(false); return(<div className="auth-wrapper"><div className="glass-box"><p className="welcome-small">Welcome to</p><h1 className="welcome-main">QUANTA</h1><p className="welcome-sub">PROJECT</p><input className="auth-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><div className="input-password"><input className="auth-input" placeholder="Password" type={showPass? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} /><span onClick={() => setShowPass(!showPass)}>{showPass? '🙈' : '👁️'}</span></div><button className="btn-primary" onClick={() => signInWithEmailAndPassword(auth, email, pass)}>Masuk</button><p className="auth-text">Belum punya akun? <span className="link" onClick={() => setPage('daftar')}>Daftar disini</span></p></div></div>)}
function DaftarPage({ setPage }) { const [form, setForm] = useState({ nama: '', email: '', pass: '', umur: '', bidang: '', domisili: '', kelamin: 'Laki-laki' }); const [showPass, setShowPass] = useState(false); async function daftar() { if(!form.nama || !form.email || !form.pass) return alert('Isi semua data wajib *'); const res = await createUserWithEmailAndPassword(auth, form.email, form.pass); await setDoc(doc(db, "users", res.user.uid), { nama: form.nama, email: form.email, isMember: false, status: 'aktif', tipe: 'pengunjung', umur: form.umur, bidangStudi: form.bidang, domisili: form.domisili, kelamin: form.kelamin, following: [], followers: [], createdAt: serverTimestamp() }); alert('Daftar Berhasil!') } return(<div className="auth-wrapper"><div className="glass-box"><p className="welcome-small">Welcome to</p><h1 className="welcome-main">QUANTA</h1><p className="welcome-sub">PROJECT</p><input className="auth-input" placeholder="Nama Lengkap *" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} /><input className="auth-input" placeholder="Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /><div className="input-password"><input className="auth-input" placeholder="Password *" type={showPass? "text" : "password"} value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} /><span onClick={() => setShowPass(!showPass)}>{showPass? '🙈' : '👁️'}</span></div><input className="auth-input" placeholder="Umur *" type="number" value={form.umur} onChange={e => setForm({...form, umur: e.target.value})} /><input className="auth-input" placeholder="Bidang Studi *" value={form.bidang} onChange={e => setForm({...form, bidang: e.target.value})} /><div className="btn-group"><button className="btn-primary" onClick={daftar}>Daftar Pengunjung</button><button className="btn-disabled" disabled>Daftar Anggota 🔒</button></div><p className="auth-text">Sudah punya akun? <span className="link" onClick={() => setPage('login')}>Masuk</span></p></div></div>)}
function PostingPage({ user, userData, setPage }) { const [judul, setJudul] = useState(''); const [text, setText] = useState(''); const [tag, setTag] = useState('Edukasi'); async function posting() { if(!userData.isMember) return alert('Hanya Anggota'); await addDoc(collection(db, "posts"), { uid: user.uid, judul, text, tag, likes: [], commentCount: 0, createdAt: serverTimestamp() }); alert('Posting!'); setPage('beranda') } return(<div className="content"><div className="posting-box"><h2>Buat Postingan</h2><select value={tag} onChange={e => setTag(e.target.value)} className="auth-input"><option>🧠 Edukasi</option><option>👥 Sosial</option></select><input className="auth-input" placeholder="Judul" value={judul} onChange={e => setJudul(e.target.value)} /><textarea rows="5" placeholder="Isi..." value={text} onChange={e => setText(e.target.value)}></textarea><button className="btn-primary" onClick={posting}>Posting</button></div></div>)}
function ProfilPage({ user, userData, setPage, avatarUrl }) { return(<div className="profil-page"><div className="profil-header"><button onClick={() => setPage('beranda')}>←</button><h2>Profil</h2></div><div className="profil-body"><img className="avatar-big" src={avatarUrl(userData?.nama, 100)} /><h3>{userData?.nama}</h3><p className="profil-status">{userData?.tipe}</p><p className="profil-detail">{userData?.bidangStudi} | {userData?.umur} th</p><p className="profil-stats">{userData?.followers?.length||0} Followers • {userData?.following?.length||0} Following</p><button className="btn-logout" onClick={() => signOut(auth)}>Keluar</button></div></div>)}
function InboxPage({ notifications, users, avatarUrl }) { return(<div className="content"><h2>Notifikasi</h2>{notifications.map(n => <div className="notif-card" key={n.id}><img src={avatarUrl(users.find(u=>u.id===n.from)?.nama)} className="post-avatar"/><p>{users.find(u=>u.id===n.from)?.nama} {n.text}</p></div>)}</div>)}
function AdminPanel({ users, setPage }) { return(<div className="content"><div className="admin-header"><button onClick={() => setPage('beranda')}>←</button><h2>Admin</h2></div>{users.map(u => <div className="admin-card" key={u.id}><b>{u.nama}</b> <span>{u.tipe}</span></div>)}</div>)}
function SearchPage({ posts, setPage }) { const [search, setSearch] = useState(''); const results = posts.filter(p => p.judul.toLowerCase().includes(search.toLowerCase())); return(<div className="content"><input className="auth-input" placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} />{results.map(p => <div className="post-card" key={p.id}><b>{p.judul}</b></div>)}</div>)}

export default App