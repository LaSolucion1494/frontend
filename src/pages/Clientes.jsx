"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import Layout from "../components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Filter,
  Phone,
  Mail,
  MapPin,
  User,
  Eye,
  CreditCard,
  DollarSign,
  AlertTriangle,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import ClientModal from "../components/clients/ClientModal"
import DeleteClientModal from "../components/clients/DeleteClientModal"
import ClientDetailsModal from "../components/clients/ClientDetailsModal"
import { Loading, LoadingOverlay } from "../components/ui/loading"
import { useClients } from "../hooks/useClients"

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos los clientes" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
]

const CUENTA_CORRIENTE_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "true", label: "Con cuenta corriente" },
  { value: "false", label: "Sin cuenta corriente" },
]

const Clientes = () => {
  const location = useLocation()

  // Estados locales para filtros y UI
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("todos")
  const [selectedCuentaCorriente, setSelectedCuentaCorriente] = useState("todos")
  const [selectedClient, setSelectedClient] = useState(null)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Estados para el modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)

  // Estados para el modal de detalles
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [clientForDetails, setClientForDetails] = useState(null)

  // Hook personalizado para clientes
  const {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    toggleClientStatus,
    deleteClient,
    fetchClients,
    updateFilters,
    getLocalStats,
  } = useClients()

  // Verificar si se debe abrir el modal al cargar la página
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const action = urlParams.get("action")

    if (action === "create") {
      handleAddClient()
      // Limpiar el parámetro de la URL
      window.history.replaceState({}, "", "/clientes")
    }
  }, [location])

  // Actualizar filtros cuando cambien los estados locales
  useEffect(() => {
    const filters = {
      search: searchTerm.trim(),
    }

    // Solo agregar filtro de activo si no es "todos"
    if (selectedStatus !== "todos") {
      filters.activo = selectedStatus
    }

    // Solo agregar filtro de cuenta corriente si no es "todos"
    if (selectedCuentaCorriente !== "todos") {
      filters.conCuentaCorriente = selectedCuentaCorriente
    }

    updateFilters(filters)
  }, [searchTerm, selectedStatus, selectedCuentaCorriente, updateFilters])

  const handleAddClient = () => {
    setSelectedClient(null)
    setIsEditing(false)
    setIsClientModalOpen(true)
  }

  const handleEditClient = (client) => {
    // Cerrar modal de detalles si está abierto
    if (isDetailsModalOpen) {
      setIsDetailsModalOpen(false)
      setClientForDetails(null)
    }

    setSelectedClient(client)
    setIsEditing(true)
    setIsClientModalOpen(true)
  }

  const handleViewDetails = (client) => {
    setClientForDetails(client)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteClient = (client) => {
    // Cerrar modal de detalles si está abierto
    if (isDetailsModalOpen) {
      setIsDetailsModalOpen(false)
      setClientForDetails(null)
    }

    setClientToDelete(client)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async (clientId, clientName) => {
    const result = await deleteClient(clientId)
    if (result.success) {
      setIsDeleteModalOpen(false)
      setClientToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setClientToDelete(null)
  }

  const handleSaveClient = async (clientData) => {
    let result
    if (isEditing) {
      result = await updateClient(selectedClient.id, clientData)
    } else {
      result = await createClient(clientData)
    }

    if (result.success) {
      setIsClientModalOpen(false)
    }
  }

  const handleToggleStatus = async (client) => {
    const newStatus = !client.activo
    await toggleClientStatus(client.id, newStatus)
  }

  const handleRefresh = () => {
    fetchClients()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedStatus("todos")
    setSelectedCuentaCorriente("todos")
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  }

  // Función simplificada para mostrar información de cuenta corriente en la tabla
  const formatCuentaCorrienteInfo = (client) => {
    if (!client.tiene_cuenta_corriente) {
      return (
        <div className="flex flex-col items-center space-y-1">
          <Badge variant="secondary" className="text-xs">
            <CreditCard className="w-3 h-3 mr-1" />
            No habilitada
          </Badge>
          <span className="text-xs text-muted-foreground">-</span>
        </div>
      )
    }

    const saldoActual = client.saldo_cuenta_corriente || client.saldo_actual || 0
    const tieneSaldo = saldoActual > 0.01

    return (
      <div className="flex flex-col items-center space-y-1">
        {/* Estado habilitada */}
        <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
          <CreditCard className="w-3 h-3 mr-1" />
          Habilitada
        </Badge>

        {/* Saldo pendiente */}
        <div className="flex items-center space-x-1">
          <div className={`text-xs font-medium flex items-center ${tieneSaldo ? "text-red-600" : "text-green-600"}`}>
            {tieneSaldo ? (
              <>
                <AlertTriangle className="w-3 h-3 mr-1" />
                <span className="font-mono">{formatCurrency(saldoActual)}</span>
              </>
            ) : (
              <>
                <DollarSign className="w-3 h-3 mr-1" />
                <span className="font-mono">$0.00</span>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Obtener estadísticas locales
  const stats = getLocalStats()

  // Loading state
  if (loading && clients.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <Loading text="Cargando clientes..." size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-[95rem]">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
                <p className="text-muted-foreground mt-2">
                  Administra la información de tus clientes y gestiona sus cuentas corrientes
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
                <Button onClick={handleAddClient} disabled={loading} className="bg-slate-800 hover:bg-slate-900">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Búsqueda y Filtros
              </CardTitle>
              <CardDescription>
                Encuentra clientes por nombre, contacto, CUIT o filtra por estado y cuenta corriente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 -mt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Búsqueda */}
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="search">Buscar cliente</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="search"
                        placeholder="Nombre, teléfono, email, CUIT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-800"
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="border-slate-800">
                        <SelectValue placeholder="Estado del cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cuenta Corriente */}
                  <div className="space-y-2">
                    <Label htmlFor="cuenta-corriente">Cuenta Corriente</Label>
                    <Select value={selectedCuentaCorriente} onValueChange={setSelectedCuentaCorriente}>
                      <SelectTrigger className="border-slate-800">
                        <SelectValue placeholder="Filtrar por cuenta corriente" />
                      </SelectTrigger>
                      <SelectContent>
                        {CUENTA_CORRIENTE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filtros activos */}
                {(searchTerm || selectedStatus !== "todos" || selectedCuentaCorriente !== "todos") && (
                  <div className="flex flex-wrap items-center gap-2">
                    {searchTerm && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        Búsqueda: "{searchTerm}"
                      </Badge>
                    )}
                    {selectedStatus !== "todos" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Filter className="w-3 h-3" />
                        Estado: {STATUS_OPTIONS.find((s) => s.value === selectedStatus)?.label}
                      </Badge>
                    )}
                    {selectedCuentaCorriente !== "todos" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        C.C.: {CUENTA_CORRIENTE_OPTIONS.find((c) => c.value === selectedCuentaCorriente)?.label}
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabla de clientes */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Lista de Clientes
                  </CardTitle>
                  <CardDescription>
                    {clients.length} {clients.length === 1 ? "cliente encontrado" : "clientes encontrados"}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="w-fit">
                  Total: {stats?.totalClientes || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="-mt-3">
              <LoadingOverlay loading={loading} text="Cargando clientes...">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr className="border-b">
                        <th className="text-slate-100 text-left py-3 px-4 font-medium text-muted-foreground">
                          Cliente
                        </th>
                        <th className="text-slate-100 text-left py-3 px-4 font-medium text-muted-foreground">
                          Contacto
                        </th>
                        <th className="text-slate-100 text-left py-3 px-4 font-medium text-muted-foreground">CUIT</th>
                        <th className="text-slate-100 text-left py-3 px-4 font-medium text-muted-foreground">
                          Dirección
                        </th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium text-muted-foreground">
                          Cuenta Corriente
                        </th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium text-muted-foreground">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client) => (
                        <tr key={client.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{client.nombre}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {client.telefono && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-3 h-3 text-muted-foreground" />
                                  <span>{client.telefono}</span>
                                </div>
                              )}
                              {client.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-3 h-3 text-muted-foreground" />
                                  <span className="truncate max-w-xs">{client.email}</span>
                                </div>
                              )}
                              {!client.telefono && !client.email && (
                                <span className="text-muted-foreground text-sm italic">Sin contacto</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm">
                              {client.cuit || <span className="text-muted-foreground italic">Sin CUIT</span>}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {client.direccion ? (
                                <>
                                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-sm truncate max-w-xs">{client.direccion}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground text-sm italic">Sin dirección</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">{formatCuentaCorrienteInfo(client)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(client)}
                                className="h-8 w-8 p-0"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClient(client)}
                                className="h-8 w-8 p-0"
                                disabled={client.id === 1}
                                title={client.id === 1 ? "No se puede editar el cliente por defecto" : "Editar cliente"}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteClient(client)}
                                className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                disabled={client.id === 1}
                                title={
                                  client.id === 1 ? "No se puede eliminar el cliente por defecto" : "Eliminar cliente"
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {clients.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No se encontraron clientes</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm || selectedStatus !== "todos" || selectedCuentaCorriente !== "todos"
                          ? "Intenta ajustar los criterios de búsqueda"
                          : "Comienza agregando tu primer cliente"}
                      </p>
                      {error && <p className="text-sm text-red-500 mt-2">Error: {error}</p>}
                      {!searchTerm && selectedStatus === "todos" && selectedCuentaCorriente === "todos" && (
                        <Button onClick={handleAddClient} className="mt-2">
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Primer Cliente
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </LoadingOverlay>
            </CardContent>
          </Card>

          {/* Modales */}
          <ClientModal
            isOpen={isClientModalOpen}
            onClose={() => setIsClientModalOpen(false)}
            onSave={handleSaveClient}
            client={selectedClient}
            isEditing={isEditing}
            loading={loading}
          />

          <DeleteClientModal
            isOpen={isDeleteModalOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            client={clientToDelete}
            loading={loading}
          />

          <ClientDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            client={clientForDetails}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Clientes
