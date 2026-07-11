import './BranchManagerCard.css'

function BranchManagerCard({ branch, isSelected, onSelect, onEdit }) {
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
    </div>
  )
}

export default BranchManagerCard
