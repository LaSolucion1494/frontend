// useClients.js - ACTUALIZADO PARA MOSTRAR CORRECTAMENTE SALDOS
"use client"

import { useState, useEffect, useCallback } from "react"
import { clientsService } from "../services/clientsService"
import toast from "react-hot-toast"

export const useClients = (initialFilters = {}) => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    activo: "true", // Por defecto mostrar solo activos
    conCuentaCorriente: "todos",
    limit: 50,
    offset: 0,
    ...initialFilters,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  })

  // Estados adicionales para cuenta corriente integrada
  const [cuentasCorrientes, setCuentasCorrientes] = useState([])
  const [resumenCC, setResumenCC] = useState(null)

  // Función para obtener todos los clientes (ACTUALIZADA para mostrar saldos correctamente)
  const fetchClients = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await clientsService.getAll(finalFilters)

        if (result.success) {
          // ACTUALIZADO: Formatear clientes asegurando que se use saldo_cuenta_corriente
          const formattedClients = result.data.map((client) => {
            return {
              ...client,
              // Asegurar que el saldo esté disponible
              saldo_cuenta_corriente: client.saldo_cuenta_corriente || 0,
            }
          })

          setClients(formattedClients)

          // Actualizar paginación si viene en la respuesta
          if (result.pagination) {
            setPagination(result.pagination)
          }
          return { success: true, data: formattedClients }
        } else {
          setError(result.message)
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al cargar clientes"
        setError(message)
        if (!customFilters.silent) {
          toast.error(message)
        }
        return { success: false, message }
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  // Función para obtener un cliente por ID (ACTUALIZADA)
  const getClientById = async (id) => {
    if (!id || id < 1) {
      toast.error("ID de cliente inválido")
      return { success: false, message: "ID de cliente inválido" }
    }

    setLoading(true)
    try {
      const result = await clientsService.getById(id)

      if (result.success) {
        // ACTUALIZADO: Formatear cliente asegurando campos correctos
        const formattedClient = {
          ...result.data,
          saldo_cuenta_corriente: result.data.saldo_cuenta_corriente || 0,
        }

        return { success: true, data: formattedClient }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener cliente"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Función para buscar clientes (ACTUALIZADA)
  const searchClients = async (term) => {
    if (!term || term.length < 2) {
      return { success: true, data: [] }
    }

    setLoading(true)
    try {
      const result = await clientsService.search(term)

      if (result.success) {
        // ACTUALIZADO: Formatear resultados de búsqueda
        const formattedResults = result.data.map((client) => ({
          ...client,
          saldo_cuenta_corriente: client.saldo_cuenta_corriente || 0,
        }))

        return { success: true, data: formattedResults }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message, data: [] }
      }
    } catch (error) {
      const message = "Error al buscar clientes"
      toast.error(message)
      return { success: false, message, data: [] }
    } finally {
      setLoading(false)
    }
  }

  // Función para crear un cliente (ACTUALIZADA)
  const createClient = async (clientData) => {
    setLoading(true)
    try {
      // Validar datos antes de enviar
      const validation = validateClientData(clientData)
      if (!validation.isValid) {
        toast.error(validation.errors[0])
        return { success: false, message: validation.errors[0] }
      }

      // ACTUALIZADO: Formatear datos para la nueva estructura
      const formattedData = {
        ...clientData,
        // Asegurar que los campos de cuenta corriente estén correctos
        tieneCuentaCorriente: clientData.tieneCuentaCorriente || false,
        limiteCredito: clientData.tieneCuentaCorriente ? clientData.limiteCredito || null : null,
      }

      const result = await clientsService.create(formattedData)

      if (result.success) {
        toast.success(result.message || "Cliente creado exitosamente")
        await fetchClients({ silent: true })
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = error.message || "Error al crear cliente"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Función para actualizar un cliente (ACTUALIZADA)
  const updateClient = async (id, clientData) => {
    if (!id || id < 1) {
      toast.error("ID de cliente inválido")
      return { success: false, message: "ID de cliente inválido" }
    }

    setLoading(true)
    try {
      // Validar datos antes de enviar
      const validation = validateClientData(clientData, true)
      if (!validation.isValid) {
        toast.error(validation.errors[0])
        return { success: false, message: validation.errors[0] }
      }

      // ACTUALIZADO: Formatear datos para la nueva estructura
      const formattedData = {
        ...clientData,
        // Asegurar que los campos de cuenta corriente estén correctos
        tieneCuentaCorriente: clientData.tieneCuentaCorriente || false,
        limiteCredito: clientData.tieneCuentaCorriente ? clientData.limiteCredito || null : null,
      }

      const result = await clientsService.update(id, formattedData)

      if (result.success) {
        toast.success(result.message || "Cliente actualizado exitosamente")
        await fetchClients({ silent: true })
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = error.message || "Error al actualizar cliente"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Función para cambiar el estado de un cliente (No requiere cambios)
  const toggleClientStatus = async (id, newStatus) => {
    if (!id || id < 1) {
      toast.error("ID de cliente inválido")
      return { success: false, message: "ID de cliente inválido" }
    }

    setLoading(true)
    try {
      const result = await clientsService.toggleStatus(id, newStatus)

      if (result.success) {
        toast.success(result.message || `Cliente ${newStatus ? "activado" : "desactivado"} exitosamente`)
        await fetchClients({ silent: true })
        return { success: true, data: result.data }
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

  // Función para eliminar un cliente (No requiere cambios)
  const deleteClient = async (id) => {
    if (!id || id < 1) {
      toast.error("ID de cliente inválido")
      return { success: false, message: "ID de cliente inválido" }
    }

    setLoading(true)
    try {
      const result = await clientsService.delete(id)

      if (result.success) {
        toast.success(result.message || "Cliente eliminado exitosamente")
        await fetchClients({ silent: true })
        return { success: true, data: result.data }
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

  // FUNCIONES PARA CUENTA CORRIENTE ACTUALIZADAS PARA ESTRUCTURA SIMPLIFICADA

  // Función para obtener cuenta corriente de un cliente (ACTUALIZADA)
  const getCuentaCorriente = async (clientId, customFilters = {}) => {
    if (!clientId || clientId < 1) {
      toast.error("ID de cliente inválido")
      return { success: false, message: "ID de cliente inválido" }
    }

    setLoading(true)
    try {
      const result = await clientsService.getCuentaCorriente(clientId, customFilters)

      if (result.success) {
        // ACTUALIZADO: Formatear datos de cuenta corriente con nueva estructura
        const formattedData = {
          ...result.data,
          cliente: {
            ...result.data.cliente,
            saldo_cuenta_corriente: result.data.cliente.saldo_cuenta_corriente || 0,
            saldo_actual: result.data.cliente.saldo_cuenta_corriente || 0,
          },
          cuenta: {
            ...result.data.cuenta,
            saldo_actual: result.data.cuenta.saldo_actual || 0,
            saldo_disponible:
              result.data.cuenta.saldo_disponible ||
              clientsService.calculateSaldoDisponible(
                result.data.cuenta.saldo_actual || 0,
                result.data.cuenta.limite_credito,
              ),
          },
        }

        return { success: true, data: formattedData }
      } else {
        if (!customFilters.silent) {
          toast.error(result.message)
        }
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener cuenta corriente"
      if (!customFilters.silent) {
        toast.error(message)
      }
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener resumen de cuentas corrientes (ACTUALIZADA)
  const getResumenCuentasCorrientes = async (customFilters = {}) => {
    setLoading(true)
    try {
      const result = await clientsService.getResumenCuentasCorrientes(customFilters)

      if (result.success) {
        // ACTUALIZADO: Formatear datos del resumen con nueva estructura
        const formattedData = {
          ...result.data,
          cuentas: result.data.cuentas.map((cuenta) => {
            const saldoActual = cuenta.saldo_actual || 0
            const saldoDisponible = cuenta.limite_credito ? Math.max(0, cuenta.limite_credito - saldoActual) : 999999999

            return {
              ...cuenta,
              saldo_cuenta_corriente: saldoActual,
              saldo_actual: saldoActual,
              saldo_disponible: saldoDisponible,
              saldo_actual_formatted: clientsService.formatCurrency(saldoActual),
              limite_credito_formatted: cuenta.limite_credito
                ? clientsService.formatCurrency(cuenta.limite_credito)
                : "Sin límite",
              saldo_disponible_formatted:
                saldoDisponible === 999999999 ? "Sin límite" : clientsService.formatCurrency(saldoDisponible),
              estado_cuenta: clientsService.getEstadoCuenta({
                ...cuenta,
                saldo_actual: saldoActual,
              }),
            }
          }),
        }

        setResumenCC(formattedData)
        setCuentasCorrientes(formattedData.cuentas)

        return { success: true, data: formattedData }
      } else {
        if (!customFilters.silent) {
          toast.error(result.message)
        }
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener resumen de cuentas corrientes"
      if (!customFilters.silent) {
        toast.error(message)
      }
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // NUEVAS FUNCIONES ESPECÍFICAS PARA LA ESTRUCTURA SIMPLIFICADA

  // Obtener clientes con cuenta corriente
  const getClientesConCuentaCorriente = async (customFilters = {}) => {
    const filters = { ...customFilters, conCuentaCorriente: "true" }
    return await fetchClients(filters)
  }

  // Obtener clientes con saldo pendiente
  const getClientesConSaldo = async (customFilters = {}) => {
    setLoading(true)
    try {
      const result = await getResumenCuentasCorrientes({ conSaldo: "true", ...customFilters })

      if (result.success) {
        return {
          success: true,
          data: result.data.cuentas || [],
        }
      }

      return result
    } catch (error) {
      const message = "Error al obtener clientes con saldo"
      if (!customFilters.silent) {
        toast.error(message)
      }
      return { success: false, message, data: [] }
    } finally {
      setLoading(false)
    }
  }

  // Verificar si un cliente puede usar cuenta corriente
  const canUseCuentaCorriente = useCallback((cliente, monto = 0) => {
    if (!cliente || !cliente.tiene_cuenta_corriente) {
      return {
        can: false,
        reason: "El cliente no tiene cuenta corriente habilitada",
      }
    }

    const saldoActual = cliente.saldo_cuenta_corriente || cliente.saldo_actual || 0
    const limiteCredito = cliente.limite_credito

    if (limiteCredito) {
      const nuevoSaldo = saldoActual + Number.parseFloat(monto)

      if (nuevoSaldo > limiteCredito) {
        const disponible = limiteCredito - saldoActual
        return {
          can: false,
          reason: `El monto excede el límite de crédito. Disponible: ${clientsService.formatCurrency(disponible)}`,
          disponible: disponible,
        }
      }
    }

    return { can: true }
  }, [])

  // VALIDACIONES ACTUALIZADAS

  // Validar datos del cliente (ACTUALIZADA para estructura simplificada)
  const validateClientData = (clientData, isUpdate = false) => {
    const errors = []

    // Validar nombre (obligatorio)
    if (!clientData.nombre || clientData.nombre.trim().length === 0) {
      errors.push("El nombre es obligatorio")
    }

    if (clientData.nombre && clientData.nombre.trim().length > 100) {
      errors.push("El nombre no puede exceder 100 caracteres")
    }

    // Validar email si se proporciona
    if (clientData.email && clientData.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(clientData.email)) {
        errors.push("El email no tiene un formato válido")
      }
    }

    // Validar CUIT si se proporciona
    if (clientData.cuit && clientData.cuit.trim().length > 0) {
      if (!clientsService.isValidCUIT(clientData.cuit)) {
        errors.push("El formato del CUIT no es válido")
      }
    }

    // ACTUALIZADO: Validar cuenta corriente con nueva estructura
    if (clientData.tieneCuentaCorriente) {
      if (clientData.limiteCredito !== null && clientData.limiteCredito !== undefined) {
        const limite = Number.parseFloat(clientData.limiteCredito)
        if (isNaN(limite) || limite < 0) {
          errors.push("El límite de crédito debe ser un número mayor o igual a 0")
        }
        if (limite > 999999999) {
          errors.push("El límite de crédito es demasiado alto")
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Función para actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }))
  }, [])

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      activo: "true",
      conCuentaCorriente: "todos",
      limit: 50,
      offset: 0,
    })
  }, [])

  // Formatear moneda
  const formatCurrency = useCallback((amount) => {
    return clientsService.formatCurrency(amount)
  }, [])

  // Calcular saldo disponible (ACTUALIZADO para estructura simplificada)
  const calculateSaldoDisponible = useCallback((saldoActual, limiteCredito) => {
    return clientsService.calculateSaldoDisponible(saldoActual, limiteCredito)
  }, [])

  // Obtener estadísticas locales (ACTUALIZADA para estructura simplificada)
  const getLocalStats = useCallback(() => {
    if (!clients || clients.length === 0) return null

    const totalClientes = clients.length
    const clientesActivos = clients.filter((client) => client.activo).length
    const clientesConCC = clients.filter((client) => client.tiene_cuenta_corriente).length

    // ACTUALIZADO: Usar saldo_cuenta_corriente como campo principal
    const saldoTotalCC = clients
      .filter((client) => client.tiene_cuenta_corriente)
      .reduce((sum, client) => sum + (client.saldo_cuenta_corriente || 0), 0)

    const clientesConSaldo = clients.filter(
      (client) => client.tiene_cuenta_corriente && (client.saldo_cuenta_corriente || 0) > 0.01,
    ).length

    return {
      totalClientes,
      clientesActivos,
      clientesInactivos: totalClientes - clientesActivos,
      clientesConCC,
      clientesSinCC: totalClientes - clientesConCC,
      clientesConSaldo,
      saldoTotalCC,
      saldoTotalCC_formatted: formatCurrency(saldoTotalCC),
    }
  }, [clients, formatCurrency])

  // Efecto para cargar clientes cuando cambian los filtros
  useEffect(() => {
    fetchClients({ silent: true })
  }, [fetchClients])

  return {
    // Estados
    clients,
    loading,
    error,
    filters,
    pagination,
    cuentasCorrientes,
    resumenCC,

    // Funciones principales
    fetchClients,
    getClientById,
    searchClients,
    createClient,
    updateClient,
    toggleClientStatus,
    deleteClient,

    // Funciones de cuenta corriente actualizadas
    getCuentaCorriente,
    getResumenCuentasCorrientes,
    getClientesConCuentaCorriente,
    getClientesConSaldo,

    // Validaciones
    validateClientData,

    // Utilidades actualizadas
    updateFilters,
    clearFilters,
    formatCurrency,
    calculateSaldoDisponible,
    canUseCuentaCorriente,
    getLocalStats,

    // Aliases para compatibilidad
    refetch: fetchClients,
  }
}

export default useClients
