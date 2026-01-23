import './Loader.css'

function Loader({ show, label }) {
  return (
    <div className={`loader-overlay ${show ? 'visible' : ''}`}>
      <div className="loader-box">
        <span className="loader-spinner" />
        {label && <p>{label}</p>}
      </div>
    </div>
  )
}

export default Loader
