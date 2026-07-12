import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

function Root() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2500);
  }, []);

  return (
    <>
      {loading && (
        <div className="loading-screen">
          <div className="loading-glass">
            <div className="loading-spinner"></div>
            <h2>QUANTA</h2>
            <p>Memuat materi...</p>
          </div>
        </div>
      )}
      <App />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)