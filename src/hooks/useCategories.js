"use client"

import { useState, useEffect, useCallback } from "react"
import { categoriesService } from "../services/categoriesService"
import toast from "react-hot-toast"

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await categoriesService.getCategories()

      if (result.success) {
        setCategories(result.data)
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (error) {
      const message = "Error al cargar categorías"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createCategory = async (categoryData) => {
    setLoading(true)
    try {
      const result = await categoriesService.createCategory(categoryData)

      if (result.success) {
        toast.success("Categoría creada exitosamente")
        await fetchCategories()
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al crear categoría"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const updateCategory = async (id, categoryData) => {
    setLoading(true)
    try {
      const result = await categoriesService.updateCategory(id, categoryData)

      if (result.success) {
        toast.success("Categoría actualizada exitosamente")
        await fetchCategories()
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al actualizar categoría"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id) => {
    setLoading(true)
    try {
      const result = await categoriesService.deleteCategory(id)

      if (result.success) {
        toast.success("Categoría eliminada exitosamente")
        await fetchCategories()
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al eliminar categoría"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  }
}

export default useCategories
