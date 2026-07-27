import { useState } from 'react'
import { extractDominantColor } from '../../utils/extractDominantColor'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

function ImageUploadField({ label, currentUrl, onFileSelected, onColorDetected = null }) {
  const [preview, setPreview] = useState(currentUrl || '')
  const [error, setError] = useState('')

  function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Solo se aceptan imágenes PNG o JPG')
      e.target.value = ''
      return
    }

    setError('')
    setPreview(URL.createObjectURL(file))
    onFileSelected(file)

    if (onColorDetected) {
      extractDominantColor(file).then(hex => { if (hex) onColorDetected(hex) })
    }
  }

  return (
    <div className="image-upload-field">
      <label>{label}</label>
      <input type="file" accept="image/png,image/jpeg" onChange={handleChange} />

      {preview && <img src={preview} alt="Vista previa" className="image-upload-preview" />}
      {error && <p className="modal-error">{error}</p>}
    </div>
  )
}

export default ImageUploadField
