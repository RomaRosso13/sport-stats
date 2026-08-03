import './TeamLeagueComparison.css'

function ComparisonRow({ label, teamValue, leagueValue, goodDirection }) {
  const max = Math.max(teamValue, leagueValue, 1) * 1.15
  const teamPct = Math.min(100, (teamValue / max) * 100)
  const leaguePct = Math.min(100, (leagueValue / max) * 100)

  const diff = leagueValue > 0 ? Math.round(((teamValue - leagueValue) / leagueValue) * 100) : 0
  const isGood = goodDirection === 'up' ? diff > 0 : diff < 0
  const isBad = goodDirection === 'up' ? diff < 0 : diff > 0
  const diffLabel = diff === 0 ? 'Igual al promedio' : `${diff > 0 ? '+' : ''}${diff}% vs. liga`

  return (
    <div className="league-comp-row">
      <div className="league-comp-header">
        <span className="league-comp-label">{label}</span>
        <span className={`league-comp-diff ${isGood ? 'good' : isBad ? 'bad' : ''}`}>{diffLabel}</span>
      </div>

      <div className="league-comp-track">
        <div className="league-comp-fill" style={{ width: `${teamPct}%` }} />
        <div
          className="league-comp-marker"
          style={{ left: `${leaguePct}%` }}
          title={`Promedio de la liga: ${leagueValue}`}
        />
      </div>

      <div className="league-comp-values">
        <span>Tu equipo: <strong>{teamValue}</strong></span>
        <span>Promedio de la liga: <strong>{leagueValue}</strong></span>
      </div>
    </div>
  )
}

function TeamLeagueComparison({ teamAvgFor, teamAvgAgainst, leagueAverage }) {
  if (!leagueAverage) return null

  return (
    <div className="team-league-comparison">
      <ComparisonRow
        label="Puntos a favor (por partido)"
        teamValue={teamAvgFor}
        leagueValue={leagueAverage}
        goodDirection="up"
      />
      <ComparisonRow
        label="Puntos en contra (por partido)"
        teamValue={teamAvgAgainst}
        leagueValue={leagueAverage}
        goodDirection="down"
      />
    </div>
  )
}

export default TeamLeagueComparison
