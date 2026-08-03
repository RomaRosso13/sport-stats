import './PlayerRadarChart.css'

const WIDTH = 340
const HEIGHT = 300
const CENTER_X = WIDTH / 2
const CENTER_Y = HEIGHT / 2 + 6
const MAX_RADIUS = 88
const LABEL_RADIUS = MAX_RADIUS + 34
const RINGS = [0.25, 0.5, 0.75, 1]

function getPoint(radius, angleDeg) {
  const rad = (Math.PI / 180) * angleDeg
  return {
    x: CENTER_X + radius * Math.sin(rad),
    y: CENTER_Y - radius * Math.cos(rad)
  }
}

function getLabelAnchor(x) {
  if (x > CENTER_X + 4) return 'start'
  if (x < CENTER_X - 4) return 'end'
  return 'middle'
}

function toPointsString(points) {
  return points.map(p => `${p.x},${p.y}`).join(' ')
}

// Perfil del jugador tipo "radar" (FIFA/NFL): cada eje es una categoría de
// stat, la distancia del centro representa qué tan cerca está del máximo de
// la liga en esa categoría (no del total absoluto, para que el polígono sea
// comparable entre jugadores con volúmenes de juego distintos).
function PlayerRadarChart({ values = {}, maxes = {}, statKeys = [], statLabels = {} }) {
  if (statKeys.length < 3) return null

  const step = 360 / statKeys.length
  const hasData = statKeys.some(key => (values[key] || 0) > 0)

  const dataPoints = statKeys.map((key, index) => {
    const ratio = Math.min(1, (values[key] || 0) / (maxes[key] || 1))
    return getPoint(MAX_RADIUS * ratio, index * step)
  })

  return (
    <div className="player-radar-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="player-radar-svg">
        {RINGS.map(ring => (
          <polygon
            key={ring}
            points={toPointsString(statKeys.map((_, index) => getPoint(MAX_RADIUS * ring, index * step)))}
            className={`player-radar-ring ${ring === 1 ? 'outer' : ''}`}
          />
        ))}

        {statKeys.map((key, index) => {
          const { x, y } = getPoint(MAX_RADIUS, index * step)
          return <line key={key} x1={CENTER_X} y1={CENTER_Y} x2={x} y2={y} className="player-radar-axis" />
        })}

        {hasData && (
          <polygon points={toPointsString(dataPoints)} className="player-radar-shape" />
        )}

        {hasData && dataPoints.map((point, index) => {
          const key = statKeys[index]
          if (!(values[key] > 0)) return null

          return (
            <g key={key}>
              <circle cx={point.x} cy={point.y} r={4} className="player-radar-dot" />
              <text x={point.x} y={point.y - 10} textAnchor="middle" className="player-radar-value">
                {values[key]}
              </text>
            </g>
          )
        })}

        {statKeys.map((key, index) => {
          const { x, y } = getPoint(LABEL_RADIUS, index * step)
          return (
            <text
              key={key}
              x={x}
              y={y}
              textAnchor={getLabelAnchor(x)}
              dominantBaseline="middle"
              className="player-radar-label"
            >
              {statLabels[key]}
            </text>
          )
        })}
      </svg>

      {!hasData && <p className="player-radar-empty">Aún no hay estadísticas para graficar</p>}
    </div>
  )
}

export default PlayerRadarChart
