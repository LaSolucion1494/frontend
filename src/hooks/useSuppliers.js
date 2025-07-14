"use client"

import { useState, useEffect, useCallback } from "react"
import { suppliersService } from "../services/suppliersService"
import toast from "react-hot-toast"

export const useSuppliers = (initialFilters = {}) => {
  const [suppliers, setSuppliers] = useState([])
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

  const fetchSuppliers = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)
      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await suppliersService.getSuppliers(finalFilters)

        if (result.success) {
          setSuppliers(result.data)
          if (result.pagination) {
            setPagination(result.pagination)
          }
        } else {
          setError(result.message)
          toast.error(result.message)
        }
      } catch (error) {
        const message = "Error al cargar proveedores"
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
    fetchSuppliers()
  }, [filters, fetchSuppliers])

  const createSupplier = async (supplierData) => {
    setLoading(true)
    try {
      const result = await suppliersService.createSupplier(supplierData)
      if (result.success) {
        toast.success("Proveedor creado exitosamente")
        await fetchSuppliers({ offset: 0 }) // Volver a la primera página
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al crear proveedor"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const updateSupplier = async (id, supplierData) => {
    setLoading(true)
    try {
      const result = await suppliersService.updateSupplier(id, supplierData)
      if (result.success) {
        toast.success("Proveedor actualizado exitosamente")
        await fetchSuppliers()
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al actualizar proveedor"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const deleteSupplier = async (id) => {
    setLoading(true)
    try {
      const result = await suppliersService.deleteSupplier(id)
      if (result.success) {
        toast.success("Proveedor eliminado exitosamente")
        await fetchSuppliers({ offset: 0 }) // Volver a la primera página
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al eliminar proveedor"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  return {
    suppliers,
    loading,
    error,
    pagination,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    updateFilters,
    handlePageChange,
    refetch: fetchSuppliers,
  }
}

export default useSuppliers
