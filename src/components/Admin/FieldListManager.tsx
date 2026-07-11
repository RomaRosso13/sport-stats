import './FieldListManager.css'

function FieldListManager({ branch, onAddField, onEditField, onDeleteField }) {
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
              <div className="field-row-actions">
                <button type="button" onClick={() => onEditField(field)}>
                  Editar
                </button>
                <button type="button" className="delete-btn" onClick={() => onDeleteField(field)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default FieldListManager
