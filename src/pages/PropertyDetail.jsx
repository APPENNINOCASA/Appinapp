import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import '../styles/PropertyDetail.css'

function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [property, setProperty] = useState(null)
  const [images, setImages] = useState([])
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  useEffect(() => {
    fetchPropertyDetails()
    incrementViews()
  }, [id])

  const fetchPropertyDetails = async () => {
    console.log('Fetching property with id:', id)
    
    // Carica immobile
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    console.log('Property data:', propertyData)
    console.log('Property error:', propertyError)

    setProperty(propertyData)

    // Carica immagini
    const { data: imagesData, error: imagesError } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', id)
      .order('image_order', { ascending: true })

    console.log('Images data:', imagesData)
    console.log('Images error:', imagesError)

    setImages(imagesData || [])
    if (imagesData && imagesData.length > 0) {
      const primary = imagesData.find(img => img.is_primary)
      setSelectedImage(primary ? primary.image_url : imagesData[0].image_url)
    }

    // Carica caratteristiche
    const { data: featuresData } = await supabase
      .from('property_features')
      .select('*')
      .eq('property_id', id)

    setFeatures(featuresData || [])
    setLoading(false)
  }

  const incrementViews = async () => {
    const { data: currentProperty } = await supabase
      .from('properties')
      .select('views_count')
      .eq('id', id)
      .single()

    if (currentProperty) {
      await supabase
        .from('properties')
        .update({ views_count: (currentProperty.views_count || 0) + 1 })
        .eq('id', id)
    }
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()

    const { error } = await supabase
      .from('inquiries')
      .insert([{
        property_id: id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      }])

    if (error) {
      alert('Errore durante l\'invio: ' + error.message)
    } else {
      alert('Richiesta inviata con successo! Sarai contattato presto.')
      setShowContactForm(false)
      setFormData({ name: '', email: '', phone: '', message: '' })
    }
  }

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

  if (loading) {
    return <div className="loading">Caricamento...</div>
  }

  if (!property) {
    return <div className="loading">Immobile non trovato</div>
  }

  return (
    <div className="property-detail-container">
      <nav className="detail-nav">
        <button onClick={() => navigate('/')} className="btn-back-home">
          ← Torna alla Home
        </button>
        {user && (
          <button onClick={() => navigate('/dashboard')} className="btn-dashboard">
            Dashboard
          </button>
        )}
      </nav>

      <div className="detail-content">
        <div className="detail-header">
          <h1>{property.title}</h1>
          <p className="detail-location">📍 {property.address}, {property.city}, {property.province}</p>
          <div className="detail-badges">
            <span className="badge-type">{property.property_type}</span>
            <span className="badge-status">{property.status}</span>
            <span className="badge-price">
              {formatPrice(property.price, property.price_type)}
            </span>
          </div>
        </div>

        <div className="detail-gallery">
          {selectedImage && (
            <div className="main-image">
              <img src={selectedImage} alt={property.title} />
            </div>
          )}
          {images.length > 1 && (
            <div className="thumbnails">
              {images.map((image) => (
                <img
                  key={image.id}
                  src={image.image_url}
                  alt="Thumbnail"
                  className={selectedImage === image.image_url ? 'active' : ''}
                  onClick={() => setSelectedImage(image.image_url)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            <div className="detail-section">
              <h2>Descrizione</h2>
              <p>{property.description || 'Nessuna descrizione disponibile.'}</p>
            </div>

            <div className="detail-section">
              <h2>Caratteristiche Principali</h2>
              <div className="features-grid">
                <div className="feature-item">
                  <span className="feature-icon">📐</span>
                  <div>
                    <strong>Superficie</strong>
                    <p>{property.surface_area} m²</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🛏️</span>
                  <div>
                    <strong>Stanze</strong>
                    <p>{property.rooms}</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🚿</span>
                  <div>
                    <strong>Bagni</strong>
                    <p>{property.bathrooms}</p>
                  </div>
                </div>
                {property.floor !== null && (
                  <div className="feature-item">
                    <span className="feature-icon">🏢</span>
                    <div>
                      <strong>Piano</strong>
                      <p>{property.floor}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {features.length > 0 && (
              <div className="detail-section">
                <h2>Altre Caratteristiche</h2>
                <div className="extra-features">
                  {features.map((feature) => (
                    <div key={feature.id} className="extra-feature">
                      ✓ {feature.feature_name}: {feature.feature_value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="detail-sidebar">
            <div className="price-card">
              <div className="price-amount">
                {formatPrice(property.price, property.price_type)}
              </div>
              <p className="price-type">
                {property.price_type === 'vendita' ? 'Prezzo di vendita' : 
                 property.price_type === 'affitto_mensile' ? 'Affitto mensile' : 
                 'Affitto giornaliero'}
              </p>
              <button 
                onClick={() => setShowContactForm(!showContactForm)}
                className="btn-contact"
              >
                {showContactForm ? 'Chiudi Form' : 'Contatta il Proprietario'}
              </button>
            </div>

            {showContactForm && (
              <div className="contact-form">
                <h3>Richiedi Informazioni</h3>
                <form onSubmit={handleContactSubmit}>
                  <input
                    type="text"
                    placeholder="Nome e Cognome *"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Telefono"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  <textarea
                    placeholder="Messaggio *"
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  />
                  <button type="submit" className="btn-send">
                    Invia Richiesta
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetail
