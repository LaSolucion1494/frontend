"use client"

import { useState, useCallback } from "react"
import { stockMovementsService } from "../services/stockMovementsService"
import toast from "react-hot-toast"

export const useStockMovements = () => {
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMovements = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const result = await stockMovementsService.getStockMovements(filters)

      if (result.success) {
        setMovements(result.data)
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (error) {
      const message = "Error al cargar movimientos"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createStockMovement = async (movementData) => {
    setLoading(true)
    try {
      const result = await stockMovementsService.createStockMovement(movementData)

      if (result.success) {
        toast.success("Movimiento de stock creado exitosamente")
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al crear movimiento de stock"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const fetchProductMovements = useCallback(async (productId, limit = 20) => {
    setLoading(true)
    setError(null)

    try {
      const result = await stockMovementsService.getProductMovements(productId, limit)

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        setError(result.message)
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al cargar movimientos del producto"
      setError(message)
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    movements,
    loading,
    error,
    fetchMovements,
    createStockMovement,
    fetchProductMovements,
    refetch: fetchMovements,
  }
}

export default useStockMovements
