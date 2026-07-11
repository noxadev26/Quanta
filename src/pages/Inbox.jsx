export default function Inbox({ showToast }) {
  return (
    <div>
      <h2>💬 Inbox</h2>
      <p className="empty-state">Fitur Chat & Notifikasi Coming Soon</p>
      <button className="btn-primary" onClick={() => showToast('Fitur ini masih development')}>Test Notifikasi</button>
    </div>
  );
}