import { useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/ImageUpload.css'

function ImageUpload({ propertyId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadImage = async (event) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      const file = event.target.files[0]
      if (!file) return

      // Verifica tipo file
      if (!file.type.startsWith('image/')) {
        alert('Per favore seleziona un file immagine')
        setUploading(false)
        return
      }

      // Verifica dimensione (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'immagine deve essere inferiore a 5MB')
        setUploading(false)
        return
      }

      // Crea nome file unico
      const fileExt = file.name.split('.').pop()
      const fileName = `${propertyId}/${Date.now()}.${fileExt}`

      setUploadProgress(50)

      // Upload su Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      setUploadProgress(75)

      // Ottieni URL pubblico
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName)

      // Salva riferimento nel database
      const { error: dbError } = await supabase
        .from('property_images')
        .insert([{
          property_id: propertyId,
          image_url: publicUrl,
          image_order: 0
        }])

      if (dbError) throw dbError

      setUploadProgress(100)
      alert('Immagine caricata con successo!')
      
      if (onUploadComplete) {
        onUploadComplete()
      }

    } catch (error) {
      alert('Errore durante l\'upload: ' + error.message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="image-upload-container">
      <label htmlFor="image-upload" className="upload-label">
        {uploading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span>Caricamento {uploadProgress}%...</span>
          </div>
        ) : (
          <>
            <div className="upload-icon">📸</div>
            <span>Clicca per caricare un'immagine</span>
            <small>PNG, JPG fino a 5MB</small>
          </>
        )}
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={uploadImage}
        disabled={uploading}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default ImageUpload
