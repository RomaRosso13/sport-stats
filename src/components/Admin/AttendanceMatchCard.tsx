import TeamLogo from '../common/TeamLogo'
import PlayerAvatar from '../common/PlayerAvatar'
import './AttendanceMatchCard.css'

function AttendanceRoster({ match, team, side, players, attendanceForMatch, savingKey, onToggle }) {
  const presentCount = players.filter(p => attendanceForMatch[p.id]?.present === true).length
  const pct = players.length ? Math.round((presentCount / players.length) * 100) : 0

  return (
    <div className={`attendance-roster side-${side}`}>
      <div className="attendance-roster-team">
        <span className="attendance-roster-side-tag">{side === 'local' ? 'Local' : 'Visitante'}</span>
        <TeamLogo logoUrl={team.logo_url} name={team.name} alt={team.name} className="attendance-roster-team-logo" />
        <span className="attendance-roster-team-name">{team.name}</span>
      </div>

      <div className="attendance-roster-header">
        <span className="attendance-roster-label">Presente</span>
        <div className="attendance-roster-bar">
          <div className="attendance-roster-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="attendance-roster-count">{presentCount}/{players.length}</span>
      </div>

      {players.length === 0 ? (
        <p className="attendance-roster-empty">Sin jugadores activos</p>
      ) : (
        players.map(player => {
          const row = attendanceForMatch[player.id]
          const isPresent = row?.present === true
          const isAbsent = row?.present === false
          const isSaving = savingKey === `${match.id}_${player.id}`

          return (
            <div key={player.id} className={`attendance-player-row ${isPresent ? 'is-present' : ''} ${isAbsent ? 'is-absent' : ''}`}>
              <PlayerAvatar photoUrl={player.image_url} name={player.name} className="attendance-player-avatar" />
              <span className="attendance-player-number">
                {player.number != null ? `#${player.number}` : '—'}
              </span>
              <span className="attendance-player-name">{player.name}</span>

              <div className="attendance-actions">
                <button
                  type="button"
                  disabled={isSaving}
                  className={`attendance-present-btn ${isPresent ? 'active' : ''}`}
                  onClick={() => onToggle(match, player, team.id, true)}
                >
                  <span className="attendance-btn-icon">✓</span> Presente
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  className={`attendance-absent-btn ${isAbsent ? 'active' : ''}`}
                  onClick={() => onToggle(match, player, team.id, false)}
                >
                  <span className="attendance-btn-icon">✕</span> Ausente
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

function AttendanceMatchCard({ match, localPlayers, visitPlayers, teamsLoaded, attendanceForMatch, savingKey, onToggle }) {
  const roster = [...localPlayers, ...visitPlayers]
  const markedCount = roster.filter(p => attendanceForMatch[p.id]?.present !== undefined).length
  const completion = roster.length === 0
    ? 'empty'
    : markedCount === 0
      ? 'none'
      : markedCount === roster.length
        ? 'complete'
        : 'partial'

  return (
    <div className={`attendance-match-card ${completion}`}>
      <div className="attendance-match-header">
        <div className="team">
          <TeamLogo logoUrl={match.local_team.logo_url} name={match.local_team.name} alt={match.local_team.name} className="team-logo" />
          <span className="team-name">{match.local_team.name}</span>
        </div>
        <span className="vs">vs</span>
        <div className="team">
          <TeamLogo logoUrl={match.visit_team.logo_url} name={match.visit_team.name} alt={match.visit_team.name} className="team-logo" />
          <span className="team-name">{match.visit_team.name}</span>
        </div>
      </div>

      <div className="attendance-match-meta">
        {match.branch?.name && <span>{match.branch.name}</span>}
        {match.field?.name && <span>· {match.field.name}</span>}
        {match.date && <span>· {match.date}</span>}
        {match.hour && <span>· {match.hour.slice(0, 5)}</span>}
        {completion === 'complete' && <span className="attendance-complete-tag">✓ Asistencia completa</span>}
      </div>

      {!teamsLoaded ? (
        <p className="attendance-loading">Cargando roster...</p>
      ) : (
        <div className="attendance-columns">
          <AttendanceRoster
            match={match}
            team={match.local_team}
            side="local"
            players={localPlayers}
            attendanceForMatch={attendanceForMatch}
            savingKey={savingKey}
            onToggle={onToggle}
          />
          <AttendanceRoster
            match={match}
            team={match.visit_team}
            side="visit"
            players={visitPlayers}
            attendanceForMatch={attendanceForMatch}
            savingKey={savingKey}
            onToggle={onToggle}
          />
        </div>
      )}
    </div>
  )
}

export default AttendanceMatchCard
