import './Loader.css'

type LoaderProps = {
  show: boolean
  label?: string
}

function Loader({ show, label }: LoaderProps) {
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
