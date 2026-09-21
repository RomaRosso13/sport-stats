import { useState, useEffect } from 'react'

import { useLeague } from '../../context/LeagueContext'
import { useCategory } from '../../context/CategoryContext'
import { useToast } from '../../context/ToastContext'

import SeasonCard from '../../components/Admin/SeasonCard'
import Header from '../../components/common/Header'
import CategoryCard from '../../components/Admin/CategoryCard'
import DivisionCard from '../../components/Admin/DivisionCard'
import CreateSeasonModal from '../../components/Admin/CreateSeasonModal'
import CreateCategoyModal from '../../components/Admin/CreateCategoryModal'
import CreateDivisionModal from '../../components/Admin/CreateDivisionModal'
import ResetSeasonModal from '../../components/Admin/ResetSeasonModal'

import { getSeasonsByLeagueId, setSeasonActive } from '../../services/season.service.js'
import { getCategoriesBySeasonId, setCategoryActive, reorderCategories } from '../../services/category.service.js'
import { getDivisionsByCategoryId, setDivisionActive } from '../../services/division.service.js'

import './SeasonAdministrator.css'

function SeasonAdministrator () {
  const { league } = useLeague()
  const { category, setCategory } = useCategory()
  const toast = useToast()
  const [, setLoading ] = useState(false)
  const [ seasonsData, setSeasonsData ] = useState([])
  const [ selectedSeason, setSelectedSeason ] = useState(null)
  const [ categoriesData, setCategoriesData ] = useState([])
  const [ divisionsData, setDivisionsData ] = useState([])
  const [ showCreateSeason, setShowCreateSeason] = useState(false)
  const [ showCreateCategory, setShowCreateCategory ] = useState(false)
  const [ showCreateDivision, setShowCreateDivision ] = useState(false)
  const [ editingCategory, setEditingCategory ] = useState(null)
  const [ showResetSeason, setShowResetSeason ] = useState(false)
  
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

  useEffect(() => {
    if (!category) {
      setDivisionsData([])
      return
    }
    async function loadDivisions() {
      try {
        const allDivisions = await getDivisionsByCategoryId(category.id)
        setDivisionsData(allDivisions)
      } catch (err) {
        console.error(err)
      }
    }
    loadDivisions()
  }, [category?.id])

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

  async function handleToggleDivisionActive(division) {
    try {
      const updated = await setDivisionActive(division.id, !division.active)
      setDivisionsData(prev => prev.map(d => d.id === updated.id ? updated : d))
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo actualizar la división')
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
              <div className="section-header-actions">
                <button className="danger-btn" onClick={() => setShowResetSeason(true)}>
                  Resetear temporada
                </button>
                <button className="primary-btn" onClick={() => { setEditingCategory(null); setShowCreateCategory(true) }}>
                  + Nueva Categoría
                </button>
              </div>
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

            {category && (
              <section className="division-section">
                <div className="section-header">
                  <h3>Divisiones – {category.type}</h3>
                  <button className="primary-btn" onClick={() => setShowCreateDivision(true)}>
                    + Nueva división
                  </button>
                </div>

                <div className="division-grid">
                  {divisionsData.length === 0 ? (
                    <p className="empty-state">
                      Esta categoría aún no tiene divisiones — sigue funcionando normal, con todos los equipos juntos.
                    </p>
                  ) : (
                    divisionsData.map(division => (
                      <DivisionCard key={division.id} division={division} onToggleActive={handleToggleDivisionActive} />
                    ))
                  )}
                </div>
              </section>
            )}
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
      {showResetSeason && (
        <ResetSeasonModal
          season={selectedSeason}
          onClose={() => setShowResetSeason(false)}
          onReset={() => toast.success('Temporada reseteada: jornadas, partidos y estadísticas eliminados')}
        />
      )}
      {showCreateDivision && (
        <CreateDivisionModal categoryId={category.id} onClose={() => setShowCreateDivision(false)}
          onCreated={(newDivision) => {
            setDivisionsData(prev => [newDivision, ...prev])
          }}
        />
      )}
    </div>
  )

}

export default SeasonAdministrator