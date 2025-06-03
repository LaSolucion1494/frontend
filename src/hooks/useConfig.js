"use client"

import { useState, useEffect, useCallback } from "react"
import { configService } from "../services/configService"
import toast from "react-hot-toast"

export const useConfig = () => {
  const [config, setConfig] = useState({
    rentabilidad: 40,
    iva: 21,
    ingresosBrutos: 0,
  })
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
        // No mostrar toast para errores de configuración, usar valores por defecto
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

  const updateConfig = async (newConfig) => {
    setLoading(true)
    try {
      const configs = Object.entries(newConfig).map(([clave, valor]) => ({
        clave,
        valor: valor.toString(),
      }))

      const result = await configService.updateConfig(configs)

      if (result.success) {
        toast.success("Configuración actualizada exitosamente")
        await fetchConfig()
        return { success: true }
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

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateConfig,
    refetch: fetchConfig,
  }
}

export default useConfig
