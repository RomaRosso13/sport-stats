import BracketMatchCard from "./BracketMatchCard"
import "./PlayoffBracket.css"

const ROUNDS = [
  { stage: 'Cuartos', label: 'Cuartos de Final' },
  { stage: 'Semifinal', label: 'Semifinal' },
  { stage: 'Final', label: 'Final' }
]

function PlayoffBracket({ matchesByStage }) {
  return (
    <div className="bracket">
      {ROUNDS.map(({ stage, label }, roundIndex) => {
        const matches = matchesByStage[stage] || []
        const items = matches.length > 0 ? matches : [null]
        const isLastRound = roundIndex === ROUNDS.length - 1

        return (
          <div key={stage} className="bracket-round">
            <h3 className="bracket-round-title">{label}</h3>

            <div className="bracket-matches">
              {items.map((match, i) => (
                <div
                  key={match?.id ?? `${stage}-placeholder-${i}`}
                  className={`bracket-match-wrap ${!isLastRound ? 'has-connector' : ''}`}
                >
                  <BracketMatchCard match={match} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PlayoffBracket
