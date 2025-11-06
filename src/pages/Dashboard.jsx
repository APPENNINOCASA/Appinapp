import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'

function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>Appinapp</h2>
        </div>
        <div className="nav-user">
          <span>Benvenuto, {user?.email}</span>
          <button onClick={handleLogout} className="btn-logout">
            Esci
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Gestisci i tuoi immobili</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">🏠</div>
            <h3>I Miei Immobili</h3>
            <p className="card-number">0</p>
            <button className="btn-card">Visualizza</button>
          </div>

          <div className="dashboard-card">
  <div className="card-icon">➕</div>
  <h3>Nuovo Immobile</h3>
  <p className="card-description">Aggiungi un nuovo appartamento</p>
  <button className="btn-card" onClick={() => navigate('/add-property')}>Crea</button>
</div>


          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>Statistiche</h3>
            <p className="card-number">0 visualizzazioni</p>
            <button className="btn-card">Dettagli</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">💬</div>
            <h3>Richieste</h3>
            <p className="card-number">0 messaggi</p>
            <button className="btn-card">Leggi</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
