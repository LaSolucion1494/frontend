"use client"

import { useState, useEffect, useCallback } from "react"
import { configService } from "../services/configService"
import toast from "react-hot-toast"

export const useConfig = () => {
  const [config, setConfig] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchConfig = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await configService.getConfig()
      if (result.success) {
        setConfig(result.data)
      } else {
        setError(result.message)
        console.warn("Usando configuración por defecto:", result.message)
      }
    } catch (error) {
      const message = "Error al cargar configuración"
      setError(message)
      console.warn("Usando configuración por defecto:", message)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateConfig = async (newConfig, recalculatePrices = false) => {
    setLoading(true)
    try {
      const configs = Object.entries(newConfig).map(([clave, valor]) => ({
        clave,
        valor: valor.toString(),
      }))

      const result = await configService.updateConfig(configs, recalculatePrices)

      if (result.success) {
        const { message, updatedProductsCount, recalculated } = result.data

        // Mostrar mensaje apropiado según si se recalcularon precios o no
        if (recalculated && updatedProductsCount > 0) {
          toast.success(`Configuración actualizada y ${updatedProductsCount} productos recalculados`)
        } else {
          toast.success(message || "Configuración actualizada correctamente")
        }

        await fetchConfig()
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al actualizar configuración"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const recalculateAllPrices = async () => {
    setLoading(true)
    try {
      const result = await configService.recalculateAllPrices()
      if (result.success) {
        const { message, updatedProductsCount, errorCount } = result.data

        if (errorCount > 0) {
          toast.success(`${updatedProductsCount} productos recalculados (${errorCount} errores)`, {
            duration: 5000,
          })
        } else {
          toast.success(message || `Precios recalculados para ${updatedProductsCount} productos`)
        }

        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al recalcular precios"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const refreshConfig = useCallback(async () => {
    await fetchConfig()
    toast.success("Configuración actualizada")
  }, [fetchConfig])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateConfig,
    recalculateAllPrices,
    refreshConfig,
    refetch: fetchConfig,
  }
}

export default useConfig
