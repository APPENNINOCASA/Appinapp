import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import '../styles/Home.css'

function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchPublishedProperties()
  }, [])

  const fetchPublishedProperties = async () => {
    let query = supabase
      .from('properties')
      .select(`
        *,
        property_images(*)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Errore:', error)
    } else {
      setProperties(data || [])
    }
    setLoading(false)
  }

  const filteredProperties = properties.filter(property => {
    const matchCity = searchCity === '' || 
      property.city.toLowerCase().includes(searchCity.toLowerCase())
    const matchType = filterType === 'all' || property.property_type === filterType
    return matchCity && matchType
  })

  const formatPrice = (price, priceType) => {
    const formatted = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price)

    if (priceType === 'affitto_mensile') return `${formatted}/mese`
    if (priceType === 'affitto_giornaliero') return `${formatted}/giorno`
    return formatted
  }

  const getPrimaryImage = (images) => {
    if (!images || images.length === 0) return null
    const primary = images.find(img => img.is_primary)
    return primary ? primary.image_url : images[0].image_url
  }

  if (loading) {
    return <div className="loading">Caricamento immobili...</div>
  }

  return (
    <div className="home-container">
      <nav className="home-nav">
        <div className="nav-brand">
          <h2>Appinapp</h2>
          <p>Immobili in Appennino</p>
        </div>
        <div className="nav-actions">
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn-nav">
              Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-nav">
                Accedi
              </button>
              <button onClick={() => navigate('/register')} className="btn-nav primary">
                Registrati
              </button>
            </>
          )}
        </div>
      </nav>

      <header className="home-header">
        <div className="header-content">
          <h1>Trova la tua casa ideale in Appennino</h1>
          <p>Scopri le migliori opportunità immobiliari nella natura</p>
        </div>
      </header>

      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Cerca per città..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="search-input"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tutti i tipi</option>
            <option value="appartamento">Appartamento</option>
            <option value="villa">Villa</option>
            <option value="attico">Attico</option>
            <option value="monolocale">Monolocale</option>
            <option value="bilocale">Bilocale</option>
            <option value="trilocale">Trilocale</option>
          </select>
        </div>
        <p className="results-count">
          {filteredProperties.length} {filteredProperties.length === 1 ? 'immobile trovato' : 'immobili trovati'}
        </p>
      </div>

      <div className="properties-section">
        {filteredProperties.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🏠</div>
            <h2>Nessun immobile trovato</h2>
            <p>Prova a modificare i filtri di ricerca</p>
          </div>
        ) : (
          <div className="properties-grid">
            {filteredProperties.map((property) => {
              const primaryImage = getPrimaryImage(property.property_images)
              return (
                <div key={property.id} className="property-card-home">
                  <div className="property-image">
                    {primaryImage ? (
                      <img src={primaryImage} alt={property.title} />
                    ) : (
                      <div className="no-image">📷 Nessuna immagine</div>
                    )}
                    <span className="property-type-badge">
                      {property.property_type}
                    </span>
                  </div>
                  
                  <div className="property-content">
                    <h3>{property.title}</h3>
                    <p className="property-location">📍 {property.city}, {property.province}</p>
                    
                    <div className="property-features">
                      <span>📐 {property.surface_area} m²</span>
                      <span>🛏️ {property.rooms} stanze</span>
                      <span>🚿 {property.bathrooms} bagni</span>
                    </div>

                    <div className="property-footer">
                      <div className="property-price">
                        {formatPrice(property.price, property.price_type)}
                      </div>
                      <button 
                        onClick={() => navigate(`/property/${property.id}`)}
                        className="btn-details"
                      >
                        Dettagli
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <footer className="home-footer">
        <p>© 2025 Appinapp - Tutti i diritti riservati</p>
      </footer>
    </div>
  )
}

export default Home
