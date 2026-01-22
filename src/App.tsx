import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import Standings from './pages/Standings'
import Results from './pages/Results'
import Teams from './pages/Teams'
import { SeasonProvider } from './context/SeasonContext'
import { LeagueProvider } from './context/LeagueContext'
import { CategoryProvider } from './context/CategoryContext' 

function App() {
  return (
    <Routes>
      <Route
        path="/:leagueSlug"
        element={
          <LeagueProvider>
            <SeasonProvider>
              <CategoryProvider>
                <Home />
              </CategoryProvider>
            </SeasonProvider>
          </LeagueProvider>
        }
      />

      <Route
        path="/:leagueSlug/calendario"
        element={
          <LeagueProvider>
            <SeasonProvider>
              <CategoryProvider>
                <Calendar />
              </CategoryProvider>
            </SeasonProvider>
          </LeagueProvider>
        }
      />

      <Route
        path="/:leagueSlug/results"
        element={
          <LeagueProvider>
            <SeasonProvider>
              <CategoryProvider>
                <Results />
              </CategoryProvider>
            </SeasonProvider>
          </LeagueProvider>
        }
      />

      <Route
        path="/:leagueSlug/tabla"
        element={
          <LeagueProvider>
            <SeasonProvider>
              <CategoryProvider>
                <Standings />
              </CategoryProvider>
            </SeasonProvider>
          </LeagueProvider>
        }
      />

      <Route
        path="/:leagueSlug/equipos"
        element={
          <LeagueProvider>
            <SeasonProvider>
              <CategoryProvider>
                <Teams />
              </CategoryProvider>
            </SeasonProvider>
          </LeagueProvider>
        }
      />

      <Route path="*" element={<p>Liga no encontrada</p>} />
    </Routes>
  )
}

export default App
