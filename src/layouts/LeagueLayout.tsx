import { Outlet } from "react-router-dom"
import { LeagueProvider } from "../context/LeagueContext"
import { SeasonProvider } from "../context/SeasonContext"
import { CategoryProvider } from "../context/CategoryContext"

export default function LeagueLayout() {
  return (
    <LeagueProvider>
      <SeasonProvider>
        <CategoryProvider>
          <Outlet />
        </CategoryProvider>
      </SeasonProvider>
    </LeagueProvider>
  )
}
