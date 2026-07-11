import { useState } from 'react'
import './MatchStatsPanel.css'

const STAT_OPTIONS = [
  { key: 'touchdown', label: 'Touchdown' },
  { key: 'touchdown_pass', label: 'Pase de touchdown' },
  { key: 'sacks', label: 'Sack' },
  { key: 'interceptions', label: 'Intercepción' }
]

const STAT_LABELS = STAT_OPTIONS.reduce((map, opt) => {
  map[opt.key] = opt.label
  return map
}, {})

function TeamStatsColumn({
  matchId,
  side,
  teamId,
  teamName,
  teamLogo,
  teamLabel,
  players,
  savedEntries,
  draftEntries,
  statsTotals,
  onAddEntry,
  onRemoveEntry
}) {
  const [playerId, setPlayerId] = useState('')
  const [statKey, setStatKey] = useState('touchdown')
  const [amount, setAmount] = useState<number | string>(1)

  const selectedPlayer = players.find(p => String(p.id) === String(playerId))
  const currentTotal = playerId
    ? (statsTotals[playerId]?.[statKey] || 0)
    : null

  function handleAdd() {
    if (!selectedPlayer || !amount) return

    onAddEntry(matchId, {
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      playerNumber: selectedPlayer.number,
      teamId,
      teamLabel,
      statKey,
      amount: Number(amount)
    })

    setAmount(1)
  }

  const savedLines = savedEntries.flatMap(row =>
    STAT_OPTIONS
      .filter(opt => (row[opt.key] || 0) > 0)
      .map(opt => ({
        id: `saved-${row.id}-${opt.key}`,
        playerName: row.player?.name,
        playerNumber: row.player?.number,
        label: opt.label,
        amount: row[opt.key]
      }))
  )

  const hasEntries = savedLines.length > 0 || draftEntries.length > 0

  return (
    <div className={`stats-column ${side}`}>
      <h4 className="stats-column-title">
        {teamLogo && <img src={teamLogo} alt="" />}
        {teamName}
      </h4>

      <div className="stats-column-form">
        <div className="stats-field-group">
          <label>Jugador</label>
          <select value={playerId} onChange={e => setPlayerId(e.target.value)}>
            <option value="">Selecciona un jugador</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>
                #{p.number} {p.name}
              </option>
            ))}
          </select>
          {players.length === 0 && (
            <span className="stats-empty-hint">{teamName} no tiene jugadores activos</span>
          )}
        </div>

        <div className="stats-field-group">
          <label>Estadística</label>
          <select value={statKey} onChange={e => setStatKey(e.target.value)}>
            {STAT_OPTIONS.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="stats-field-group amount-group">
          <label>Cantidad</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>

        <div className="stats-field-group add-stat-group">
          <label>&nbsp;</label>
          <button
            type="button"
            className="add-stat-btn"
            onClick={handleAdd}
            disabled={!playerId || !amount}
          >
            + Agregar
          </button>
        </div>
      </div>

      {playerId && (
        <span className="stats-total-hint">
          Total actual de {selectedPlayer?.name}: {currentTotal} {STAT_LABELS[statKey].toLowerCase()}
        </span>
      )}

      {hasEntries && (
        <ul className="stats-entries-list">
          {savedLines.map(line => (
            <li key={line.id} className="stats-entry saved">
              <span className="stats-entry-player">#{line.playerNumber} {line.playerName}</span>
              <span className="stats-entry-amount">{line.amount} {line.label}</span>
            </li>
          ))}

          {draftEntries.map(entry => (
            <li key={entry.id} className="stats-entry draft">
              <span className="stats-entry-player">#{entry.playerNumber} {entry.playerName}</span>
              <span className="stats-entry-amount">+{entry.amount} {STAT_LABELS[entry.statKey]}</span>
              <button
                type="button"
                className="remove-stat-btn"
                onClick={() => onRemoveEntry(matchId, entry.id)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MatchStatsPanel({
  match,
  localPlayers = [],
  visitPlayers = [],
  entries = [],
  savedStats = [],
  statsTotals = {},
  onAddEntry,
  onRemoveEntry
}) {
  const localDraft = entries.filter(e => String(e.teamId) === String(match.local_team.id))
  const visitDraft = entries.filter(e => String(e.teamId) === String(match.visit_team.id))
  const localSaved = savedStats.filter(row => String(row.team_id) === String(match.local_team.id))
  const visitSaved = savedStats.filter(row => String(row.team_id) === String(match.visit_team.id))

  return (
    <div className="match-stats-panel">
      <div className="stats-columns">
        <TeamStatsColumn
          matchId={match.id}
          side="local"
          teamId={match.local_team.id}
          teamName={match.local_team.name}
          teamLogo={match.local_team.logo_url}
          teamLabel="Local"
          players={localPlayers}
          savedEntries={localSaved}
          draftEntries={localDraft}
          statsTotals={statsTotals}
          onAddEntry={onAddEntry}
          onRemoveEntry={onRemoveEntry}
        />

        <TeamStatsColumn
          matchId={match.id}
          side="visit"
          teamId={match.visit_team.id}
          teamName={match.visit_team.name}
          teamLogo={match.visit_team.logo_url}
          teamLabel="Visitante"
          players={visitPlayers}
          savedEntries={visitSaved}
          draftEntries={visitDraft}
          statsTotals={statsTotals}
          onAddEntry={onAddEntry}
          onRemoveEntry={onRemoveEntry}
        />
      </div>
    </div>
  )
}

export default MatchStatsPanel
