import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

export default function Beranda({ user, showToast }) {
  const [materi, setMateri] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchMateri() }, []);

  const fetchMateri = async () => {
    const q = query(collection(db, "materi"), where("status", "==", "published"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setMateri(snapshot.docs.map(d => ({id: d.id,...d.data()})));
  }

  if(selected) return (
    <div className="post-detail-page">
      <button className="btn-back" onClick={() => setSelected(null)}>← Kembali</button>
      <span className="tag">{selected.bidangUtama}</span>
      <h2>{selected.judul}</h2>
      <p><b>Penulis:</b> {selected.penulis}</p>
      <p>{selected.abstrak}</p>
      <a href={selected.fileUrl} target="_blank" className="btn-primary">📥 Download Materi</a>
    </div>
  );

  return (
    <>
      <h2>📚 Beranda Materi</h2>
      {materi.length === 0 && <p className="empty-state">Belum ada materi. Jadi kontributor pertama!</p>}
      {materi.map(m => (
        <div key={m.id} className="materi-card" onClick={() => setSelected(m)}>
          <span className="tag">{m.bidangUtama}</span>
          <h3>{m.judul}</h3>
          <p>{m.abstrak?.substring(0,120)}...</p>
          <small>Oleh: {m.penulis} • {m.tipe}</small>
        </div>
      ))}
    </>
  );
}