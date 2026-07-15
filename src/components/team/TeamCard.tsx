import { useState } from "react"
import { Link, useParams } from "react-router-dom"

import TeamStats from "./TeamStats"
import PlayerRow from "../player/PlayerRow"

import { calculateTeamStats } from "../../utils/calculateTeamStats"
import { sortPlayersByNumber } from "../../utils/sortPlayers"

import "./TeamCard.css"

function TeamCard({ team, matchdays }) {
  const { leagueSlug } = useParams()
  const [open, setOpen] = useState(false)
  const stats = calculateTeamStats(team.name, matchdays)
  const sortedPlayers = sortPlayersByNumber(team.Player || [])

  return (
    <div className="team-card">

    <header className="team-header">
      <Link to={`/${leagueSlug}/equipos/${team.id}`} className="team-info">
        <img
          src={team.logo_url}
          alt={team.name}
          className="team-logo"
        />

        <div className="team-text">
          <h3 className="team-name">{team.name}</h3>
          <span className="coach">
            Coach: {team.coach || "Sin asignar"}
          </span>
        </div>
      </Link>
    </header>

    <div className="team-card-body">
      <TeamStats stats={stats} />

      <button
        className="players-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? "− Ocultar jugadores" : `+ Ver jugadores (${sortedPlayers.length})`}
      </button>

      <div className={`players-section ${open ? "open" : ""}`}>
        {sortedPlayers.length > 0 ? (
          sortedPlayers.map(player => (
            <PlayerRow key={player.id} player={player} />
          ))
        ) : (
          <p className="empty">Sin jugadores registrados</p>
        )}
      </div>
    </div>

    </div>
  )
}

export default TeamCard
