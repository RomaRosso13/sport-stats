import { useEffect, useRef, useState } from 'react'

import './HeroSlider.css'

const AUTO_ADVANCE_MS = 5000

function HeroSlider({ images }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (paused || images.length <= 1) return

    timerRef.current = setInterval(() => {
      setIndex(prev => (prev + 1) % images.length)
    }, AUTO_ADVANCE_MS)

    return () => clearInterval(timerRef.current)
  }, [paused, images.length])

  useEffect(() => {
    if (index >= images.length) setIndex(0)
  }, [images.length, index])

  if (images.length === 0) return null

  function goTo(i) {
    setIndex(((i % images.length) + images.length) % images.length)
  }

  return (
    <div
      className="hero-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="hero-slider-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map(img => (
          <div key={img.id} className="hero-slider-slide">
            {/* Fondo desenfocado con la misma imagen, para rellenar el espacio
                que deja `contain` cuando la foto no comparte proporción con el
                espacio disponible (muy ancha o muy alta) — así nunca se
                recorta el banner, y el espacio sobrante no se ve vacío. */}
            <div
              className="hero-slider-slide-backdrop"
              style={{ backgroundImage: `url(${img.image_url})` }}
              aria-hidden="true"
            />
            <img src={img.image_url} alt="" className="hero-slider-slide-img" />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="hero-slider-arrow hero-slider-arrow-prev"
            aria-label="Foto anterior"
            onClick={() => goTo(index - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="hero-slider-arrow hero-slider-arrow-next"
            aria-label="Foto siguiente"
            onClick={() => goTo(index + 1)}
          >
            ›
          </button>

          <div className="hero-slider-dots">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                className={`hero-slider-dot ${i === index ? 'active' : ''}`}
                aria-label={`Ir a foto ${i + 1}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default HeroSlider
