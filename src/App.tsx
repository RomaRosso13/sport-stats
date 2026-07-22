import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import LeagueLayout from "./layouts/LeagueLayout"
import Landing from "./pages/Landing"
import Home from "./pages/Home"
import Calendar from "./pages/Calendar"
import Results from "./pages/Results"
import Standings from "./pages/Standings"
import Playoffs from "./pages/Playoffs"
import PlayerStats from "./pages/PlayerStats"
import Reglamento from "./pages/Reglamento"
import Teams from "./pages/Teams"
import TeamProfile from "./pages/TeamProfile"
import PlayerProfile from "./pages/PlayerProfile"
import MatchDetail from "./pages/MatchDetail"
import ProtectedRoute from "./guards/ProtectedRoute"
import MatchDayEditor from './pages/admin/MatchdayEditor'
import MatchDayCreator from "./pages/admin/MatchdayCreator"
import SeasonAdministrator from "./pages/admin/SeasonAdministrator"
import TeamManager from "./pages/admin/TeamManager"
import VenueManager from "./pages/admin/VenueManager"
import UserManager from "./pages/admin/UserManager"
import AdminDashboard from "./pages/admin/AdminDashboard"
import PhotoManager from "./pages/admin/PhotoManager"
import ConfigManager from "./pages/admin/ConfigManager"
import CoachTeamManager from "./pages/admin/CoachTeamManager"

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/:leagueSlug" element={<LeagueLayout />}>
          <Route index element={<Home />} />
          <Route path="calendario" element={<Calendar />} />
          <Route path="results" element={<Results />} />
          <Route path="partido/:matchId" element={<MatchDetail />} />
          <Route path="tabla" element={<Standings />} />
          <Route path="playoffs" element={<Playoffs />} />
          <Route path="estadisticas" element={<PlayerStats />} />
          <Route path="reglamento" element={<Reglamento />} />
          <Route path="equipos" element={<Teams />} />
          <Route path="equipos/:teamId" element={<TeamProfile />} />
          <Route path="jugadores/:playerId" element={<PlayerProfile />} />
          <Route path="/:leagueSlug/admin" element={ <ProtectedRoute> <AdminDashboard /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/gestor" element={ <ProtectedRoute> <SeasonAdministrator /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/editar" element={ <ProtectedRoute allowReferee> <MatchDayEditor /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/crear" element={ <ProtectedRoute> <MatchDayCreator /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/equipos" element={ <ProtectedRoute> <TeamManager /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/sedes" element={ <ProtectedRoute> <VenueManager /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/usuarios" element={ <ProtectedRoute> <UserManager /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/fotos" element={ <ProtectedRoute allowPhotographer> <PhotoManager /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/configuracion" element={ <ProtectedRoute> <ConfigManager /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/mi-equipo" element={ <ProtectedRoute allowCoach> <CoachTeamManager /> </ProtectedRoute> }/>
        </Route>

        <Route path="*" element={<p>Liga no encontrada</p>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
