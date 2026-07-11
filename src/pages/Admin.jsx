import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, getDocs, query, where, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

export default function Admin({ showToast }) {
  const [materi, setMateri] = useState([]);

  useEffect(() => { fetchMateri() }, []);

  const fetchMateri = async () => {
    const q = query(collection(db, "materi"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    setMateri(snapshot.docs.map(d => ({id: d.id,...d.data()})));
  }

  const handleSetujui = async (id) => {
    await updateDoc(doc(db, "materi", id), {status: 'published'});
    fetchMateri(); showToast('Materi disetujui');
  }

  return (
    <div className="admin-page">
      <h2>👑 Ruang Kurator</h2>
      <h3>Antrian Moderasi: {materi.length} materi</h3>
      {materi.length === 0 && <p className="empty-state">Tidak ada materi pending</p>}
      {materi.map(m => (
        <div key={m.id} className="admin-card">
          <h4>{m.judul}</h4>
          <p>{m.penulis} - {m.bidangUtama}</p>
          <a href={m.fileUrl} target="_blank">Lihat File</a>
          <button className="btn-primary" onClick={() => handleSetujui(m.id)}>Setujui</button>
        </div>
      ))}
    </div>
  );
}