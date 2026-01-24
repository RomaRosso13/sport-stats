import { useState } from 'react'
import './MatchdayCreator.css'
import Header from '../../components/Header'
import MatchdayCreatorHeader from '../../components/Admin/MatchdayCreatorheader'
import MatchdayMatchesEditor from '../../components/Admin/MatchdayMatchesEditor'

import { useLeague } from '../../context/LeagueContext'


function MatchDayCreator () {
  const { league, loading: leagueLoading } = useLeague()
  const [selectedMatchday, setSelectedMatchday] = useState(null)

  return (
    <div className='app-layout'>
      <Header league={league}/>
      <MatchdayCreatorHeader selectedMatchday={selectedMatchday} setSelectedMatchday={setSelectedMatchday} />

      <MatchdayMatchesEditor
        matchday={selectedMatchday}
      />

    <footer className="app-footer">
      © {new Date().getFullYear()} Liga · Todos los derechos reservados
    </footer>
    </div>
  )
}

export default MatchDayCreator