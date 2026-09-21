import { useEffect, useMemo, useState } from 'react'

import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import Loader from '../../components/common/Loader'
import PageWrapper from '../../components/common/PageWrapper'
import JornadaCard from '../../components/Admin/JornadaCard'
import EditJornadaModal from '../../components/Admin/EditJornadaModal'

import { useLeague } from '../../context/LeagueContext'
import { useSeason } from '../../context/SeasonContext'
import { useCategory } from '../../context/CategoryContext'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../context/ConfirmContext'

import { getMatchDaysByCategoryIds, reorderJornadas, deleteJornada } from '../../services/matchday.service.js'
import { getMatchesByMatchDayIds } from '../../services/match.service.js'
import { groupMatchdaysByDate } from '../../utils/groupMatchdaysByDate'

import './MatchdayManager.css'

function MatchdayManager() {
  const { league } = useLeague()
  const { season } = useSeason()
  const { categories } = useCategory()
  const toast = useToast()
  const confirm = useConfirm()

  const [matchdaysData, setMatchdaysData] = useState([])
  const [matchCountByMatchdayId, setMatchCountByMatchdayId] = useState({})
  const [loading, setLoading] = useState(true)
  const [editingJornada, setEditingJornada] = useState(null)

  const categoryIdsKey = (categories || []).map(c => c.id).join(',')

  useEffect(() => {
    if (!categories || categories.length === 0) {
      setMatchdaysData([])
      setMatchCountByMatchdayId({})
      setLoading(false)
      return
    }

    async function loadJornadas() {
      try {
        setLoading(true)

        const categoryIds = categories.map(c => c.id)
        const matchdays = await getMatchDaysByCategoryIds(categoryIds)
        setMatchdaysData(matchdays || [])

        const matchdayIds = (matchdays || []).map(md => md.id)
        const matches = matchdayIds.length ? await getMatchesByMatchDayIds(matchdayIds) : []

        const counts = {}
        matches.forEach(m => {
          counts[m.matchday_id] = (counts[m.matchday_id] || 0) + 1
        })
        setMatchCountByMatchdayId(counts)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadJornadas()
  }, [categoryIdsKey])

  const jornadas = useMemo(() => groupMatchdaysByDate(matchdaysData), [matchdaysData])

  function getMatchCount(jornada) {
    return Object.values(jornada.matchdaysByCategory)
      .reduce((sum, md) => sum + (matchCountByMatchdayId[md.id] || 0), 0)
  }

  function handleSaved(updatedJornada) {
    setMatchdaysData(prev => prev.map(md => {
      const belongsToJornada = Object.values(updatedJornada.matchdaysByCategory).some(m => m.id === md.id)
      return belongsToJornada ? { ...md, name: updatedJornada.name, date: updatedJornada.date } : md
    }))
    toast.success('Jornada actualizada')
  }

  async function handleMoveJornada(jornada, direction) {
    const currentIndex = jornadas.findIndex(j => j.id === jornada.id)
    const targetIndex = currentIndex + direction
    if (targetIndex < 0 || targetIndex >= jornadas.length) return

    const reordered = [...jornadas]
    ;[reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]]

    const orderedGroups = reordered.map(j => Object.values(j.matchdaysByCategory).map(md => md.id))
    const sortOrderByMatchdayId = {}
    orderedGroups.forEach((ids, index) => ids.forEach(id => { sortOrderByMatchdayId[id] = index }))

    const previous = matchdaysData
    setMatchdaysData(prev => prev.map(md => (
      md.id in sortOrderByMatchdayId ? { ...md, sort_order: sortOrderByMatchdayId[md.id] } : md
    )))

    try {
      await reorderJornadas(orderedGroups)
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo actualizar el orden de las jornadas')
      setMatchdaysData(previous)
    }
  }

  async function handleDeleteJornada(jornada) {
    const matchCount = getMatchCount(jornada)
    const matchdayIds = Object.values(jornada.matchdaysByCategory).map(md => md.id)

    const ok = await confirm({
      message: matchCount > 0
        ? `¿Eliminar "${jornada.name}"? Esta jornada tiene ${matchCount} partido${matchCount === 1 ? '' : 's'} guardado${matchCount === 1 ? '' : 's'} — también se borrarán sus marcadores, estadísticas y asistencia. Esta acción no se puede deshacer.`
        : `¿Eliminar "${jornada.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true
    })
    if (!ok) return

    try {
      await deleteJornada(matchdayIds)
      setMatchdaysData(prev => prev.filter(md => !matchdayIds.includes(md.id)))
      toast.success('Jornada eliminada')
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo eliminar la jornada')
    }
  }

  const isLoading = !league || !season || loading

  return (
    <div className="app-layout">
      <Loader show={isLoading} label="Cargando..." />
      <PageWrapper loading={isLoading}/>
      <Header league={league}/>

      <main className="matchday-manager-container">
        <div className="matchday-manager-intro">
          <h2>Gestor de Jornadas</h2>
          <p className="matchday-manager-subtitle">
            Edita el nombre y la fecha de las jornadas de {season?.name || 'la temporada'}
          </p>
        </div>

        {jornadas.length === 0 ? (
          <p className="empty-state">
            Aún no hay jornadas creadas — créalas desde "Agregar Partidos".
          </p>
        ) : (
          <div className="jornada-grid">
            {jornadas.map((jornada, index) => (
              <JornadaCard
                key={jornada.id}
                jornada={jornada}
                matchCount={getMatchCount(jornada)}
                onEdit={setEditingJornada}
                onDelete={handleDeleteJornada}
                onMoveUp={j => handleMoveJornada(j, -1)}
                onMoveDown={j => handleMoveJornada(j, 1)}
                canMoveUp={index > 0}
                canMoveDown={index < jornadas.length - 1}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {editingJornada && (
        <EditJornadaModal
          jornada={editingJornada}
          hasMatches={getMatchCount(editingJornada) > 0}
          onClose={() => setEditingJornada(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

export default MatchdayManager
