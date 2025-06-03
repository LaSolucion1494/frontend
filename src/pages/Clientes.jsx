"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import Layout from "../components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Users, Search, Plus, Edit, Trash2, RefreshCw, Filter, Phone, Mail, MapPin, User, Eye } from "lucide-react"
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

const Clientes = () => {
  const location = useLocation()

  // Estados locales para filtros y UI
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("todos")
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

    updateFilters(filters)
  }, [searchTerm, selectedStatus, updateFilters])

  const handleAddClient = () => {
    setSelectedClient(null)
    setIsEditing(false)
    setIsClientModalOpen(true)
  }

  const handleEditClient = (client) => {
    setSelectedClient(client)
    setIsEditing(true)
    setIsClientModalOpen(true)
  }

  const handleViewDetails = (client) => {
    setClientForDetails(client)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteClient = (client) => {
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
  }

  // Loading state
  if (loading && clients.length === 0) {
    return (
      <Layout>
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading text="Cargando clientes..." size="lg" />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Clientes</h1>
            <p className="text-slate-600 mt-1">Administra la información de tus clientes</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleAddClient} className="flex items-center bg-slate-800 hover:bg-slate-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-5 bg-slate-800 border border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-800 border-b border-slate-700">
            <CardTitle className="flex items-center text-white p-1 -mt-4 -ml-4 text-xs">
              <Filter className="w-3 h-3 mr-1" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 -mt-6 -mb-3">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Búsqueda */}
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="search" className="text-sm font-medium text-white">
                    Buscar clientes
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Nombre, teléfono, email, CUIT..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-white">
                    Estado
                  </Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="h-11 border-slate-300 focus:border-slate-500">
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

                {/* Limpiar filtros */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">Acciones</Label>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="h-11 w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de clientes */}
        <LoadingOverlay loading={loading} text="Cargando clientes...">
          <Card className="bg-slate-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Clientes ({clients.length})
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full bg-white">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="text-center py-3 px-4 font-medium text-white">Nombre</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Contacto</th>
                      <th className="text-center py-3 px-4 font-medium text-white">CUIT</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Dirección</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Estado</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-slate-900">{client.nombre}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="space-y-1">
                            {client.telefono && (
                              <div className="flex items-center justify-center space-x-1 text-sm">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-600">{client.telefono}</span>
                              </div>
                            )}
                            {client.email && (
                              <div className="flex items-center justify-center space-x-1 text-sm">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-600 truncate max-w-xs">{client.email}</span>
                              </div>
                            )}
                            {!client.telefono && !client.email && <span className="text-slate-400 text-sm">-</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-slate-600 font-mono text-sm">{client.cuit || "-"}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {client.direccion ? (
                              <>
                                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="text-slate-600 truncate max-w-xs text-sm">{client.direccion}</span>
                              </>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(client)}
                            disabled={client.id === 1} // No permitir cambiar estado del cliente por defecto
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                              client.activo
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            } ${client.id === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                            title={
                              client.id === 1
                                ? "No se puede modificar el cliente por defecto"
                                : "Clic para cambiar estado"
                            }
                          >
                            {client.activo ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(client)}
                              className="border-slate-300 text-slate-700 hover:bg-slate-50"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClient(client)}
                              className="border-slate-300 text-slate-700 hover:bg-slate-50"
                              disabled={client.id === 1}
                              title={client.id === 1 ? "No se puede editar el cliente por defecto" : "Editar cliente"}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteClient(client)}
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
                    <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 mb-2">No se encontraron clientes</p>
                    <p className="text-sm text-slate-500">
                      {searchTerm || selectedStatus !== "todos"
                        ? "Intenta ajustar los filtros"
                        : "Comienza agregando tu primer cliente"}
                    </p>
                    {error && <p className="text-sm text-red-500 mt-2">Error: {error}</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </LoadingOverlay>

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
    </Layout>
  )
}

export default Clientes
