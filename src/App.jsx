import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, collection, query, orderBy, where, getDocs, doc, getDoc, setDoc, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, onSnapshot, deleteDoc } from 'firebase/firestore'
import './App.css'

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

function generateVerificationId() {
  return 'QTA-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

export default function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminTab, setAdminTab] = useState('pending')
  const [users, setUsers] = useState([])

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if(u) {
        setUser(u)
        const userDoc = await getDoc(doc(db, "users", u.uid))
        const data = userDoc.data()
        setUserData(data)
        setIsAdmin(data?.isMember === true && data?.status === 'aktif')
        setPage('beranda')

        onSnapshot(query(collection(db, "users")), (snap) => {
          setUsers(snap.docs.map(d => ({id: d.id,...d.data()})))
        })

      } else {
        setUser(null)
        setPage('login')
      }
      setLoading(false)
    })
  }, [])

  if(loading) return <div className="loading-full"><div className="loader"></div></div>

  return (
    <div className="container">
      {page === 'login' && <LoginPage setPage={setPage} />}
      {page === 'daftar' && <DaftarPage setPage={setPage} />}

      {user && (
        <>
          {page!== 'profil' && (
            <div className="header">
              <div className="logo" onClick={() => setPage('beranda')}>QUANTA <span>made by SSI</span></div>
              {isAdmin && <button className="icon-btn" onClick={() => setPage('admin')}>🛡️</button>}
            </div>
          )}

          {page === 'beranda' && <BerandaPage setPage={setPage} />}
          {page === 'profil' && <ProfilPage user={user} userData={userData} setPage={setPage} />}
          {page === 'admin' && isAdmin && <AdminPanel users={users} setPage={setPage} adminTab={adminTab} setAdminTab={setAdminTab} />}

          <div className="navbar">
            <button onClick={() => setPage('beranda')} className={`nav-item ${page==='beranda'?'active':''}`}><span>🏠</span><p>Home</p></button>
            <button className={`nav-item nav-add`}><span>➕</span></button>
            <button onClick={() => setPage('profil')} className={`nav-item ${page==='profil'?'active':''}`}><span>👤</span><p>Profil</p></button>
          </div>
        </>
      )}
    </div>
  )
}

function LoginPage({ setPage }) {
  const [email, setEmail] = useState(''); const [pass, setPass] = useState(''); const [showPass, setShowPass] = useState(false)
  return(
    <div className="auth-wrapper">
      <div className="glass-box">
        <div className="logo-big">QUANTA</div>
        <p className="welcome-sub">Selamat Datang Kembali</p>
        <input className="auth-input" placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <div className="input-password"><input className="auth-input" placeholder="Password" type={showPass? "text" : "password"} onChange={e => setPass(e.target.value)} /><span onClick={() => setShowPass(!showPass)}>👁️</span></div>
        <button className="btn-primary" onClick={() => signInWithEmailAndPassword(auth, email, pass)}>Masuk</button>
        <p className="auth-text">Belum punya akun? <span className="link" onClick={() => setPage('daftar')}>Daftar disini</span></p>
      </div>
    </div>
  )
}

function DaftarPage({ setPage }) {
  const [form, setForm] = useState({ nama: '', email: '', pass: '', umur: '', bidang: '', domisili: '', wa: '' });
  const [showPass, setShowPass] = useState(false);
  const [tipeDaftar, setTipeDaftar] = useState('pengunjung')
  const [showKode, setShowKode] = useState(false)
  const [kodeUnik, setKodeUnik] = useState('')

  function mintaKode() {
    setKodeUnik(generateVerificationId())
    setShowKode(true)
  }

  async function daftar() {
    if(!form.nama ||!form.email ||!form.pass ||!form.wa) return alert('Isi semua data wajib *');

    const res = await createUserWithEmailAndPassword(auth, form.email, form.pass);

    if(tipeDaftar === 'anggota') {
      if(!kodeUnik) return alert('Klik "Minta Kode Unik" dulu')
      await setDoc(doc(db, "users", res.user.uid), {
      ...form, isMember: false, status: 'pending', tipe: 'pending anggota',
        verificationId: kodeUnik, following: [], followers: [], createdAt: serverTimestamp()
      });
      alert(`Daftar Berhasil!\n\nID Verifikasi: ${kodeUnik}\nKirim ID ini ke grup komunitas. Admin akan ACC kamu.`)
    } else {
      await setDoc(doc(db, "users", res.user.uid), {
      ...form, isMember: false, status: 'aktif', tipe: 'pengunjung',
        following: [], followers: [], createdAt: serverTimestamp()
      });
      alert('Daftar Pengunjung Berhasil!')
    }
  }

  return(
    <div className="auth-wrapper">
      <div className="glass-box">
        <div className="logo-big">QUANTA</div>
        <p className="welcome-sub">Buat Akun Baru</p>

        <div className="tipe-selector">
          <button className={tipeDaftar==='pengunjung'?'active':''} onClick={() => {setTipeDaftar('pengunjung'); setShowKode(false)}}>Pengunjung</button>
          <button className={tipeDaftar==='anggota'?'active':''} onClick={() => setTipeDaftar('anggota')}>Anggota</button>
        </div>

        {tipeDaftar === 'anggota' &&!showKode && (
          <button className="btn-kode" onClick={mintaKode}>Minta Kode Unik</button>
        )}

        {tipeDaftar === 'anggota' && showKode && (
          <div className="verification-box">
            <p><b>ID Verifikasi Anggota:</b></p>
            <h3>{kodeUnik}</h3>
            <small>Kirim ID ini ke grup komunitas untuk verifikasi. Setelah di ACC admin baru bisa login sebagai anggota.</small>
          </div>
        )}

        <input className="auth-input" placeholder="Nama Lengkap *" onChange={e => setForm({...form, nama: e.target.value})} />
        <input className="auth-input" placeholder="Email *" onChange={e => setForm({...form, email: e.target.value})} />
        <div className="input-password"><input className="auth-input" placeholder="Password *" type={showPass? "text" : "password"} onChange={e => setForm({...form, pass: e.target.value})} /><span onClick={() => setShowPass(!showPass)}>👁️</span></div>
        <input className="auth-input" placeholder="No. WhatsApp *" onChange={e => setForm({...form, wa: e.target.value})} />
        <input className="auth-input" placeholder="Umur *" type="number" onChange={e => setForm({...form, umur: e.target.value})} />
        <input className="auth-input" placeholder="Bidang Studi *" onChange={e => setForm({...form, bidang: e.target.value})} />
        <input className="auth-input" placeholder="Domisili *" onChange={e => setForm({...form, domisili: e.target.value})} />

        <button className="btn-primary" onClick={daftar}>Daftar Sekarang</button>
        <p className="auth-text">Sudah punya akun? <span className="link" onClick={() => setPage('login')}>Masuk</span></p>
      </div>
    </div>
  )
}

function AdminPanel({ users, setPage, adminTab, setAdminTab }) {
  const pendingUsers = users.filter(u => u.status === 'pending')

  async function verifikasiUser(uid) {
    await updateDoc(doc(db, "users", uid), { status: 'aktif', isMember: true, tipe: 'admin' })
    alert('User berhasil diverifikasi!')
  }

  return(
    <div className="admin-container">
      <div className="admin-sidebar">
        <h3>Panel Admin</h3>
        <button className={adminTab==='pending'?'active':''} onClick={() => setAdminTab('pending')}>⏳ Pending ({pendingUsers.length})</button>
        <button className={adminTab==='akun'?'active':''} onClick={() => setAdminTab('akun')}>👥 Semua Akun</button>
        <button onClick={() => setPage('beranda')}>← Kembali</button>
      </div>

      <div className="admin-content">
        {adminTab === 'pending' && (
          <div>
            <h2>Akun Menunggu Verifikasi</h2>
            {pendingUsers.length === 0 && <div className="empty-state">Tidak ada akun pending</div>}
            {pendingUsers.map(u => (
              <div className="admin-card" key={u.id}>
                <p><b>{u.nama}</b> - {u.email}</p>
                <p>WA: {u.wa} | ID: {u.verificationId}</p>
                <button className="btn-primary" onClick={() => verifikasiUser(u.id)}>Verifikasi & Jadikan Anggota</button>
              </div>
            ))}
          </div>
        )}
        {adminTab === 'akun' && (
          <div>
            <h2>Semua Akun</h2>
            {users.map(u => (
              <div className="admin-card" key={u.id}>
                <p><b>{u.nama}</b> - {u.tipe} - {u.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BerandaPage({ setPage }) {
  return <div className="content"><h2>Beranda Quanta</h2></div>
}
function ProfilPage({ user, userData, setPage }) {
  return(
    <div className="profil-page">
      <div className="profil-header"><button onClick={() => setPage('beranda')}>←</button><h2>Profil Saya</h2></div>
      <div className="profil-body">
        <div className="avatar-big">{userData?.nama?.split(' ').map(n=>n[0]).join('')}</div>
        <h3>{userData?.nama}</h3>
        <p className="profil-status">{userData?.tipe}</p>
        <button className="btn-logout" onClick={() => signOut(auth)}>Keluar</button>
      </div>
    </div>
  )
}