import { OFFENSE_STAT_KEYS, DEFENSE_STAT_KEYS } from '../../utils/calculateTeamOffenseDefense'
import './TeamOffenseDefenseChart.css'

function StatBar({ label, value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const isLeader = value > 0 && value >= max

  return (
    <div className="od-stat-row">
      <span className="od-stat-label">{label}</span>
      <div className="od-stat-track">
        <div className="od-stat-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="od-stat-value">
        {value}
        {isLeader && <span className="od-leader-tag">líder de la liga</span>}
      </span>
    </div>
  )
}

function TeamOffenseDefenseChart({ totals = {}, leagueMaxes = {}, statLabels = {}, hasData = true }) {
  if (!hasData) {
    return <p className="team-chart-empty">Aún no hay estadísticas registradas</p>
  }

  return (
    <div className="team-od-chart">
      <div className="od-section">
        <div className="od-section-header">
          <span className="od-section-dot offense" />
          <span className="od-section-title">Ofensiva</span>
        </div>
        {OFFENSE_STAT_KEYS.map(key => (
          <StatBar key={key} label={statLabels[key]} value={totals[key] || 0} max={leagueMaxes[key] || 1} />
        ))}
      </div>

      <div className="od-section">
        <div className="od-section-header">
          <span className="od-section-dot defense" />
          <span className="od-section-title">Defensiva</span>
        </div>
        {DEFENSE_STAT_KEYS.map(key => (
          <StatBar key={key} label={statLabels[key]} value={totals[key] || 0} max={leagueMaxes[key] || 1} />
        ))}
      </div>
    </div>
  )
}

export default TeamOffenseDefenseChart
