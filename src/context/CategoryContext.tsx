import { createContext, useContext, useEffect, useState } from "react"
import { useSeason } from "./SeasonContext"
import { getCategoriesBySeasonId } from "../services/category.service"

const CategoryContext = createContext(null)

export function CategoryProvider({ children }) {
  const { season } = useSeason()

  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!season) {
      setCategories([])
      setCategory(null)
      return
    }

    async function loadCategories() {
      try {
        setLoading(true)

        const data = await getCategoriesBySeasonId(season.id)
        setCategories(data)

        if (data.length > 0) {
          const defaultCategory =
            data.find(c => c.type === "mixto") || data[0]

          setCategory(defaultCategory)
        } else {
          setCategory(null)
        }

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [season?.id])

  return (
    <CategoryContext.Provider
      value={{ categories, category, setCategory, loading }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategory() {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error("useCategory debe usarse dentro de CategoryProvider")
  }
  return context
}
