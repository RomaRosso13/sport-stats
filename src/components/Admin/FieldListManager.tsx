import './FieldListManager.css'

function FieldListManager({ branch, onAddField, onEditField }) {
  const fields = branch.Field || []

  return (
    <section className="field-manager">
      <div className="section-header">
        <h3>Canchas – {branch.name}</h3>
        <button className="primary-btn" onClick={onAddField}>
          + Nueva cancha
        </button>
      </div>

      {fields.length === 0 ? (
        <p className="empty-state">Esta sede aún no tiene canchas</p>
      ) : (
        <div className="field-list">
          {fields.map(field => (
            <div key={field.id} className="field-row">
              <span className="field-name">{field.name}</span>
              <button type="button" onClick={() => onEditField(field)}>
                Editar
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default FieldListManager
