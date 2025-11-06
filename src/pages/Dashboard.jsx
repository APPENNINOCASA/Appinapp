import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/Dashboard.css'

function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalInquiries: 0
  })

  useEffect(() => {
    fetchStats()
  }, [user])

  const fetchStats = async () => {
    // Conta immobili
    const { count: propertiesCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Somma visualizzazioni
    const { data: viewsData } = await supabase
      .from('properties')
      .select('views_count')
      .eq('user_id', user.id)

    const totalViews = viewsData?.reduce((sum, prop) => sum + (prop.views_count || 0), 0) || 0

    // Conta richieste
    const { count: inquiriesCount } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .in('property_id', 
        (await supabase.from('properties').select('id').eq('user_id', user.id)).data?.map(p => p.id) || []
      )

    setStats({
      totalProperties: propertiesCount || 0,
      totalViews: totalViews,
      totalInquiries: inquiriesCount || 0
    })
  }

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
            <p className="card-number">{stats.totalProperties}</p>
            <button className="btn-card" onClick={() => navigate('/my-properties')}>Visualizza</button>
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
            <p className="card-number">{stats.totalViews} visualizzazioni</p>
            <button className="btn-card">Dettagli</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">💬</div>
            <h3>Richieste</h3>
            <p className="card-number">{stats.totalInquiries} messaggi</p>
            <button className="btn-card">Leggi</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
