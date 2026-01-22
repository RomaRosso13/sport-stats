import { useState } from "react"

import TeamStats from "./TeamStats"
import PlayerRow from "./PlayerRow"

import { calculateTeamStats } from "../utils/calculateTeamStats"

import "./TeamCard.css"

function TeamCard({ team, matchdays }) {
  const [open, setOpen] = useState(false)
  const stats = calculateTeamStats(team.name, matchdays)

  return (
    <div className="team-card">

    <header className="team-header">
      <div className="team-info">
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
      </div>
    </header>


      <TeamStats stats={stats} />

      <button
        className="players-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? "Ocultar jugadores ▲" : "Ver jugadores ▼"}
      </button>

      <div className={`players-section ${open ? "open" : ""}`}>
        {team.jugadores && team.jugadores.length > 0 ? (
          team.jugadores.map(player => (
            <PlayerRow key={player.id} player={player} />
          ))
        ) : (
          <p className="empty">Sin jugadores registrados</p>
        )}
      </div>

    </div>
  )
}

export default TeamCard
