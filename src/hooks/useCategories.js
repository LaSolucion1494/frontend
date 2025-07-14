"use client"

import { useState, useEffect, useCallback } from "react"
import { categoriesService } from "../services/categoriesService"
import toast from "react-hot-toast"

export const useCategories = (initialFilters = {}) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    limit: 10,
    offset: 0,
    ...initialFilters,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })

  const fetchCategories = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)
      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await categoriesService.getCategories(finalFilters)

        if (result.success) {
          setCategories(result.data)
          if (result.pagination) {
            setPagination(result.pagination)
          }
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
    },
    [filters],
  )

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const handlePageChange = useCallback(
    (page) => {
      const newOffset = (page - 1) * filters.limit
      updateFilters({ offset: newOffset })
    },
    [filters.limit, updateFilters],
  )

  useEffect(() => {
    fetchCategories()
  }, [filters, fetchCategories])

  const createCategory = async (categoryData) => {
    setLoading(true)
    try {
      const result = await categoriesService.createCategory(categoryData)
      if (result.success) {
        toast.success("Categoría creada exitosamente")
        await fetchCategories({ offset: 0 })
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
        await fetchCategories({ offset: 0 })
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

  return {
    categories,
    loading,
    error,
    pagination,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    updateFilters,
    handlePageChange,
    refetch: fetchCategories,
  }
}

export default useCategories
