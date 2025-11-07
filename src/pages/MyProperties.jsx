import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import '../styles/MyProperties.css'

function MyProperties() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [user])

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Errore:', error)
    } else {
      setProperties(data || [])
    }
    setLoading(false)
  }

  const deleteProperty = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questo immobile?')) return

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Errore durante l\'eliminazione')
    } else {
      fetchProperties()
    }
  }

  const togglePublish = async (id, currentStatus) => {
    const { error } = await supabase
      .from('properties')
      .update({ is_published: !currentStatus })
      .eq('id', id)

    if (error) {
      alert('Errore durante l\'aggiornamento')
    } else {
      fetchProperties()
    }
  }

  if (loading) {
    return <div className="loading">Caricamento...</div>
  }

  return (
    <div className="my-properties-container">
      <div className="properties-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Torna alla Dashboard
        </button>
        <h1>I Miei Immobili</h1>
        <button onClick={() => navigate('/add-property')} className="btn-add">
          + Aggiungi Immobile
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <h2>Nessun immobile trovato</h2>
          <p>Inizia ad aggiungere i tuoi primi immobili</p>
          <button onClick={() => navigate('/add-property')} className="btn-empty">
            Aggiungi il primo immobile
          </button>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-status">
                <span className={`status-badge ${property.is_published ? 'published' : 'draft'}`}>
                  {property.is_published ? '✓ Pubblicato' : '✎ Bozza'}
                </span>
                <span className="status-type">{property.status}</span>
              </div>

              <h3>{property.title}</h3>
              
              <div className="property-info">
                <span className="info-item">📍 {property.city}</span>
                <span className="info-item">🏠 {property.property_type}</span>
                <span className="info-item">💰 €{property.price.toLocaleString()}</span>
              </div>

              <div className="property-details">
                <span>📐 {property.surface_area} m²</span>
                <span>🛏️ {property.rooms} stanze</span>
                <span>🚿 {property.bathrooms} bagni</span>
              </div>

              <div className="property-actions">
  <button 
    onClick={() => navigate(`/property-images/${property.id}`)}
    className="btn-action images"
  >
    📸 Immagini
  </button>
  <button 
    onClick={() => togglePublish(property.id, property.is_published)}
    className="btn-action publish"
  >
    {property.is_published ? 'Nascondi' : 'Pubblica'}
  </button>
  <button 
    onClick={() => deleteProperty(property.id)}
    className="btn-action delete"
  >
    Elimina
  </button>
</div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyProperties
