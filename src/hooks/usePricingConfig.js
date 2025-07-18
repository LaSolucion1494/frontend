"use client"

import { useState, useEffect, useCallback } from "react"
import { useConfig } from "./useConfig"
import pricingService from "../services/pricingService"

export const usePricingConfig = () => {
  const { config: globalConfig, loading: globalLoading } = useConfig()

  const [config, setConfig] = useState({
    rentabilidad: 40,
    iva: 21,
    ingresos_brutos: 0,
    otros_impuestos: 0,
    stock_minimo: 5,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Función para mapear la configuración global a configuración de precios
  const mapGlobalConfigToPricing = useCallback((globalConfig) => {
    return {
      rentabilidad: Number(globalConfig.rentabilidad) || 40,
      iva: Number(globalConfig.iva) || 21,
      ingresos_brutos: Number(globalConfig.ingresos_brutos) || 0,
      otros_impuestos: Number(globalConfig.otros_impuestos) || 0,
      stock_minimo: Number(globalConfig.stock_minimo_default) || 5,
    }
  }, [])

  // Sincronizar con la configuración global cuando cambie
  useEffect(() => {
    if (globalConfig && Object.keys(globalConfig).length > 0) {
      const pricingConfig = mapGlobalConfigToPricing(globalConfig)
      console.log("Sincronizando configuración de precios:", pricingConfig)
      setConfig(pricingConfig)
      setLoading(false)
      setError(null)
    }
  }, [globalConfig, mapGlobalConfigToPricing])

  // Función para cargar configuración manualmente (fallback)
  const loadConfig = async () => {
    try {
      setLoading(true)
      setError(null)
      const pricingConfig = await pricingService.getPricingConfig()
      console.log("Configuración de precios cargada manualmente:", pricingConfig)
      setConfig(pricingConfig)
    } catch (err) {
      console.error("Error cargando configuración:", err)
      setError(err.message)
      // Mantener configuración por defecto en caso de error
    } finally {
      setLoading(false)
    }
  }

  // Si la configuración global no está disponible, cargar manualmente
  useEffect(() => {
    if (!globalLoading && (!globalConfig || Object.keys(globalConfig).length === 0)) {
      console.log("Configuración global no disponible, cargando manualmente")
      loadConfig()
    }
  }, [globalConfig, globalLoading])

  const calculateSalePrice = useCallback(
    (costPrice) => {
      const result = pricingService.calculateSalePrice(costPrice, config)
      console.log("Precio calculado en hook:", { costPrice, result, config })
      return result
    },
    [config],
  )

  const getPriceBreakdown = useCallback(
    (costPrice) => {
      return pricingService.getPriceBreakdown(costPrice, config)
    },
    [config],
  )

  const updateProductPrice = async (productId, newCostPrice, newSalePrice) => {
    return await pricingService.updateProductPrice(productId, newCostPrice, newSalePrice)
  }

  return {
    config,
    loading: loading || globalLoading,
    error,
    loadConfig,
    calculateSalePrice,
    getPriceBreakdown,
    updateProductPrice,
  }
}
