import './DescriptionCard.css'

function DescriptionCard({ titulo, valor }) {
  return (
    <div className="resumen-card">
      <span className="resumen-titulo">{titulo}</span>
      <span className="resumen-valor">{valor}</span>
    </div>
  )
}

export default DescriptionCard
