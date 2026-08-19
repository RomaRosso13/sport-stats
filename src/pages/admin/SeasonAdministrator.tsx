import { useState, useEffect } from 'react'

import { useLeague } from '../../context/LeagueContext'
import { useCategory } from '../../context/CategoryContext'
import { useToast } from '../../context/ToastContext'

import SeasonCard from '../../components/Admin/SeasonCard'
import Header from '../../components/common/Header'
import CategoryCard from '../../components/Admin/CategoryCard'
import CreateSeasonModal from '../../components/Admin/CreateSeasonModal'
import CreateCategoyModal from '../../components/Admin/CreateCategoryModal'

import { getSeasonsByLeagueId, setSeasonActive } from '../../services/season.service.js'
import { getCategoriesBySeasonId, setCategoryActive, reorderCategories } from '../../services/category.service.js'

import './SeasonAdministrator.css'

function SeasonAdministrator () {
  const { league } = useLeague()
  const { category, setCategory } = useCategory()
  const toast = useToast()
  const [, setLoading ] = useState(false)
  const [ seasonsData, setSeasonsData ] = useState([])
  const [ selectedSeason, setSelectedSeason ] = useState(null)
  const [ categoriesData, setCategoriesData ] = useState([])
  const [ showCreateSeason, setShowCreateSeason] = useState(false)
  const [ showCreateCategory, setShowCreateCategory ] = useState(false)
  const [ editingCategory, setEditingCategory ] = useState(null)
  
  useEffect(() => {
    if (!league) return
    async function loadSeasons() {
      try {
        setLoading(true)

        const allSeasons = await getSeasonsByLeagueId(league.id)
        setSeasonsData(allSeasons)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadSeasons()
  }, [league?.id])

    useEffect(() => {
    if (!selectedSeason) return
    async function loadCategories() {
      try {
        setLoading(true)

        const allCategories = await getCategoriesBySeasonId(selectedSeason.id)
        setCategoriesData(allCategories)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [selectedSeason?.id])

  async function handleToggleSeasonActive(season) {
    try {
      const updated = await setSeasonActive(season.id, !season.active)
      setSeasonsData(prev => prev.map(s => s.id === updated.id ? updated : s))
      if (selectedSeason?.id === updated.id) setSelectedSeason(updated)
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo actualizar la temporada')
    }
  }

  async function handleToggleCategoryActive(cat) {
    try {
      const updated = await setCategoryActive(cat.id, !cat.active)
      setCategoriesData(prev => prev.map(c => c.id === updated.id ? updated : c))
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo actualizar la categoría')
    }
  }

  async function handleMoveCategory(cat, direction) {
    const currentIndex = categoriesData.findIndex(c => c.id === cat.id)
    const targetIndex = currentIndex + direction
    if (targetIndex < 0 || targetIndex >= categoriesData.length) return

    const reordered = [...categoriesData]
    ;[reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]]

    const previous = categoriesData
    setCategoriesData(reordered)

    try {
      await reorderCategories(reordered.map(c => c.id))
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo actualizar el orden de las categorías')
      setCategoriesData(previous)
    }
  }

  return (
    <div className="app-layout">
      <Header league={league}/>
      <main className="season-admin-container">
        <div className="season-admin-intro">
          <h2>Gestor de Temporadas</h2>
          <p className="season-admin-subtitle">
            Administra las temporadas y categorías de {league?.name}
          </p>
        </div>

        <div className="section-header">
          <h3>Temporadas</h3>
          <button className="primary-btn" onClick={() => setShowCreateSeason(true)}>
            + Nueva temporada
          </button>
        </div>

        {seasonsData.length === 0 ? (
          <p className="empty-state">Aún no hay temporadas creadas</p>
        ) : (
          <div className="season-grid">
            {seasonsData.map(season => (
              <SeasonCard key={season.id} season={season} isSelected={selectedSeason?.id === season?.id} onSelect={setSelectedSeason} onToggleActive={handleToggleSeasonActive} />
            ))}
          </div>
        )}

        {selectedSeason && (
          <section className="category-section">
            <div className="section-header">
              <h3>Categorías – {selectedSeason.name}</h3>
              <button className="primary-btn" onClick={() => { setEditingCategory(null); setShowCreateCategory(true) }}>
                + Nueva Categoría
              </button>
            </div>

            <div className="category-grid">
              {categoriesData.length === 0 ? (
                <p className="empty-state">
                  Esta temporada aún no tiene categorías
                </p>
              ) : (
                categoriesData.map((cat, index) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    isSelected={category?.id === cat.id}
                    onSelect={setCategory}
                    onToggleActive={handleToggleCategoryActive}
                    onEdit={c => { setEditingCategory(c); setShowCreateCategory(true) }}
                    onMoveUp={c => handleMoveCategory(c, -1)}
                    onMoveDown={c => handleMoveCategory(c, 1)}
                    canMoveUp={index > 0}
                    canMoveDown={index < categoriesData.length - 1}
                  />
                ))
              )}
            </div>
          </section>
        )}
      </main>

      {showCreateSeason && (
        <CreateSeasonModal leagueId={league.id} onClose={() => setShowCreateSeason(false)}
          onCreated={(newSeason) => {
            setSeasonsData(prev => [newSeason, ...prev])
            setSelectedSeason(newSeason)
            setCategoriesData([])
          }}
        />
      )}
      {showCreateCategory && (
        <CreateCategoyModal
          seasonId={selectedSeason.id}
          category={editingCategory}
          onClose={() => { setShowCreateCategory(false); setEditingCategory(null) }}
          onCreated={(newCategory) => {
            setCategoriesData(prev => [...prev, newCategory])
          }}
          onSaved={(updated) => {
            setCategoriesData(prev => prev.map(c => c.id === updated.id ? updated : c))
            if (category?.id === updated.id) setCategory(updated)
          }}
        />
      )}
    </div>
  )

}

export default SeasonAdministrator