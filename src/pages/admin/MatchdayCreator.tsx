import { useEffect, useState } from 'react'
import './MatchdayCreator.css'
import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import MatchdayCreatorHeader from '../../components/Admin/MatchdayCreatorHeader'
import MatchdayMatchesEditor from '../../components/Admin/MatchdayMatchesEditor'
import Loader from '../../components/common/Loader'
import PageWrapper from '../../components/common/PageWrapper'

import { createMatches } from '../../services/match.service.js'
import { useLeague } from '../../context/LeagueContext'
import { useToast } from '../../context/ToastContext'


function MatchDayCreator () {
  const { league } = useLeague()
  const toast = useToast()
  const [selectedMatchday, setSelectedMatchday] = useState(null)
  const [matches, setMatches] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  const hasMatchday = !!selectedMatchday && selectedMatchday.id !== 'new'
  const canSave = hasMatchday && matches.length > 0

  useEffect(() => {
    if (!saveSuccess) return
    const timeout = setTimeout(() => setSaveSuccess(false), 4000)
    return () => clearTimeout(timeout)
  }, [saveSuccess])

  async function handleCreate () {
    if (!canSave) return

    try {
      setSaving(true)

      const matchesResponse = await createMatches(matches)

      console.log('Creados', matchesResponse)
      setMatches([])
      setSaveSuccess(true)
      setReloadToken(prev => prev + 1)

    } catch (error) {
      console.error('Supabase error:', error.message)
      toast.error('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  function getSaveHint () {
    if (!hasMatchday) return 'Selecciona o crea una jornada para poder guardar'
    if (!matches.length) return 'Agrega al menos un partido para poder guardar'
    return ''
  }

  return (
    <div className='app-layout'>
      <Header league={league}/>
      <Loader show={saving} label="Cargando..." />
      <PageWrapper loading={saving}/>

      <div className="matchday-creator-intro">
        <h2>Editor de Jornadas</h2>
        <p>Elige la jornada, agrega los partidos y guárdalos cuando estés list@.</p>
      </div>

      <MatchdayCreatorHeader selectedMatchday={selectedMatchday} setSelectedMatchday={setSelectedMatchday} />
      <MatchdayMatchesEditor matchday={selectedMatchday} matches={matches} setMatches={setMatches} reloadToken={reloadToken}/>

      <div className="save-action">
        {saveSuccess && <span className="save-success">✓ Partidos guardados</span>}
        {!canSave && !saveSuccess && <span className="save-hint">{getSaveHint()}</span>}
        <button
          className="create-button"
          onClick={handleCreate}
          disabled={!canSave || saving}
        >
          {saving
            ? 'Guardando...'
            : matches.length > 0
              ? `Guardar ${matches.length} partido${matches.length === 1 ? '' : 's'}`
              : 'Guardar partidos'}
        </button>
      </div>

      <Footer />
    </div>
  )
}

export default MatchDayCreator