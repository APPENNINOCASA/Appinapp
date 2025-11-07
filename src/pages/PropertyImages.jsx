import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ImageUpload from '../components/ImageUpload'
import '../styles/PropertyImages.css'

function PropertyImages() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPropertyAndImages()
  }, [id])

  const fetchPropertyAndImages = async () => {
    console.log('Fetching property with id:', id)
    
    // Carica dati immobile
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
    setLoading(false)
  }

  const deleteImage = async (imageId, imageUrl) => {
    if (!confirm('Sei sicuro di voler eliminare questa immagine?')) return

    try {
      // Estrai il path dal URL
      const urlParts = imageUrl.split('/property-images/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        
        // Elimina da storage
        await supabase.storage
          .from('property-images')
          .remove([filePath])
      }

      // Elimina dal database
      const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      fetchPropertyAndImages()
      alert('Immagine eliminata con successo!')
    } catch (error) {
      alert('Errore durante l\'eliminazione: ' + error.message)
    }
  }

  const setPrimaryImage = async (imageId) => {
    try {
      // Rimuovi primary da tutte le immagini
      await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', id)

      // Imposta la nuova primary
      const { error } = await supabase
        .from('property_images')
        .update({ is_primary: true })
        .eq('id', imageId)

      if (error) throw error

      fetchPropertyAndImages()
      alert('Immagine principale aggiornata!')
    } catch (error) {
      alert('Errore: ' + error.message)
    }
  }

  console.log('Render - loading:', loading, 'property:', property, 'images:', images)

  if (loading) {
    return <div className="loading">Caricamento...</div>
  }

  if (!property) {
    return (
      <div className="loading">
        Immobile non trovato
        <br />
        <button onClick={() => navigate('/my-properties')} style={{marginTop: '20px', padding: '10px 20px', cursor: 'pointer'}}>
          Torna agli immobili
        </button>
      </div>
    )
  }

  return (
    <div className="property-images-container">
      <div className="images-header">
        <button onClick={() => navigate('/my-properties')} className="btn-back">
          ← Torna agli Immobili
        </button>
        <h1>Gestione Immagini</h1>
        <p className="property-title">{property?.title}</p>
      </div>

      <div className="images-content">
        <ImageUpload 
          propertyId={id} 
          onUploadComplete={fetchPropertyAndImages}
        />

        {images.length === 0 ? (
          <div className="no-images">
            <div className="no-images-icon">🖼️</div>
            <p>Nessuna immagine caricata</p>
            <small>Carica la prima immagine per questo immobile</small>
          </div>
        ) : (
          <div className="images-grid">
            {images.map((image) => (
              <div key={image.id} className="image-card">
                {image.is_primary && (
                  <span className="primary-badge">⭐ Principale</span>
                )}
                <img src={image.image_url} alt="Immobile" />
                <div className="image-actions">
                  {!image.is_primary && (
                    <button 
                      onClick={() => setPrimaryImage(image.id)}
                      className="btn-primary"
                    >
                      Imposta come principale
                    </button>
                  )}
                  <button 
                    onClick={() => deleteImage(image.id, image.image_url)}
                    className="btn-delete"
                  >
                    🗑️ Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PropertyImages
