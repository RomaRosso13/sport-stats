import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import Loader from '../components/common/Loader'
import PageWrapper from '../components/common/PageWrapper'
import TeamLogo from '../components/common/TeamLogo'

import { useLeague } from '../context/LeagueContext'

import { getPlayerById } from '../services/player.service.js'
import { getIndividualStatsByCategory } from '../services/individual_stats.service'
import { classifyTopPlayersByStats } from '../utils/classifyTopPlayersByStats'
import { STAT_KEYS, getStatLabels } from '../constants/statFields'

import './PlayerProfile.css'

function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || "?"
}

function PlayerProfile() {
  const { league } = useLeague()
  const { playerId } = useParams()
  const statLabels = getStatLabels(league)
  const STAT_SECTIONS = STAT_KEYS.map(key => ({ key, label: statLabels[key] }))

  const [player, setPlayer] = useState(null)
  const [stats, setStats] = useState(null)
  const [ranks, setRanks] = useState({})
  const [imageFailed, setImageFailed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!playerId) return

    async function loadProfile() {
      try {
        setLoading(true)

        const playerData = await getPlayerById(playerId)
        setPlayer(playerData)

        const categoryId = playerData.team?.category_id

        if (categoryId) {
          const categoryStats = await getIndividualStatsByCategory(categoryId)

          // IndividualStats has one row per player per match, so totals/ranks
          // must be aggregated across every row for that player first.
          const leaderboards = classifyTopPlayersByStats(categoryStats, STAT_KEYS, Infinity)

          const ownStats = {}
          const rankInfo = {}

          STAT_KEYS.forEach(key => {
            const ranked = leaderboards[key] || []
            const position = ranked.findIndex(
              row => String(row.id) === String(playerId)
            )

            ownStats[key] = position >= 0 ? ranked[position][key] : 0
            rankInfo[key] = position >= 0
              ? { rank: position + 1, total: ranked.length }
              : null
          })

          setStats(ownStats)
          setRanks(rankInfo)
        } else {
          setStats({ touchdown: 0, touchdown_pass: 0, interceptions: 0, sacks: 0 })
          setRanks({})
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [playerId])

  const team = player?.team

  return (
    <div className="app-layout">
      <Loader show={loading} label="Cargando..." />
      <PageWrapper loading={loading}/>
      <Header league={league}/>

      {player && (
        <main className="player-profile-container">
          {team && (
            <Link to={`/${league.slug}/equipos/${team.id}`} className="player-profile-back">
              ← {team.name}
            </Link>
          )}

          <div className="player-profile-header">
            {player.image_url && !imageFailed ? (
              <img
                src={player.image_url}
                alt={player.name}
                className="player-profile-photo"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="player-profile-avatar">{getInitial(player.name)}</div>
            )}

            <div className="player-profile-info">
              <div className="player-profile-tags">
                {team?.category?.type && (
                  <span className="player-profile-tag">{team.category.type}</span>
                )}
                {player.position && (
                  <span className="player-profile-tag position">{player.position}</span>
                )}
                {!player.active && (
                  <span className="player-profile-tag inactive">Inactivo</span>
                )}
              </div>

              <h2>
                {player.number != null && (
                  <span className="player-profile-number">#{player.number}</span>
                )}
                {player.name}
              </h2>

              {team && (
                <Link to={`/${league.slug}/equipos/${team.id}`} className="player-profile-team">
                  <TeamLogo logoUrl={team.logo_url} name={team.name} alt={team.name} className="player-profile-team-logo" />
                  {team.name}
                </Link>
              )}
            </div>
          </div>

          <section className="profile-card">
            <h3 className="profile-card-title">Estadísticas de la temporada</h3>

            {stats && (
              <div className="player-stats-grid">
                {STAT_SECTIONS.map(({ key, label }) => (
                  <div key={key} className="player-stat-tile">
                    <span className="player-stat-value">{stats[key]}</span>
                    <span className="player-stat-label">{label}</span>
                    {ranks[key] && (
                      <span className="player-stat-rank">
                        #{ranks[key].rank} de {ranks[key].total}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      <Footer />
    </div>
  )
}

export default PlayerProfile
