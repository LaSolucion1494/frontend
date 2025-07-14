"use client"

import { useState, useEffect } from "react"
import pricingService from "../services/pricingService"

export const usePricingConfig = () => {
  const [config, setConfig] = useState({
    rentabilidad: 40,
    iva: 21,
    ingresos_brutos: 0,
    otros_impuestos: 0,
    stock_minimo: 5,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadConfig = async () => {
    try {
      setLoading(true)
      setError(null)
      const pricingConfig = await pricingService.getPricingConfig()
      setConfig(pricingConfig)
    } catch (err) {
      console.error("Error cargando configuración:", err)
      setError(err.message)
      // Mantener configuración por defecto en caso de error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const calculateSalePrice = (costPrice) => {
    return pricingService.calculateSalePrice(costPrice, config)
  }

  const getPriceBreakdown = (costPrice) => {
    return pricingService.getPriceBreakdown(costPrice, config)
  }

  const updateProductPrice = async (productId, newCostPrice, newSalePrice) => {
    return await pricingService.updateProductPrice(productId, newCostPrice, newSalePrice)
  }

  return {
    config,
    loading,
    error,
    loadConfig,
    calculateSalePrice,
    getPriceBreakdown,
    updateProductPrice,
  }
}
