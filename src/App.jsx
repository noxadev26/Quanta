import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, collection, query, orderBy, where, getDocs, doc, getDoc, setDoc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, onSnapshot, deleteDoc } from 'firebase/firestore'
import './App.css'

// CONFIG BARU QUANTA - SSI
const firebaseConfig = {
  apiKey: "AIzaSyAjDgzPe8tUNfYEZDsEIrrZlfc8hu9QlXI",
  authDomain: "quanta---ssi.firebaseapp.com",
  projectId: "quanta---ssi",
  storageBucket: "quanta---ssi.firebasestorage.app",
  messagingSenderId: "153029053903",
  appId: "1:153029053903:web:86cb0636f901fa6394d6ba"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
        const data = userDoc.data()
        setUserData(data)
        setIsAdmin(data?.isMember === true)
        setTimeout(() => { setPage('beranda') }, 500)

        onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), async (snap) => {
          const data = []
          for(const docSnap of snap.docs) {
            const p = docSnap.data()
            const authorDoc = await getDoc(doc(db, "users", p.uid))
            const commentsSnap = await getDocs(collection(db, "posts", docSnap.id, "comments"))
            data.push({ id: docSnap.id,...p, authorData: authorDoc.data(), comments: commentsSnap.docs.map(d=>({id:d.id,...d.data()})) })
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
    return `https://ui-avatars.com/api/?name=${nama || 'U'}&background=6366f1&color=fff&size=${size}&bold=true`
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
    if(!text) return
    await addDoc(collection(db, "posts", postId, "comments"), { uid: user.uid, text, createdAt: serverTimestamp() })
    const post = posts.find(p => p.id === postId)
    if(post.uid!== user.uid) {
      await addDoc(collection(db, "notifications"), { to: post.uid, from: user.uid, type: 'comment', postId, text: `mengomentari postinganmu`, read: false, createdAt: serverTimestamp() })
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

  if(loading) return <div className="loading-full"><div className="loader-premium"></div></div>

  return (
    <div className="container">
      {page === 'login' && <LoginPage setPage={setPage} />}
      {page === 'daftar' && <DaftarPage setPage={setPage} />}

      {user && (
        <>
          {page!== 'profil' && page!== 'profilOrang' && (
            <div className="header">
              <div className="logo" onClick={() => setPage('beranda')}>Quanta <span>• made by SSI</span></div>
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
          {page === 'profil' && <ProfilPage user={user} userData={userData} posts={posts} setPage={setPage} avatarUrl={avatarUrl} />}
          {page === 'inbox' && <InboxPage notifications={notifications} users={users} avatarUrl={avatarUrl} setPage={setPage} />}
          {page === 'admin' && isAdmin && <AdminPanel users={users} posts={posts} setPage={setPage} />}
          {page === 'cari' && <SearchPage posts={posts} setPage={setPage} />}

          <div className="navbar">
            <button onClick={() => setPage('beranda')} className={`nav-item ${page==='beranda'?'active':''}`}><span>🏠</span><p>Home</p></button>
            <button onClick={() => setPage('cari')} className={`nav-item ${page==='cari'?'active':''}`}><span>🔍</span><p>Cari</p></button>
            <button onClick={() => setPage('posting')} className={`nav-item nav-add ${page==='posting'?'active':''}`}><span>➕</span></button>
            <button onClick={() => setPage('inbox')} className={`nav-item ${page==='inbox'?'active':''}`}><span>💬</span><p>Inbox</p></button>
            <button onClick={() => setPage('profil')} className={`nav-item ${page==='profil'?'active':''}`}><span>👤</span><p>Profil</p></button>
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
        {users.slice(0,10).map((u,i) => (
          <div className="story-item" key={u.id} style={{animationDelay: `${i*0.1}s`}} onClick={() => goToProfile(u.id)}>
            <div className={`story-ring ${u.isMember? 'member' : ''}`}><img src={avatarUrl(u.nama, 60)} /></div>
            <p>{u.nama?.split(' ')[0]}</p>
          </div>
        ))}
      </div>
      <div className="banner"></div>
      {trendingPosts.length > 0 && <div className="trending-box"><h3>🔥 Trending Minggu Ini</h3>{trendingPosts.map((p,i) => <div className="trending-item" key={p.id} style={{animationDelay: `${i*0.1}s`}}><span>{p.judul}</span><small>❤️ {p.likes?.length || 0}</small></div>)}</div>}
      <div className="filter-tags">{['Semua', 'Edukasi', 'Sosial', 'Riset'].map(tag => <button key={tag} className={`tag-btn ${filter===tag?'active':''}`} onClick={() => setFilter(tag)}>{tag}</button>)}</div>
      
      {filteredPosts.length === 0 && <div className="empty-state">Belum ada postingan 😢<br/>Jadilah yang pertama posting!</div>}
      
      {filteredPosts.map((p, i) => (
        <div className="post-card" key={p.id} style={{animationDelay: `${i * 0.1}s`}}>
          <div className="post-header">
            <img src={avatarUrl(p.authorData?.nama)} className="post-avatar" onClick={() => goToProfile(p.uid)} />
            <div className="post-userinfo">
              <div className="post-author" onClick={() => goToProfile(p.uid)}>{p.authorData?.nama || 'User'} {p.authorData?.isMember && <span className="badge-member">Admin</span>}</div>
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
            {p.comments?.slice(0,2).map((c) => <div key={c.id} className="comment-item"><b>{users.find(u=>u.id===c.uid)?.nama}:</b> {c.text}</div>)}
            <div className="comment-input">
              <input placeholder="Tulis komentar..." value={commentInput[p.id]||''} onChange={e => setCommentInput({...commentInput, [p.id]: e.target.value})} onKeyPress={e => e.key==='Enter' && addComment(p.id, commentInput[p.id])} />
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
  const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0)
  const isFollowing = userData.following?.includes(uid)
  if(!profileUser) return null
  return(
    <div className="profil-page">
      <div className="profil-header"><button onClick={() => setPage('beranda')}>←</button><h2>Profil</h2></div>
      <div className="profil-body">
        <img className="avatar-big" src={avatarUrl(profileUser.nama, 100)} />
        <h3>{profileUser.nama}</h3>
        <p className="profil-status">{profileUser.tipe}</p>
        <p className="profil-detail">{profileUser.bidangStudi} • {profileUser.umur} th • {profileUser.domisili}</p>
        <div className="profil-stats">
          <div><b>{profileUser.followers?.length||0}</b><p>Followers</p></div>
          <div><b>{profileUser.following?.length||0}</b><p>Following</p></div>
          <div><b>{userPosts.length}</b><p>Post</p></div>
          <div><b>{totalLikes}</b><p>Likes</p></div>
        </div>
        {user.uid!== uid && <button className={`btn-follow ${isFollowing?'following':''}`} onClick={() => toggleFollow(uid)}>{isFollowing? 'Following' : 'Follow'}</button>}
      </div>
      <h4 className="section-title">Postingan</h4>
      {userPosts.length === 0 && <div className="empty-state">Belum ada postingan</div>}
      {userPosts.map(p => <div className="post-card" key={p.id}><b>{p.judul}</b><p>{p.text}</p><small>❤️ {p.likes?.length || 0}</small></div>)}
    </div>
  )
}

function LoginPage({ setPage }) { 
  const [email, setEmail] = useState(''); const [pass, setPass] = useState(''); const [showPass, setShowPass] = useState(false)
  return(
    <div className="auth-wrapper">
      <div className="glass-box">
        <div className="logo-big">QUANTA<span>SSI</span></div>
        <p className="welcome-sub">Selamat Datang Kembali</p>
        <input className="auth-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <div className="input-password"><input className="auth-input" placeholder="Password" type={showPass? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} /><span onClick={() => setShowPass(!showPass)}>{showPass? '🙈' : '👁️'}</span></div>
        <button className="btn-primary" onClick={() => signInWithEmailAndPassword(auth, email, pass)}>Masuk</button>
        <p className="auth-text">Belum punya akun? <span className="link" onClick={() => setPage('daftar')}>Daftar disini</span></p>
      </div>
    </div>
  )
}

function DaftarPage({ setPage }) { 
  const [form, setForm] = useState({ nama: '', email: '', pass: '', umur: '', bidang: '', domisili: '', kelamin: 'Laki-laki' }); 
  const [showPass, setShowPass] = useState(false); 
  
  async function daftar(isMember = false) { 
    if(!form.nama || !form.email || !form.pass) return alert('Isi semua data wajib *'); 
    const res = await createUserWithEmailAndPassword(auth, form.email, form.pass); 
    await setDoc(doc(db, "users", res.user.uid), { 
      nama: form.nama, email: form.email, isMember: isMember, status: 'aktif', 
      tipe: isMember ? 'admin' : 'pengunjung', umur: form.umur, bidangStudi: form.bidang, 
      domisili: form.domisili, kelamin: form.kelamin, following: [], followers: [], createdAt: serverTimestamp() 
    }); 
    alert('Daftar Berhasil!') 
  } 

  return(
    <div className="auth-wrapper">
      <div className="glass-box">
        <div className="logo-big">QUANTA<span>SSI</span></div>
        <p className="welcome-sub">Buat Akun Baru</p>
        <input className="auth-input" placeholder="Nama Lengkap *" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} />
        <input className="auth-input" placeholder="Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <div className="input-password"><input className="auth-input" placeholder="Password *" type={showPass? "text" : "password"} value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} /><span onClick={() => setShowPass(!showPass)}>{showPass? '🙈' : '👁️'}</span></div>
        <input className="auth-input" placeholder="Umur *" type="number" value={form.umur} onChange={e => setForm({...form, umur: e.target.value})} />
        <input className="auth-input" placeholder="Bidang Studi *" value={form.bidang} onChange={e => setForm({...form, bidang: e.target.value})} />
        <div className="btn-group">
          <button className="btn-primary" onClick={() => daftar(false)}>Daftar Pengunjung</button>
          <button className="btn-admin" onClick={() => daftar(true)}>Daftar Jadi Admin 🔑</button>
        </div>
        <p className="auth-text">Sudah punya akun? <span className="link" onClick={() => setPage('login')}>Masuk</span></p>
      </div>
    </div>
  )
}

function PostingPage({ user, userData, setPage }) { 
  const [judul, setJudul] = useState(''); const [text, setText] = useState(''); const [tag, setTag] = useState('Edukasi'); 
  async function posting() { 
    if(!userData.isMember) return alert('Hanya Admin/Anggota yang bisa posting'); 
    if(!judul || !text) return alert('Judul dan isi wajib diisi');
    await addDoc(collection(db, "posts"), { uid: user.uid, judul, text, tag, likes: [], commentCount: 0, createdAt: serverTimestamp() }); 
    alert('Posting Berhasil!'); setPage('beranda') 
  } 
  return(
    <div className="content">
      <div className="posting-box">
        <h2>✨ Buat Postingan Baru</h2>
        <select value={tag} onChange={e => setTag(e.target.value)} className="auth-input"><option>🧠 Edukasi</option><option>👥 Sosial</option><option>🔬 Riset</option></select>
        <input className="auth-input" placeholder="Judul Postingan" value={judul} onChange={e => setJudul(e.target.value)} />
        <textarea rows="6" placeholder="Isi pemikiranmu..." value={text} onChange={e => setText(e.target.value)}></textarea>
        <button className="btn-primary" onClick={posting}>Posting Sekarang</button>
      </div>
    </div>
  )
}

function ProfilPage({ user, userData, posts, setPage, avatarUrl }) { 
  const userPosts = posts.filter(p => p.uid === user.uid)
  const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0)
  return(
    <div className="profil-page">
      <div className="profil-header"><button onClick={() => setPage('beranda')}>←</button><h2>Profil Saya</h2></div>
      <div className="profil-body">
        <img className="avatar-big" src={avatarUrl(userData?.nama, 100)} />
        <h3>{userData?.nama}</h3>
        <p className="profil-status">{userData?.tipe}</p>
        <p className="profil-detail">{userData?.bidangStudi} • {userData?.umur} th</p>
        <div className="profil-stats">
          <div><b>{userData?.followers?.length||0}</b><p>Followers</p></div>
          <div><b>{userData?.following?.length||0}</b><p>Following</p></div>
          <div><b>{userPosts.length}</b><p>Post</p></div>
          <div><b>{totalLikes}</b><p>Likes</p></div>
        </div>
        <button className="btn-logout" onClick={() => signOut(auth)}>Keluar</button>
      </div>
      <h4 className="section-title">Postingan Saya</h4>
      {userPosts.length === 0 && <div className="empty-state">Kamu belum posting</div>}
      {userPosts.map(p => <div className="post-card" key={p.id}><b>{p.judul}</b><p>{p.text}</p><small>❤️ {p.likes?.length || 0}</small></div>)}
    </div>
  )
}

function InboxPage({ notifications, users, avatarUrl, setPage }) { 
  return(
    <div className="content">
      <div className="profil-header"><button onClick={() => setPage('beranda')}>←</button><h2>Notifikasi</h2></div>
      {notifications.length === 0 && <div className="empty-state">Belum ada notifikasi</div>}
      {notifications.map((n,i) => <div className="notif-card" key={n.id} style={{animationDelay: `${i*0.05}s`}}><img src={avatarUrl(users.find(u=>u.id===n.from)?.nama)} className="post-avatar"/><p><b>{users.find(u=>u.id===n.from)?.nama}</b> {n.text}</p></div>)}
    </div>
  )
}

function AdminPanel({ users, posts, setPage }) { 
  const [tab, setTab] = useState('akun')
  const [search, setSearch] = useState('')

  async function hapusUser(uid) {
    if(!confirm('Yakin hapus user ini?')) return
    await deleteDoc(doc(db, "users", uid))
    alert('User dihapus')
  }

  async function hapusPost(postId) {
    if(!confirm('Yakin hapus postingan ini?')) return
    await deleteDoc(doc(db, "posts", postId))
    alert('Postingan dihapus')
  }

  const filteredUsers = users.filter(u => u.nama?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
  const filteredPosts = posts.filter(p => p.judul?.toLowerCase().includes(search.toLowerCase()) || p.text?.toLowerCase().includes(search.toLowerCase()))

  return(
    <div className="content">
      <div className="admin-header"><button onClick={() => setPage('beranda')}>←</button><h2>Panel Admin</h2></div>
      <input className="auth-input" placeholder="🔍 Cari akun atau postingan..." value={search} onChange={e => setSearch(e.target.value)} />
      {/* Isi admin panel kamu di sini */}
    </div>
  )
}

function SearchPage({ posts, setPage }) {
  return <div className="content"><h2>🔍 Halaman Cari</h2></div>
}

export default App