"use client"

import { useState, useEffect, useCallback } from "react"
import { suppliersService } from "../services/suppliersService"
import toast from "react-hot-toast"

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await suppliersService.getSuppliers()

      if (result.success) {
        setSuppliers(result.data)
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
  }, [])

  const createSupplier = async (supplierData) => {
    setLoading(true)
    try {
      const result = await suppliersService.createSupplier(supplierData)

      if (result.success) {
        toast.success("Proveedor creado exitosamente")
        await fetchSuppliers()
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
        await fetchSuppliers()
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

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refetch: fetchSuppliers,
  }
}

export default useSuppliers
