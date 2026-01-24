import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import LeagueLayout from "./layouts/LeagueLayout"
import Home from "./pages/Home"
import Calendar from "./pages/Calendar"
import Results from "./pages/Results"
import Standings from "./pages/Standings"
import Teams from "./pages/Teams"
import ProtectedRoute from "./guards/ProtectedRoute"
import MatchDayEditor from './pages/admin/MatchdayEditor'
import MatchDayCreator from "./pages/admin/MatchdayCreator"

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/:leagueSlug" element={<LeagueLayout />}>
          <Route index element={<Home />} />
          <Route path="calendario" element={<Calendar />} />
          <Route path="results" element={<Results />} />
          <Route path="tabla" element={<Standings />} />
          <Route path="equipos" element={<Teams />} />
          <Route path="/:leagueSlug/admin/editar" element={ <ProtectedRoute> <MatchDayEditor /> </ProtectedRoute> }/>
          <Route path="/:leagueSlug/admin/crear" element={ <ProtectedRoute> <MatchDayCreator /> </ProtectedRoute> }/>
        </Route>

        <Route path="*" element={<p>Liga no encontrada</p>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
