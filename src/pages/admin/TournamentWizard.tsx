import { useEffect, useState } from 'react'

import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import CategorySwitcher from '../../components/filters/CategorySwitcher'
import PlayoffBracket from '../../components/match/PlayoffBracket'
import Loader from '../../components/common/Loader'
import PageWrapper from '../../components/common/PageWrapper'

import { useLeague } from '../../context/LeagueContext'
import { useCategory } from '../../context/CategoryContext'
import { useToast } from '../../context/ToastContext'
import { useConfirm } from '../../context/ConfirmContext'

import { getTeamsByCategoryId, setTeamDivision } from '../../services/team.service'
import { getDivisionsByCategoryId, createDivision } from '../../services/division.service'
import { getBranchesWithFieldsByLeagueId } from '../../services/branch.service'
import { getMatchDaysByCategoryId, createMatchdayForCategories } from '../../services/matchday.service'
import { getMatchesByMatchDayIds, createMatches, updateMatchDetails } from '../../services/match.service'

import { PLAYOFF_STAGES } from '../../utils/matchStages'
import {
  distributeTeamsIntoGroups,
  generateGroupMatchups,
  buildRoundsCascade,
  roundLabelForDepth,
  buildCombinedBracket,
  buildCrossoverBrackets
} from '../../utils/tournamentGenerators'

import './TournamentWizard.css'

const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const GROUP_MATCHDAY_NAME = 'Fase de Grupos'
const PLAYOFF_MATCHDAY_NAME = 'Playoffs'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function groupByKey(items, key) {
  const groups: Record<string, any[]> = {}
  items.forEach(item => {
    const k = item[key]
    if (!groups[k]) groups[k] = []
    groups[k].push(item)
  })
  return groups
}

function TournamentWizard() {
  const { league, loading: leagueLoading } = useLeague()
  const { categories, category, setCategory } = useCategory()
  const toast = useToast()
  const confirm = useConfirm()

  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState([])
  const [divisions, setDivisions] = useState([])
  const [branches, setBranches] = useState([])
  const [matchdays, setMatchdays] = useState([])
  const [matches, setMatches] = useState([])
  const [busy, setBusy] = useState(false)

  // --- Paso 1: grupos ---
  const [numGroups, setNumGroups] = useState(4)

  // --- Paso 2: partidos de grupo ---
  const [matchesPerTeam, setMatchesPerTeam] = useState(3)
  const [groupDefaults, setGroupDefaults] = useState({ date: todayISO(), branchId: '', field: '', time: '09:00' })
  const [draftGroupMatches, setDraftGroupMatches] = useState(null)
  const [editingSavedMatchId, setEditingSavedMatchId] = useState(null)

  // --- Paso 3: playoffs ---
  const [autoPlayoffs, setAutoPlayoffs] = useState(true)
  const [advanceMode, setAdvanceMode] = useState('top2')
  const [playoffMode, setPlayoffMode] = useState('combined')
  const [groupPairings, setGroupPairings] = useState({})
  const [playoffDefaults, setPlayoffDefaults] = useState({ date: todayISO(), branchId: '', field: '', time: '09:00' })
  const [draftPlayoffBrackets, setDraftPlayoffBrackets] = useState(null)

  useEffect(() => {
    if (!category) {
      setTeams([]); setDivisions([]); setMatches([])
      setLoading(false)
      return
    }
    loadAll()
  }, [category?.id])

  useEffect(() => {
    if (!league?.id) return
    getBranchesWithFieldsByLeagueId(league.id)
      .then(data => {
        setBranches(data || [])
        const defaultBranchId = data?.[0]?.id || ''
        const defaultField = data?.[0]?.Field?.[0]?.id || ''
        setGroupDefaults(prev => prev.branchId ? prev : { ...prev, branchId: defaultBranchId, field: defaultField })
        setPlayoffDefaults(prev => prev.branchId ? prev : { ...prev, branchId: defaultBranchId, field: defaultField })
      })
      .catch(err => console.error(err))
  }, [league?.id])

  async function loadAll() {
    try {
      setLoading(true)
      const [teamsData, divisionsData, matchdaysData] = await Promise.all([
        getTeamsByCategoryId(category.id),
        getDivisionsByCategoryId(category.id),
        getMatchDaysByCategoryId(category.id)
      ])

      const matchdayIds = (matchdaysData || []).map(md => md.id)
      const matchesData = matchdayIds.length ? await getMatchesByMatchDayIds(matchdayIds) : []

      setTeams(teamsData || [])
      setDivisions(divisionsData || [])
      setMatchdays(matchdaysData || [])
      setMatches(matchesData || [])
    } catch (err) {
      console.error(err)
      toast.error('No se pudo cargar la información del torneo')
    } finally {
      setLoading(false)
    }
  }

  function fieldsFor(branchId) {
    if (!branchId) return []
    const branch = branches.find(b => String(b.id) === String(branchId))
    return branch?.Field || []
  }

  const activeDivisions = divisions.filter(d => d.active !== false)
  const divisionsWithTeams = activeDivisions.map(d => ({
    ...d,
    teams: teams.filter(t => t.division_id === d.id)
  }))
  const unassignedTeams = teams.filter(t => !t.division_id)
  const groupsReady = activeDivisions.length > 0 && unassignedTeams.length === 0 && teams.length > 0

  const groupMatches = matches.filter(m => m.type === 'Regular')
  const playoffMatches = matches.filter(m => PLAYOFF_STAGES.includes(m.type))
  const groupMatchesPlayed = groupMatches.filter(m => m.status === 'Terminado').length
  const allGroupMatchesDone = groupMatches.length > 0 && groupMatchesPlayed === groupMatches.length

  // Autogenera el BORRADOR del bracket (no lo guarda) en cuanto la fase de
  // grupos termina, si el admin dejó prendido el switch — así solo falta
  // revisar sede/cancha/hora y confirmar, en vez de tener que acordarse de
  // venir a darle clic a "Generar". También descarta el borrador si cambia
  // el modo/avance después de generado — si no, se quedaría viendo un
  // bracket armado con la configuración anterior sin darse cuenta.
  useEffect(() => {
    if (playoffMatches.length > 0) return
    if (autoPlayoffs && allGroupMatchesDone) {
      buildPlayoffDraft()
    } else {
      setDraftPlayoffBrackets(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayoffs, allGroupMatchesDone, playoffMatches.length, playoffMode, advanceMode, groupPairings])

  // ============== PASO 1: GRUPOS ==============

  async function handleGenerateGroups() {
    try {
      setBusy(true)
      const groupedTeams = distributeTeamsIntoGroups(teams, numGroups)
      const createdDivisions = []
      for (let i = 0; i < numGroups; i++) {
        const div = await createDivision(category.id, `Grupo ${GROUP_LETTERS[i]}`)
        createdDivisions.push(div)
      }
      await Promise.all(
        groupedTeams.flatMap((groupTeams, i) =>
          groupTeams.map(team => setTeamDivision(team.id, createdDivisions[i].id))
        )
      )
      toast.success('Grupos generados')
      await loadAll()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudieron generar los grupos')
    } finally {
      setBusy(false)
    }
  }

  async function handleMoveTeam(team, newDivisionId) {
    try {
      await setTeamDivision(team.id, newDivisionId || null)
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, division_id: newDivisionId || null } : t))
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo mover el equipo')
    }
  }

  async function handleReshuffleGroups() {
    if (groupMatches.length > 0) {
      const ok = await confirm({
        message: 'Ya hay partidos de grupo generados. Volver a repartir los equipos NO borra esos partidos, así que podrían quedar con equipos de otro grupo. ¿Quieres continuar de todos modos?',
        confirmLabel: 'Repartir de todos modos',
        danger: true
      })
      if (!ok) return
    }

    try {
      setBusy(true)
      const groupedTeams = distributeTeamsIntoGroups(teams, activeDivisions.length)
      await Promise.all(
        groupedTeams.flatMap((groupTeams, i) =>
          groupTeams.map(team => setTeamDivision(team.id, activeDivisions[i].id))
        )
      )
      toast.success('Equipos repartidos de nuevo')
      await loadAll()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo repartir de nuevo')
    } finally {
      setBusy(false)
    }
  }

  // ============== PASO 2: PARTIDOS DE GRUPO ==============

  function buildGroupDraft() {
    const draft = []
    divisionsWithTeams.forEach(d => {
      generateGroupMatchups(d.teams, matchesPerTeam).forEach(({ a, b, repeat }) => {
        draft.push({
          key: `${d.id}-${a.id}-${b.id}-${draft.length}`,
          divisionId: d.id,
          divisionName: d.name,
          teamOptions: d.teams,
          homeTeamId: a.id,
          awayTeamId: b.id,
          repeat,
          date: groupDefaults.date,
          branchId: groupDefaults.branchId,
          field: groupDefaults.field,
          time: groupDefaults.time
        })
      })
    })
    setDraftGroupMatches(draft)
  }

  function updateDraftGroupMatch(key, changes) {
    setDraftGroupMatches(prev => prev.map(m => m.key === key ? { ...m, ...changes } : m))
  }

  async function handleSaveGroupMatches() {
    if (!draftGroupMatches?.length) return

    try {
      setBusy(true)
      const matchdayRows = await createMatchdayForCategories(GROUP_MATCHDAY_NAME, groupDefaults.date, [category.id])
      const matchdayId = matchdayRows[0].id

      await createMatches(draftGroupMatches.map(m => ({
        date: m.date,
        time: m.time,
        type: 'Regular',
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        branchId: m.branchId,
        field: m.field,
        matchdayId
      })))

      toast.success(`${draftGroupMatches.length} partidos de grupo creados`)
      setDraftGroupMatches(null)
      await loadAll()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudieron guardar los partidos')
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveMatchEdit(match, changes) {
    try {
      await updateMatchDetails(match.id, {
        homeTeamId: changes.homeTeamId ?? match.local_team.id,
        awayTeamId: changes.awayTeamId ?? match.visit_team.id,
        branchId: changes.branchId ?? match.branch_id,
        field: changes.field ?? match.field_id,
        time: changes.time ?? match.hour,
        date: changes.date ?? match.date,
        type: match.type,
        matchdayId: match.matchday_id
      })
      toast.success('Partido actualizado')
      setEditingSavedMatchId(null)
      await loadAll()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudo actualizar el partido')
    }
  }

  // ============== PASO 3: PLAYOFFS ==============

  function setPairing(divisionId, targetId) {
    setGroupPairings(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(k => {
        if (next[k] === divisionId || next[k] === targetId) next[k] = null
      })
      next[divisionId] = targetId || null
      if (targetId) next[targetId] = divisionId
      return next
    })
  }

  function buildPlayoffDraft() {
    const perGroup = advanceMode === 'top1' ? 1 : 2

    if (playoffMode === 'crossover') {
      const brackets = buildCrossoverBrackets(divisionsWithTeams, groupPairings, perGroup)
      setDraftPlayoffBrackets(brackets.map(b => ({
        ...b,
        rounds: buildRoundsCascade(b.round1),
        matches: b.round1.map((pair, i) => ({
          key: `${b.divisionId}-${i}`,
          homeTeamId: pair[0].id,
          awayTeamId: pair[1].id,
          teamOptions: [pair[0], pair[1]],
          date: playoffDefaults.date,
          branchId: playoffDefaults.branchId,
          field: playoffDefaults.field,
          time: playoffDefaults.time
        }))
      })))
    } else {
      const { round1, size } = buildCombinedBracket(divisionsWithTeams, perGroup)
      const rounds = buildRoundsCascade(round1)
      setDraftPlayoffBrackets([{
        label: 'Bracket combinado',
        size,
        rounds,
        matches: round1.map((pair, i) => ({
          key: `combined-${i}`,
          homeTeamId: pair[0].id,
          awayTeamId: pair[1].id,
          teamOptions: [pair[0], pair[1]],
          date: playoffDefaults.date,
          branchId: playoffDefaults.branchId,
          field: playoffDefaults.field,
          time: playoffDefaults.time
        }))
      }])
    }
  }

  function updateDraftPlayoffMatch(bracketIndex, key, changes) {
    setDraftPlayoffBrackets(prev => prev.map((b, i) => i !== bracketIndex ? b : {
      ...b,
      matches: b.matches.map(m => m.key === key ? { ...m, ...changes } : m)
    }))
  }

  // Cada bracket (en "Cruce de grupos" puede haber varios independientes, y
  // en "Bracket combinado" solo uno) se guarda en su PROPIA jornada — así,
  // al mostrarlos, se agrupan por matchday_id en vez de mezclarse todos bajo
  // la misma etapa, que es justo lo que NO se quería en el modo cruce.
  async function handleSavePlayoffs() {
    if (!draftPlayoffBrackets?.length) return

    try {
      setBusy(true)

      for (const b of draftPlayoffBrackets) {
        const matchdayName = `${PLAYOFF_MATCHDAY_NAME} · ${b.label}`
        const matchdayRows = await createMatchdayForCategories(matchdayName, playoffDefaults.date, [category.id])
        const matchdayId = matchdayRows[0].id
        const stage = roundLabelForDepth(b.rounds.length, 0)

        await createMatches(b.matches.map(m => ({
          date: m.date,
          time: m.time,
          type: stage,
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId,
          branchId: m.branchId,
          field: m.field,
          matchdayId
        })))
      }

      toast.success('Playoffs creados')
      setDraftPlayoffBrackets(null)
      await loadAll()
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'No se pudieron guardar los playoffs')
    } finally {
      setBusy(false)
    }
  }

  const playoffMatchdayIds = [...new Set(playoffMatches.map(m => m.matchday_id))]
  const playoffBrackets = playoffMatchdayIds.map(matchdayId => {
    const mdMatches = playoffMatches.filter(m => m.matchday_id === matchdayId)
    const matchesByStage = {}
    PLAYOFF_STAGES.forEach(stage => {
      matchesByStage[stage] = mdMatches
        .filter(m => m.type === stage)
        .sort((a, b) => `${a.date} ${a.hour}`.localeCompare(`${b.date} ${b.hour}`))
    })
    const finalMatch = matchesByStage['Final']?.[0]
    const champion = finalMatch && finalMatch.status === 'Terminado'
      ? (finalMatch.local_points > finalMatch.visit_points ? finalMatch.local_team : finalMatch.visit_team)
      : null
    const matchday = matchdays.find(md => md.id === matchdayId)
    return { matchdayId, label: matchday?.name || 'Playoffs', matchesByStage, champion }
  })

  const isLoading = leagueLoading || loading

  return (
    <div className="app-layout">
      <Loader show={isLoading} label="Cargando..." />
      <PageWrapper loading={isLoading}/>
      <Header league={league}/>

      <main className="tournament-wizard-container">
        <div className="tournament-wizard-intro">
          <h2>Asistente del Torneo</h2>
          <p>Arma los grupos, genera los partidos y crea el bracket de playoffs — todo desde esta pantalla.</p>
        </div>

        <CategorySwitcher categories={categories} active={category} onChange={setCategory}/>

        {category && (
          <div className="tw-steps">
            {/* PASO 1: GRUPOS */}
            <section className={`tw-step ${!groupsReady ? 'active' : ''}`}>
              <div className="tw-step-head">
                <div className={`tw-step-num ${groupsReady ? 'done' : !groupsReady ? 'active' : ''}`}>{groupsReady ? '✓' : '1'}</div>
                <div className="tw-step-title-wrap">
                  <div className="tw-step-title">Grupos</div>
                  <div className="tw-step-sub">Reparte los equipos inscritos en grupos automáticamente</div>
                </div>
              </div>
              <div className="tw-step-body">
                {activeDivisions.length === 0 ? (
                  <div className="tw-field-row">
                    <span className="tw-field-label">Número de grupos</span>
                    <div className="tw-stepper">
                      <button type="button" onClick={() => setNumGroups(n => Math.max(2, n - 1))}>−</button>
                      <span>{numGroups}</span>
                      <button type="button" onClick={() => setNumGroups(n => Math.min(6, n + 1))}>+</button>
                    </div>
                    <span className="tw-hint">({teams.length} equipos inscritos)</span>
                    <button className="tw-btn tw-btn-primary" disabled={busy || teams.length === 0} onClick={handleGenerateGroups} style={{ marginLeft: 'auto' }}>
                      Generar grupos automáticamente
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="tw-groups-grid">
                      {divisionsWithTeams.map(d => (
                        <div key={d.id} className="tw-group-card">
                          <h4>{d.name}</h4>
                          {d.teams.map(t => (
                            <div key={t.id} className="tw-group-team-row">
                              <span>{t.name}</span>
                              <select value="" onChange={e => e.target.value && handleMoveTeam(t, Number(e.target.value))}>
                                <option value="">mover a…</option>
                                {activeDivisions.filter(od => od.id !== d.id).map(od => (
                                  <option key={od.id} value={od.id}>{od.name}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      ))}
                      {unassignedTeams.length > 0 && (
                        <div className="tw-group-card tw-group-card-unassigned">
                          <h4>Sin grupo</h4>
                          {unassignedTeams.map(t => (
                            <div key={t.id} className="tw-group-team-row">
                              <span>{t.name}</span>
                              <select value="" onChange={e => e.target.value && handleMoveTeam(t, Number(e.target.value))}>
                                <option value="">mover a…</option>
                                {activeDivisions.map(od => (
                                  <option key={od.id} value={od.id}>{od.name}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="tw-actions">
                      <button className="tw-btn tw-btn-ghost" disabled={busy} onClick={handleReshuffleGroups}>🔀 Volver a repartir</button>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* PASO 2: PARTIDOS DE GRUPO */}
            <section className={`tw-step ${!groupsReady ? 'locked' : ''} ${groupsReady && !allGroupMatchesDone ? 'active' : ''}`}>
              <div className="tw-step-head">
                <div className={`tw-step-num ${allGroupMatchesDone ? 'done' : groupsReady ? 'active' : ''}`}>{allGroupMatchesDone ? '✓' : '2'}</div>
                <div className="tw-step-title-wrap">
                  <div className="tw-step-title">Partidos de grupo</div>
                  <div className="tw-step-sub">Todos contra todos, dentro de cada grupo</div>
                </div>
                {groupMatches.length > 0 && <div className="tw-step-status">{groupMatchesPlayed}/{groupMatches.length} jugados</div>}
              </div>
              <div className="tw-step-body">
                {!groupsReady ? (
                  <div className="tw-locked-note">🔒 Asigna todos los equipos a un grupo primero</div>
                ) : groupMatches.length > 0 ? (
                  <div className="tw-match-groups">
                    {divisionsWithTeams.map(d => {
                      const ms = groupMatches.filter(m => m.local_team?.division_id === d.id || m.visit_team?.division_id === d.id)
                      if (ms.length === 0) return null
                      return (
                        <div key={d.id} className="tw-match-group-col">
                          <h4>{d.name}</h4>
                          {ms.map(m => (
                            <MatchRow
                              key={m.id}
                              match={m}
                              teamOptions={d.teams}
                              branches={branches}
                              fieldsFor={fieldsFor}
                              editing={editingSavedMatchId === m.id}
                              onEdit={() => setEditingSavedMatchId(m.id)}
                              onCancel={() => setEditingSavedMatchId(null)}
                              onSave={changes => handleSaveMatchEdit(m, changes)}
                            />
                          ))}
                        </div>
                      )
                    })}
                  </div>
                ) : draftGroupMatches ? (
                  <>
                    <div className="tw-match-groups">
                      {Object.entries(groupByKey(draftGroupMatches, 'divisionName')).map(([dname, ms]) => (
                        <div key={dname} className="tw-match-group-col">
                          <h4>{dname}</h4>
                          {ms.map(m => (
                            <DraftMatchRow
                              key={m.key}
                              match={m}
                              branches={branches}
                              fieldsFor={fieldsFor}
                              onChange={changes => updateDraftGroupMatch(m.key, changes)}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="tw-actions">
                      <button className="tw-btn tw-btn-ghost" onClick={buildGroupDraft}>🔀 Regenerar emparejamientos</button>
                      <button className="tw-btn tw-btn-primary" disabled={busy} onClick={handleSaveGroupMatches}>
                        Guardar {draftGroupMatches.length} partidos
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="tw-field-row">
                      <span className="tw-field-label">Partidos por equipo</span>
                      <div className="tw-stepper">
                        <button type="button" onClick={() => setMatchesPerTeam(n => Math.max(1, n - 1))}>−</button>
                        <span>{matchesPerTeam}</span>
                        <button type="button" onClick={() => setMatchesPerTeam(n => Math.min(8, n + 1))}>+</button>
                      </div>
                    </div>
                    <ScheduleDefaults defaults={groupDefaults} branches={branches} fieldsFor={fieldsFor} onChange={setGroupDefaults} />
                    <div className="tw-actions">
                      <button className="tw-btn tw-btn-primary" onClick={buildGroupDraft}>Generar partidos de grupo</button>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* PASO 3: PLAYOFFS */}
            <section className={`tw-step ${groupMatches.length === 0 ? 'locked' : ''} ${allGroupMatchesDone && playoffMatches.length === 0 ? 'active' : ''}`}>
              <div className="tw-step-head">
                <div className={`tw-step-num ${playoffMatches.length > 0 ? 'done' : allGroupMatchesDone ? 'active' : ''}`}>{playoffMatches.length > 0 ? '✓' : '3'}</div>
                <div className="tw-step-title-wrap">
                  <div className="tw-step-title">Playoffs</div>
                  <div className="tw-step-sub">Siembra el bracket con los mejores de cada grupo</div>
                </div>
              </div>
              <div className="tw-step-body">
                {groupMatches.length === 0 ? (
                  <div className="tw-locked-note">🔒 Genera los partidos de grupo primero</div>
                ) : playoffMatches.length > 0 ? (
                  <>
                    <p className="tw-summary">Ronda 1 ya creada. Cuando sepas los resultados, crea la siguiente ronda desde "Agregar Partidos" (elige la jornada del bracket correspondiente) — cada bracket se actualiza solo conforme vayas registrando resultados.</p>
                    {playoffBrackets.map(b => (
                      <div key={b.matchdayId} className="tw-bracket-block">
                        <h4 className="tw-bracket-block-title">🏆 {b.label}</h4>
                        {b.champion && (
                          <div className="tw-success-banner">🏆 Campeón: {b.champion.name}</div>
                        )}
                        <PlayoffBracket matchesByStage={b.matchesByStage} championId={b.champion?.id} />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="tw-switch-row">
                      <label className="tw-switch">
                        <input type="checkbox" checked={autoPlayoffs} onChange={e => setAutoPlayoffs(e.target.checked)} />
                        <span className="tw-track"></span><span className="tw-thumb"></span>
                      </label>
                      <div>
                        <div className="tw-switch-label">Armar el borrador automáticamente al terminar la fase de grupos</div>
                        <div className="tw-hint">Igual tienes que revisar sede/cancha/hora y guardar — esto solo te ahorra el paso de generarlo tú</div>
                      </div>
                    </div>

                    <div className="tw-field-row">
                      <span className="tw-field-label">Equipos que avanzan</span>
                      <select value={advanceMode} onChange={e => setAdvanceMode(e.target.value)}>
                        <option value="top2">Top 2 por grupo</option>
                        <option value="top1">Top 1 por grupo</option>
                      </select>
                    </div>

                    <div className="tw-field-row" style={{ marginTop: 10 }}>
                      <span className="tw-field-label">Cómo armar los playoffs</span>
                    </div>
                    <div className="tw-mode-toggle">
                      <button type="button" className={playoffMode === 'combined' ? 'active' : ''} onClick={() => setPlayoffMode('combined')}>Bracket combinado</button>
                      <button type="button" className={playoffMode === 'crossover' ? 'active' : ''} onClick={() => setPlayoffMode('crossover')}>Cruce de grupos</button>
                    </div>

                    {playoffMode === 'crossover' && (
                      <div className="tw-pairing-list">
                        {activeDivisions.map(d => (
                          <div key={d.id} className="tw-pairing-row">
                            <span className="tw-pairing-name">{d.name}</span>
                            <span className="tw-hint">se enfrenta con</span>
                            <select value={groupPairings[d.id] || ''} onChange={e => setPairing(d.id, e.target.value ? Number(e.target.value) : null)}>
                              <option value="">— su propia final —</option>
                              {activeDivisions.filter(od => od.id !== d.id).map(od => (
                                <option key={od.id} value={od.id}>{od.name}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="tw-progress-row">
                      <div className="tw-progress-track"><div className="tw-progress-fill" style={{ width: `${groupMatches.length ? (groupMatchesPlayed / groupMatches.length * 100) : 0}%` }} /></div>
                      <span className="tw-hint">{groupMatchesPlayed}/{groupMatches.length} partidos de grupo jugados</span>
                    </div>

                    {draftPlayoffBrackets ? (
                      <>
                        <div className="tw-brackets-list">
                          {draftPlayoffBrackets.map((b, bi) => (
                            <div key={bi} className="tw-mini-bracket-card">
                              <h4>🏆 {b.label}</h4>
                              {b.matches.map(m => (
                                <DraftMatchRow key={m.key} match={m} branches={branches} fieldsFor={fieldsFor} onChange={changes => updateDraftPlayoffMatch(bi, m.key, changes)} />
                              ))}
                            </div>
                          ))}
                        </div>
                        <div className="tw-actions">
                          <button className="tw-btn tw-btn-ghost" onClick={buildPlayoffDraft}>🔀 Regenerar</button>
                          <button className="tw-btn tw-btn-primary" disabled={busy} onClick={handleSavePlayoffs}>Guardar playoffs</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <ScheduleDefaults defaults={playoffDefaults} branches={branches} fieldsFor={fieldsFor} onChange={setPlayoffDefaults} />
                        <div className="tw-actions">
                          <button className="tw-btn tw-btn-primary" onClick={buildPlayoffDraft}>
                            {allGroupMatchesDone ? 'Generar playoffs ahora' : 'Generar playoffs ahora (aún faltan partidos de grupo)'}
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function ScheduleDefaults({ defaults, branches, fieldsFor, onChange }) {
  return (
    <div className="tw-schedule-defaults">
      <div className="tw-field-group">
        <label>Fecha</label>
        <input type="date" value={defaults.date} onChange={e => onChange({ ...defaults, date: e.target.value })} />
      </div>
      <div className="tw-field-group">
        <label>Sede</label>
        <select value={defaults.branchId} onChange={e => onChange({ ...defaults, branchId: e.target.value, field: fieldsFor(e.target.value)[0]?.id || '' })}>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div className="tw-field-group">
        <label>Cancha</label>
        <select value={defaults.field} onChange={e => onChange({ ...defaults, field: e.target.value })}>
          {fieldsFor(defaults.branchId).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      <div className="tw-field-group">
        <label>Hora</label>
        <input type="time" value={defaults.time} onChange={e => onChange({ ...defaults, time: e.target.value })} />
      </div>
    </div>
  )
}

function DraftMatchRow({ match, branches, fieldsFor, onChange }) {
  return (
    <div className={`tw-match-row ${match.repeat ? 'repeat' : ''}`}>
      {match.repeat && <span className="tw-repeat-tag">Repetido</span>}
      <select value={match.homeTeamId} onChange={e => onChange({ homeTeamId: Number(e.target.value) })}>
        {match.teamOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <span className="tw-vs">vs</span>
      <select value={match.awayTeamId} onChange={e => onChange({ awayTeamId: Number(e.target.value) })}>
        {match.teamOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <input type="date" value={match.date} onChange={e => onChange({ date: e.target.value })} />
      <select value={match.branchId} onChange={e => onChange({ branchId: e.target.value, field: fieldsFor(e.target.value)[0]?.id || '' })}>
        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      <select value={match.field} onChange={e => onChange({ field: e.target.value })}>
        {fieldsFor(match.branchId).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      <input type="time" value={match.time} onChange={e => onChange({ time: e.target.value })} />
    </div>
  )
}

function MatchRow({ match, teamOptions, branches, fieldsFor, editing, onEdit, onCancel, onSave }) {
  const [draft, setDraft] = useState(null)

  if (!editing) {
    return (
      <div className="tw-match-row">
        <span>{match.local_team?.name}</span>
        <span className="tw-vs">vs</span>
        <span>{match.visit_team?.name}</span>
        <span className="tw-match-meta">{match.date} · {match.hour?.slice(0, 5)} · {match.branch?.name} · {match.field?.name}</span>
        <span className={`tw-match-status ${match.status === 'Terminado' ? 'done' : ''}`}>
          {match.status === 'Terminado' ? `${match.local_points}-${match.visit_points}` : match.status}
        </span>
        {match.status !== 'Terminado' && <button className="tw-edit-btn" onClick={onEdit}>✎</button>}
      </div>
    )
  }

  const current = draft || {
    homeTeamId: match.local_team.id,
    awayTeamId: match.visit_team.id,
    date: match.date,
    branchId: match.branch_id,
    field: match.field_id,
    time: match.hour
  }

  return (
    <div className="tw-match-row editing">
      <select value={current.homeTeamId} onChange={e => setDraft({ ...current, homeTeamId: Number(e.target.value) })}>
        {teamOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <span className="tw-vs">vs</span>
      <select value={current.awayTeamId} onChange={e => setDraft({ ...current, awayTeamId: Number(e.target.value) })}>
        {teamOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      <input type="date" value={current.date} onChange={e => setDraft({ ...current, date: e.target.value })} />
      <select value={current.branchId} onChange={e => setDraft({ ...current, branchId: e.target.value, field: fieldsFor(e.target.value)[0]?.id || '' })}>
        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      <select value={current.field} onChange={e => setDraft({ ...current, field: e.target.value })}>
        {fieldsFor(current.branchId).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      <input type="time" value={current.time} onChange={e => setDraft({ ...current, time: e.target.value })} />
      <button className="tw-mini-btn save" onClick={() => onSave(current)}>✓</button>
      <button className="tw-mini-btn cancel" onClick={onCancel}>✕</button>
    </div>
  )
}

export default TournamentWizard
