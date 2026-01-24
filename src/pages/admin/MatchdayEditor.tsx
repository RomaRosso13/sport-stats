import { useEffect, useState } from 'react'
import { useCategory } from '../../context/CategoryContext';
import { useLeague } from '../../context/LeagueContext'

import MatchdaySelector from '../../components/Admin/MatchdaySelector'
import MatchList from '../../components/Admin/MatchList'
import Header from '../../components/Header';
import CategorySelector from '../../components/CategorySelector';
import Loader from '../../components/Loader';
import PageWrapper from '../../components/PageWrapper';

import { getMatchesByMatchDayIds, updateMatches } from '../../services/match.service'
import { getMatchDaysByCategoryId } from '../../services/matchday.service'

import './MatchdayEditor.css'

function EditMatchday() {
  const [matchdays, setMatchdays] = useState([]) // Jornadas con Partidos
  const { categories, category, setCategory, categoryLoading } = useCategory()
  const [selectedMatchday, setSelectedMatchday] = useState(null)
  const [matches, setMatches] = useState([])
  const { league, loading: leagueLoading } = useLeague()
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)


  useEffect(() => {
    if (!category) return

    async function loadMatchdays() {
      const matchdaysData = await getMatchDaysByCategoryId(category.id)
      const ids = matchdaysData.map(md => md.id)
      const allMatches = await getMatchesByMatchDayIds(ids)
      const matchesMap = {}
      allMatches.forEach(match => {
        if (!matchesMap[match.matchday_id]) {
          matchesMap[match.matchday_id] = []
        }
        matchesMap[match.matchday_id].push(match)
      })

      setMatchdays(
        matchdaysData.map(md => ({
          ...md,
          games: matchesMap[md.id] || []
        }))
      )
      setSelectedMatchday(matchdaysData[0])
    }

    loadMatchdays()
  }, [category?.id])

  const currentMatchday = matchdays.find( md => md.id === selectedMatchday?.id)

async function handleSave() {
  if (!currentMatchday) return

  try {
    setSaving(true)
    setSaveSuccess(false)

    await updateMatches(currentMatchday.games)

    setSaveSuccess(true)

    // Oculta success después de 2s
    setTimeout(() => setSaveSuccess(false), 2000)

  } catch (error) {
    console.error('Supabase error:', error.message)
    alert('Error al guardar los cambios')
  } finally {
    setSaving(false)
  }
}


  return (
    <div className='app-layout'>
    <Loader show={saving} label="Cargando..." />
    <PageWrapper loading={saving}/>

      <Header league={league}/>
      <main className="matchday-editor-container">
        <CategorySelector categories={categories} active={category} onChange={setCategory} />
        <MatchdaySelector matchdays={matchdays} value={selectedMatchday} onChange={setSelectedMatchday}/>
        {currentMatchday?.games?.length > 0 && (
          <MatchList
            matches={currentMatchday.games}
            onChange={updatedMatch => {
              setMatchdays(prev =>
                prev.map(md =>
                  md.id === currentMatchday.id
                    ? {
                        ...md,
                        games: md.games.map(m =>
                          m.id === updatedMatch.id ? updatedMatch : m
                        )
                      }
                    : md
                )
              )
            }}
          />
        )}
        <button className="save-button" onClick={handleSave}> Guardar cambios</button>
      </main>
      <footer className="app-footer">
      © {new Date().getFullYear()} Liga · Todos los derechos reservados
    </footer>
    </div>
  )
}

export default EditMatchday
