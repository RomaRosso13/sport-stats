import { getMatchupInfo } from '../../utils/matchupHelper'
import './MatchupHelper.css'

function MatchupHelper({ teams, matches, teamId, onSelectOpponent }) {
  const info = getMatchupInfo(teams, matches, teamId)

  if (!info || (info.played.length === 0 && info.suggested.length === 0)) {
    return null
  }

  return (
    <div className="matchup-helper">
      <span className="matchup-helper-title">
        Ayuda para el rival de <strong>{info.team.name}</strong>
      </span>

      {info.suggested.length > 0 && (
        <div className="matchup-section">
          <span className="matchup-section-label">Sugerencias · aún no se enfrentan</span>
          <div className="matchup-chip-list">
            {info.suggested.map(t => (
              <button
                type="button"
                key={t.id}
                className="matchup-chip suggested"
                onClick={() => onSelectOpponent(t.id)}
              >
                {t.logo_url && <img src={t.logo_url} alt="" loading="lazy" />}
                <span>{t.name}</span>
                <span className="matchup-chip-count">{t.gamesPlayed} jugados</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {info.played.length > 0 && (
        <div className="matchup-section">
          <span className="matchup-section-label">Ya se enfrentaron</span>
          <div className="matchup-chip-list">
            {info.played.map(t => (
              <button
                type="button"
                key={t.id}
                className="matchup-chip played"
                onClick={() => onSelectOpponent(t.id)}
              >
                {t.logo_url && <img src={t.logo_url} alt="" loading="lazy" />}
                <span>{t.name}</span>
                <span className="matchup-chip-count">
                  {t.timesPlayed} {t.timesPlayed === 1 ? 'vez' : 'veces'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchupHelper
