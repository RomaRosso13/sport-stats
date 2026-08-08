import { useEffect, useState } from 'react'
import { useCategory } from '../../context/CategoryContext'
import { useLeague } from '../../context/LeagueContext'
import { useToast } from '../../context/ToastContext'

import MatchdaySelector from '../../components/Admin/MatchdaySelector'
import AttendanceList from '../../components/Admin/AttendanceList'
import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import CategorySwitcher from '../../components/filters/CategorySwitcher'

import { getMatchesByMatchDayIds } from '../../services/match.service'
import { getMatchDaysByCategoryId } from '../../services/matchday.service'
import { getTeamsByCategoryId } from '../../services/team.service'
import { getAttendanceByMatchIds, setAttendance } from '../../services/attendance.service'

import './AttendanceManager.css'

function AttendanceManager() {
  const [matchdays, setMatchdays] = useState([])
  const { categories, category, setCategory } = useCategory()
  const [selectedMatchday, setSelectedMatchday] = useState(null)
  const { league } = useLeague()
  const toast = useToast()

  const [teams, setTeams] = useState([])
  const [teamsLoaded, setTeamsLoaded] = useState(false)
  const [attendanceByMatch, setAttendanceByMatch] = useState({})
  const [savingKey, setSavingKey] = useState(null)

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

  useEffect(() => {
    if (!category) return

    async function loadTeams() {
      setTeamsLoaded(false)
      const teamsData = await getTeamsByCategoryId(category.id)
      setTeams(teamsData || [])
      setTeamsLoaded(true)
    }

    loadTeams()
  }, [category?.id])

  const currentMatchday = matchdays.find(md => md.id === selectedMatchday?.id)

  useEffect(() => {
    const gameIds = currentMatchday?.games?.map(g => g.id) || []
    if (!gameIds.length) {
      setAttendanceByMatch({})
      return
    }

    async function loadAttendance() {
      const rows = await getAttendanceByMatchIds(gameIds)
      const byMatch = {}
      rows.forEach(row => {
        if (!byMatch[row.match_id]) byMatch[row.match_id] = {}
        byMatch[row.match_id][row.player_id] = row
      })
      setAttendanceByMatch(byMatch)
    }

    loadAttendance()
  }, [currentMatchday?.id])

  async function handleToggle(match, player, teamId, present) {
    const key = `${match.id}_${player.id}`
    try {
      setSavingKey(key)
      const row = await setAttendance(match.id, player.id, teamId, category.id, present)
      setAttendanceByMatch(prev => ({
        ...prev,
        [match.id]: { ...(prev[match.id] || {}), [player.id]: row }
      }))
    } catch (error) {
      console.error(error)
      toast.error('No se pudo actualizar la asistencia')
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="app-layout">
      <Header league={league} />
      <main className="attendance-manager-container">
        <div className="attendance-manager-intro">
          <h2>Asistencia</h2>
          <p>Elige la jornada y marca la asistencia de cada jugador por partido.</p>
        </div>

        <CategorySwitcher categories={categories} active={category} onChange={setCategory} label="Editando categoría" />
        <MatchdaySelector matchdays={matchdays} value={selectedMatchday} onChange={setSelectedMatchday} />

        {currentMatchday ? (
          <AttendanceList
            matches={currentMatchday.games}
            teams={teams}
            teamsLoaded={teamsLoaded}
            attendanceByMatch={attendanceByMatch}
            savingKey={savingKey}
            onToggle={handleToggle}
          />
        ) : (
          <p className="attendance-manager-empty">
            Selecciona una jornada para registrar asistencia
          </p>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default AttendanceManager
