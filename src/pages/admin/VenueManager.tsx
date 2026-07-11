import { useEffect, useState } from 'react'

import { useLeague } from '../../context/LeagueContext'

import Header from '../../components/common/Header'
import BranchManagerCard from '../../components/Admin/BranchManagerCard'
import BranchFormModal from '../../components/Admin/BranchFormModal'
import FieldFormModal from '../../components/Admin/FieldFormModal'
import FieldListManager from '../../components/Admin/FieldListManager'

import { getBranchesWithFieldsByLeagueId } from '../../services/branch.service.js'

import './VenueManager.css'

function VenueManager() {
  const { league } = useLeague()

  const [branches, setBranches] = useState([])
  const [loadingBranches, setLoadingBranches] = useState(true)
  const [selectedBranchId, setSelectedBranchId] = useState(null)

  const [editingBranch, setEditingBranch] = useState(null)
  const [showBranchModal, setShowBranchModal] = useState(false)

  const [editingField, setEditingField] = useState(null)
  const [showFieldModal, setShowFieldModal] = useState(false)

  useEffect(() => {
    if (!league) return

    async function loadBranches() {
      try {
        setLoadingBranches(true)
        const branchesData = await getBranchesWithFieldsByLeagueId(league.id)
        setBranches(branchesData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingBranches(false)
      }
    }

    loadBranches()
  }, [league?.id])

  const selectedBranch = branches.find(b => b.id === selectedBranchId)

  function handleBranchSaved(savedBranch) {
    setBranches(prev => {
      const exists = prev.some(b => b.id === savedBranch.id)
      if (exists) {
        return prev.map(b => b.id === savedBranch.id ? { ...b, ...savedBranch } : b)
      }
      return [...prev, { ...savedBranch, Field: [] }]
    })
    setSelectedBranchId(savedBranch.id)
  }

  function handleFieldSaved(savedField) {
    setBranches(prev => prev.map(b => {
      if (b.id !== selectedBranchId) return b

      const fields = b.Field || []
      const exists = fields.some(f => f.id === savedField.id)

      return {
        ...b,
        Field: exists
          ? fields.map(f => f.id === savedField.id ? savedField : f)
          : [...fields, savedField]
      }
    }))
  }

  return (
    <div className="app-layout">
      <Header league={league}/>
      <main className="venue-manager-container">
        <div className="venue-manager-intro">
          <h2>Gestor de Sedes</h2>
          <p>Crea sedes y sus canchas para {league?.name}</p>
        </div>

        <div className="section-header">
          <h3>Sedes</h3>
          <button
            className="primary-btn"
            onClick={() => { setEditingBranch(null); setShowBranchModal(true) }}
          >
            + Nueva sede
          </button>
        </div>

        {!loadingBranches && branches.length === 0 ? (
          <p className="empty-state">Esta liga aún no tiene sedes</p>
        ) : (
          <div className="venue-manager-grid">
            {branches.map(branch => (
              <BranchManagerCard
                key={branch.id}
                branch={branch}
                isSelected={selectedBranchId === branch.id}
                onSelect={b => setSelectedBranchId(b.id)}
                onEdit={b => { setEditingBranch(b); setShowBranchModal(true) }}
              />
            ))}
          </div>
        )}

        {selectedBranch && (
          <FieldListManager
            branch={selectedBranch}
            onAddField={() => { setEditingField(null); setShowFieldModal(true) }}
            onEditField={f => { setEditingField(f); setShowFieldModal(true) }}
          />
        )}
      </main>

      {showBranchModal && (
        <BranchFormModal
          leagueId={league?.id}
          branch={editingBranch}
          onClose={() => setShowBranchModal(false)}
          onSaved={handleBranchSaved}
        />
      )}

      {showFieldModal && selectedBranch && (
        <FieldFormModal
          branchId={selectedBranch.id}
          field={editingField}
          onClose={() => setShowFieldModal(false)}
          onSaved={handleFieldSaved}
        />
      )}

      <footer className="app-footer">
        © {new Date().getFullYear()} Liga · Todos los derechos reservados
      </footer>
    </div>
  )
}

export default VenueManager
