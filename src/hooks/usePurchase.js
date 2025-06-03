"use client"

import { useState, useEffect, useCallback } from "react"
import { purchasesService } from "../services/purchasesService"
import toast from "react-hot-toast"

export const usePurchases = (initialFilters = {}) => {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)

  const fetchPurchases = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await purchasesService.getPurchases(finalFilters)

        if (result.success) {
          setPurchases(result.data)
        } else {
          setError(result.message)
          toast.error(result.message)
        }
      } catch (error) {
        const message = "Error al cargar compras"
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  const getPurchaseById = async (id) => {
    setLoading(true)
    try {
      const result = await purchasesService.getPurchaseById(id)

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener compra"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const createPurchase = async (purchaseData) => {
    setLoading(true)
    try {
      const result = await purchasesService.createPurchase(purchaseData)

      if (result.success) {
        toast.success("Compra creada exitosamente")
        await fetchPurchases() // Recargar la lista
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al crear compra"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const updatePurchaseStatus = async (id, statusData) => {
    setLoading(true)
    try {
      const result = await purchasesService.updatePurchaseStatus(id, statusData)

      if (result.success) {
        toast.success("Estado de compra actualizado exitosamente")
        await fetchPurchases() // Recargar la lista
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al actualizar estado de compra"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const receivePurchaseItems = async (id, receiveData) => {
    setLoading(true)
    try {
      const result = await purchasesService.receivePurchaseItems(id, receiveData)

      if (result.success) {
        toast.success("Productos recibidos exitosamente")
        await fetchPurchases() // Recargar la lista
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al recibir productos"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const cancelPurchase = async (id) => {
    setLoading(true)
    try {
      const result = await purchasesService.cancelPurchase(id)

      if (result.success) {
        toast.success("Compra cancelada exitosamente")
        await fetchPurchases() // Recargar la lista
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al cancelar compra"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const getPendingPurchases = async () => {
    setLoading(true)
    try {
      const result = await purchasesService.getPendingPurchases()

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener compras pendientes"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const getPurchasesBySupplier = async (supplierId, customFilters = {}) => {
    setLoading(true)
    try {
      const result = await purchasesService.getPurchasesBySupplier(supplierId, customFilters)

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener compras del proveedor"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Función para calcular estadísticas locales
  const getLocalStats = useCallback(() => {
    const stats = {
      total: purchases.length,
      pendientes: purchases.filter(p => p.estado === 'pendiente').length,
      recibidas: purchases.filter(p => p.estado === 'recibida').length,
      parciales: purchases.filter(p => p.estado === 'parcial').length,
      canceladas: purchases.filter(p => p.estado === 'cancelada').length,
      montoTotal: purchases.reduce((sum, p) => sum + parseFloat(p.total || 0), 0),
    }
    return stats
  }, [purchases])

  useEffect(() => {
    fetchPurchases()
  }, [fetchPurchases])

  return {
    purchases,
    loading,
    error,
    filters,
    fetchPurchases,
    getPurchaseById,
    createPurchase,
    updatePurchaseStatus,
    receivePurchaseItems,
    cancelPurchase,
    getPendingPurchases,
    getPurchasesBySupplier,
    updateFilters,
    clearFilters,
    getLocalStats,
    refetch: fetchPurchases,
  }
}

export default usePurchases