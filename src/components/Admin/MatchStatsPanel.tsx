import { useState } from 'react'
import { createPlayer } from '../../services/player.service.js'
import { STAT_KEYS } from '../../constants/statFields'
import { useConfirm } from '../../context/ConfirmContext'
import TeamLogo from '../common/TeamLogo'
import './MatchStatsPanel.css'

const NEW_PLAYER_VALUE = '__new__'

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
  statLabels,
  onAddEntry,
  onRemoveEntry,
  onPlayerCreated,
  canManageSavedStats = false,
  onUpdateSavedStat
}) {
  const STAT_OPTIONS = STAT_KEYS.map(key => ({ key, label: statLabels[key] }))
  const confirm = useConfirm()

  const [playerId, setPlayerId] = useState('')
  const [statKey, setStatKey] = useState('touchdown')
  const [amount, setAmount] = useState<number | string>(1)

  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false)
  const [newPlayerNumber, setNewPlayerNumber] = useState('')
  const [newPlayerName, setNewPlayerName] = useState('')
  const [creatingPlayer, setCreatingPlayer] = useState(false)
  const [newPlayerError, setNewPlayerError] = useState('')

  const selectedPlayer = players.find(p => String(p.id) === String(playerId))
  const currentTotal = playerId
    ? (statsTotals[playerId]?.[statKey] || 0)
    : null

  function handlePlayerSelectChange(value) {
    if (value === NEW_PLAYER_VALUE) {
      setShowNewPlayerForm(true)
      setNewPlayerError('')
      setPlayerId('')
      return
    }

    setShowNewPlayerForm(false)
    setPlayerId(value)
  }

  async function handleCreatePlayer() {
    if (!newPlayerNumber.trim()) {
      setNewPlayerError('El número es obligatorio')
      return
    }

    try {
      setCreatingPlayer(true)
      setNewPlayerError('')

      const created = await createPlayer(teamId, {
        name: newPlayerName.trim() || `Jugador #${newPlayerNumber.trim()}`,
        number: newPlayerNumber.trim(),
        position: '',
        imageUrl: ''
      })

      onPlayerCreated(created)
      setPlayerId(created.id)
      setShowNewPlayerForm(false)
      setNewPlayerNumber('')
      setNewPlayerName('')
    } catch (err) {
      console.error(err)
      setNewPlayerError('No se pudo crear al jugador')
    } finally {
      setCreatingPlayer(false)
    }
  }

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
        rowId: row.id,
        statKey: opt.key,
        playerName: row.player?.name,
        playerNumber: row.player?.number,
        label: opt.label,
        amount: row[opt.key]
      }))
  )

  function handleSavedAmountBlur(line, rawValue) {
    const newAmount = Number(rawValue)
    if (Number.isNaN(newAmount) || newAmount === line.amount) return
    onUpdateSavedStat(line.rowId, line.statKey, newAmount)
  }

  async function handleSavedDelete(line) {
    const ok = await confirm({
      message: `¿Eliminar ${line.amount} ${line.label} de ${line.playerName}?`,
      confirmLabel: 'Eliminar',
      danger: true
    })
    if (!ok) return
    onUpdateSavedStat(line.rowId, line.statKey, 0)
  }

  const hasEntries = savedLines.length > 0 || draftEntries.length > 0

  return (
    <div className={`stats-column ${side}`}>
      <h4 className="stats-column-title">
        <TeamLogo logoUrl={teamLogo} name={teamName} alt="" className="stats-column-logo" />
        {teamName}
      </h4>

      <div className="stats-column-form">
        <div className="stats-field-group">
          <label>Jugador</label>
          <select
            value={showNewPlayerForm ? NEW_PLAYER_VALUE : playerId}
            onChange={e => handlePlayerSelectChange(e.target.value)}
          >
            <option value="">Selecciona un jugador</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>
                #{p.number} {p.name}
              </option>
            ))}
            <option value={NEW_PLAYER_VALUE}>+ Jugador nuevo (no está en el roster)</option>
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

      {showNewPlayerForm && (
        <div className="new-player-form">
          <div className="stats-field-group">
            <label>Número *</label>
            <input
              type="number"
              min="0"
              placeholder="Ej. 7"
              value={newPlayerNumber}
              onChange={e => setNewPlayerNumber(e.target.value)}
            />
          </div>

          <div className="stats-field-group">
            <label>Nombre (opcional)</label>
            <input
              type="text"
              placeholder="Aún no lo saben"
              value={newPlayerName}
              onChange={e => setNewPlayerName(e.target.value)}
            />
          </div>

          <div className="stats-field-group add-stat-group">
            <label>&nbsp;</label>
            <button
              type="button"
              className="add-stat-btn"
              onClick={handleCreatePlayer}
              disabled={creatingPlayer}
            >
              {creatingPlayer ? 'Creando…' : 'Crear y usar'}
            </button>
          </div>

          {newPlayerError && (
            <span className="new-player-error">{newPlayerError}</span>
          )}
        </div>
      )}

      {playerId && (
        <span className="stats-total-hint">
          Total actual de {selectedPlayer?.name}: {currentTotal} {statLabels[statKey]}
        </span>
      )}

      {hasEntries && (
        <ul className="stats-entries-list">
          {savedLines.map(line => (
            <li key={line.id} className="stats-entry saved">
              <span className="stats-entry-player">#{line.playerNumber} {line.playerName}</span>
              {canManageSavedStats ? (
                <>
                  <input
                    type="number"
                    min="0"
                    className="stats-entry-edit-input"
                    aria-label={`${line.label} de ${line.playerName}`}
                    defaultValue={line.amount}
                    onBlur={e => handleSavedAmountBlur(line, e.target.value)}
                  />
                  <span className="stats-entry-amount-label">{line.label}</span>
                  <button
                    type="button"
                    className="remove-stat-btn"
                    onClick={() => handleSavedDelete(line)}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <span className="stats-entry-amount">{line.amount} {line.label}</span>
              )}
            </li>
          ))}

          {draftEntries.map(entry => (
            <li key={entry.id} className="stats-entry draft">
              <span className="stats-entry-player">#{entry.playerNumber} {entry.playerName}</span>
              <span className="stats-entry-amount">+{entry.amount} {statLabels[entry.statKey]}</span>
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
  statLabels,
  onAddEntry,
  onRemoveEntry,
  onPlayerCreated,
  canManageSavedStats = false,
  onUpdateSavedStat
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
          statLabels={statLabels}
          onAddEntry={onAddEntry}
          onRemoveEntry={onRemoveEntry}
          onPlayerCreated={onPlayerCreated}
          canManageSavedStats={canManageSavedStats}
          onUpdateSavedStat={onUpdateSavedStat}
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
          statLabels={statLabels}
          onAddEntry={onAddEntry}
          onRemoveEntry={onRemoveEntry}
          onPlayerCreated={onPlayerCreated}
          canManageSavedStats={canManageSavedStats}
          onUpdateSavedStat={onUpdateSavedStat}
        />
      </div>
    </div>
  )
}

export default MatchStatsPanel
