import { useState } from "react"
import { Link, useParams } from "react-router-dom"

import TeamStats from "./TeamStats"
import PlayerRow from "../player/PlayerRow"

import { calculateTeamStats } from "../../utils/calculateTeamStats"

import "./TeamCard.css"

function TeamCard({ team, matchdays }) {
  const { leagueSlug } = useParams()
  const [open, setOpen] = useState(false)
  const stats = calculateTeamStats(team.name, matchdays)

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
        {open ? "− Ocultar jugadores" : `+ Ver jugadores (${team.Player?.length || 0})`}
      </button>

      <div className={`players-section ${open ? "open" : ""}`}>
        {team.Player && team.Player.length > 0 ? (
          team.Player.map(player => (
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
