import { useState } from "react"
import { Link, useParams } from "react-router-dom"

import TeamStats from "./TeamStats"
import TeamFormStrip from "./TeamFormStrip"
import PlayerRow from "../player/PlayerRow"
import TeamLogo from "../common/TeamLogo"

import { calculateTeamStats } from "../../utils/calculateTeamStats"
import { calculateTeamGameLog } from "../../utils/calculateTeamGameLog"
import { sortPlayersByNumber } from "../../utils/sortPlayers"
import { getTeamColorStyle } from "../../utils/teamColorStyle"

import "./TeamCard.css"

function TeamCard({ team, matchdays, coach }) {
  const { leagueSlug } = useParams()
  const [open, setOpen] = useState(false)
  const stats = calculateTeamStats(team.name, matchdays)
  const recentForm = calculateTeamGameLog(team.name, matchdays).slice(-5)
  const sortedPlayers = sortPlayersByNumber(team.Player || [])

  return (
    <div className="team-card" style={getTeamColorStyle(team.primary_color)}>

    <header className="team-header">
      <Link to={`/${leagueSlug}/equipos/${team.id}`} className="team-info">
        <TeamLogo logoUrl={team.logo_url} name={team.name} alt={team.name} className="team-logo" />

        <div className="team-text">
          <h3 className="team-name">{team.name}</h3>
          <span className="coach">
            Coach: {coach ? (coach.name || coach.email) : "Sin asignar"}
          </span>
        </div>
      </Link>
    </header>

    <div className="team-card-body">
      <TeamStats stats={stats} />
      <TeamFormStrip games={recentForm} />

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
