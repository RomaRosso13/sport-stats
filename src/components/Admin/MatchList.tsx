import MatchRow from './MatchRow'

function MatchList({ matches = [], onChange }) {
  if (!matches.length) {
    return <p>No hay partidos en esta jornada</p>
  }

  return (
    <div className="match-list">
      {matches.map(match => (
        <MatchRow key={match.id} match={match} onChange={onChange}/>
      ))}
    </div>
  )
}

export default MatchList
