import MatchCard from "./MatchCard"
import "./MatchesList.css"

function MatchesList({ matches }) {
  return (
    <div className="matches-grid">
      {matches.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  )
}

export default MatchesList
