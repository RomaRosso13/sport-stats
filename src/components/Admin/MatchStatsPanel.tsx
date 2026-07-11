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

function MatchStatsPanel({
  match,
  localPlayers = [],
  visitPlayers = [],
  entries = [],
  statsTotals = {},
  onAddEntry,
  onRemoveEntry
}) {
  const [side, setSide] = useState('local')
  const [playerId, setPlayerId] = useState('')
  const [statKey, setStatKey] = useState('touchdown')
  const [amount, setAmount] = useState<number | string>(1)

  const players = side === 'local' ? localPlayers : visitPlayers
  const teamLabel = side === 'local' ? match.local_team.name : match.visit_team.name
  const teamId = side === 'local' ? match.local_team.id : match.visit_team.id

  const selectedPlayer = players.find(p => String(p.id) === String(playerId))
  const currentTotal = playerId
    ? (statsTotals[playerId]?.[statKey] || 0)
    : null

  function handleSideChange(newSide) {
    setSide(newSide)
    setPlayerId('')
  }

  function handleAdd() {
    if (!selectedPlayer || !amount) return

    onAddEntry(match.id, {
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      playerNumber: selectedPlayer.number,
      teamId,
      teamLabel: side === 'local' ? 'Local' : 'Visitante',
      statKey,
      amount: Number(amount)
    })

    setAmount(1)
  }

  return (
    <div className="match-stats-panel">
      <div className="stats-entry-form">
        <div className="stats-side-toggle">
          <button
            type="button"
            className={side === 'local' ? 'active' : ''}
            onClick={() => handleSideChange('local')}
          >
            {match.local_team.name}
          </button>
          <button
            type="button"
            className={side === 'visit' ? 'active' : ''}
            onClick={() => handleSideChange('visit')}
          >
            {match.visit_team.name}
          </button>
        </div>

        <div className="stats-entry-fields">
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
              <span className="stats-empty-hint">{teamLabel} no tiene jugadores activos</span>
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
      </div>

      {entries.length > 0 && (
        <ul className="stats-entries-list">
          {entries.map(entry => (
            <li key={entry.id} className="stats-entry">
              <span className="stats-entry-team">{entry.teamLabel}</span>
              <span className="stats-entry-player">#{entry.playerNumber} {entry.playerName}</span>
              <span className="stats-entry-amount">+{entry.amount} {STAT_LABELS[entry.statKey]}</span>
              <button
                type="button"
                className="remove-stat-btn"
                onClick={() => onRemoveEntry(match.id, entry.id)}
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

export default MatchStatsPanel
