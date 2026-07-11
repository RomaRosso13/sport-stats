import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import LeagueLayout from "./layouts/LeagueLayout"
import Home from "./pages/Home"
import Calendar from "./pages/Calendar"
import Results from "./pages/Results"
import Standings from "./pages/Standings"
import PlayerStats from "./pages/PlayerStats"
import Teams from "./pages/Teams"
import TeamProfile from "./pages/TeamProfile"
import ProtectedRoute from "./guards/ProtectedRoute"
import MatchDayEditor from './pages/admin/MatchdayEditor'
import MatchDayCreator from "./pages/admin/MatchdayCreator"
import SeasonAdministrator from "./pages/admin/SeasonAdministrator"
import TeamManager from "./pages/admin/TeamManager"
import AdminDashboard from "./pages/admin/AdminDashboard"

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/:leagueSlug" element={<LeagueLayout />}>
          <Route index element={<Home />} />
          <Route path="calendario" element={<Calendar />} />
          <Route path="results" element={<Results />} />
          <Route path="tabla" element={<Standings />} />
          <Route path="estadisticas" element={<PlayerStats />} />
          <Route path="equipos" element={<Teams />} />
          <Route path="equipos/:teamId" element={<TeamProfile />} />
          <Route path="/:leagueSlug/admin" element={ <ProtectedRoute> <AdminDashboard /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/gestor" element={ <ProtectedRoute> <SeasonAdministrator /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/editar" element={ <ProtectedRoute> <MatchDayEditor /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/crear" element={ <ProtectedRoute> <MatchDayCreator /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/equipos" element={ <ProtectedRoute> <TeamManager /> </ProtectedRoute> }/>
        </Route>

        <Route path="*" element={<p>Liga no encontrada</p>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
