"use client"

import { useState, useEffect, useCallback } from "react"
import { clientsService } from "../services/clientsService"
import toast from "react-hot-toast"

export const useClients = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    activo: "todos", // Por defecto mostrar todos
  })

  // Función para obtener todos los clientes
  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await clientsService.getAll(filters)

      if (result.success) {
        setClients(result.data || [])
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (error) {
      const message = "Error al cargar clientes"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Función para crear un cliente
  const createClient = async (clientData) => {
    setLoading(true)
    try {
      const result = await clientsService.create(clientData)

      if (result.success) {
        toast.success("Cliente creado exitosamente")
        await fetchClients()
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al crear cliente"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Función para actualizar un cliente
  const updateClient = async (id, clientData) => {
    setLoading(true)
    try {
      const result = await clientsService.update(id, clientData)

      if (result.success) {
        toast.success("Cliente actualizado exitosamente")
        await fetchClients()
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al actualizar cliente"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Función para cambiar el estado de un cliente
  const toggleClientStatus = async (id, newStatus) => {
    setLoading(true)
    try {
      const result = await clientsService.toggleStatus(id, newStatus)

      if (result.success) {
        toast.success(`Cliente ${newStatus ? "activado" : "desactivado"} exitosamente`)
        await fetchClients()
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al cambiar estado del cliente"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar un cliente
  const deleteClient = async (id) => {
    setLoading(true)
    try {
      const result = await clientsService.delete(id)

      if (result.success) {
        toast.success("Cliente eliminado exitosamente")
        await fetchClients()
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al eliminar cliente"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Función para actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }))
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    toggleClientStatus,
    deleteClient,
    fetchClients,
    updateFilters,
    refetch: fetchClients,
  }
}
