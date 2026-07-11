import './BranchManagerCard.css'

function BranchManagerCard({ branch, isSelected, onSelect, onEdit, onDelete }) {
  const fieldCount = branch.Field?.length || 0

  return (
    <div
      className={`branch-manager-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(branch)}
    >
      <div className="branch-manager-info">
        <h4>{branch.name}</h4>
        <span className="branch-manager-count">
          {fieldCount} cancha{fieldCount === 1 ? '' : 's'}
        </span>
      </div>

      <div className="branch-manager-actions">
        <button
          type="button"
          className="branch-manager-edit-btn"
          onClick={e => {
            e.stopPropagation()
            onEdit(branch)
          }}
        >
          Editar
        </button>

        <button
          type="button"
          className="branch-manager-delete-btn"
          onClick={e => {
            e.stopPropagation()
            onDelete(branch)
          }}
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}

export default BranchManagerCard
