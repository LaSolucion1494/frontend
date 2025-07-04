"use client"

import { useState } from "react"
import toast from "react-hot-toast"

export const usePurchasesReports = () => {
  const [purchases, setPurchases] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPurchases = async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "todos") {
          queryParams.append(key, value)
        }
      })

      const response = await fetch(`/api/purchases/reports?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        setPurchases(data.data || [])
      } else {
        setError(data.message || "Error al cargar compras")
        setPurchases([])
      }
    } catch (error) {
      console.error("Error fetching purchases:", error)
      setError("Error de conexión")
      setPurchases([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "todos") {
          queryParams.append(key, value)
        }
      })

      const response = await fetch(`/api/purchases/stats?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        console.error("Error fetching stats:", data.message)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const getPurchaseById = async (purchaseId) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching purchase details:", error)
      return { success: false, message: "Error al cargar detalles" }
    }
  }

  const updatePurchaseStatus = async (purchaseId, updateData) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })
      const data = await response.json()

      if (data.success) {
        // Actualizar la lista de compras
        setPurchases((prev) =>
          prev.map((purchase) => (purchase.id === purchaseId ? { ...purchase, ...updateData } : purchase)),
        )
      }

      return data
    } catch (error) {
      console.error("Error updating purchase status:", error)
      return { success: false, message: "Error al actualizar estado" }
    }
  }

  const receivePurchaseItems = async (purchaseId, receiveData) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}/receive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(receiveData),
      })
      const data = await response.json()

      if (data.success) {
        // Actualizar la lista de compras
        setPurchases((prev) =>
          prev.map((purchase) => (purchase.id === purchaseId ? { ...purchase, estado: data.data.estado } : purchase)),
        )
      }

      return data
    } catch (error) {
      console.error("Error receiving purchase items:", error)
      return { success: false, message: "Error al recibir productos" }
    }
  }

  const exportPurchases = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "todos") {
          queryParams.append(key, value)
        }
      })

      const response = await fetch(`/api/purchases/export?${queryParams}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `compras_${new Date().toISOString().split("T")[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Reporte exportado exitosamente")
      } else {
        toast.error("Error al exportar reporte")
      }
    } catch (error) {
      console.error("Error exporting purchases:", error)
      toast.error("Error al exportar reporte")
    }
  }

  return {
    purchases,
    stats,
    loading,
    error,
    fetchPurchases,
    fetchStats,
    getPurchaseById,
    updatePurchaseStatus,
    receivePurchaseItems,
    exportPurchases,
  }
}
