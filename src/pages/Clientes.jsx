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
  Phone,
  Mail,
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
import Pagination from "../components/ui/Pagination" // --- NUEVO: Importar componente de paginación ---

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

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("true") // Por defecto activos
  const [selectedCuentaCorriente, setSelectedCuentaCorriente] = useState("todos")
  const [selectedClient, setSelectedClient] = useState(null)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [clientForDetails, setClientForDetails] = useState(null)

  // --- ACTUALIZADO: Destructurar pagination y handlePageChange del hook ---
  const {
    clients,
    loading,
    pagination,
    handlePageChange,
    createClient,
    updateClient,
    deleteClient,
    updateFilters,
  } = useClients()

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    if (urlParams.get("action") === "create") {
      handleAddClient()
      window.history.replaceState({}, "", "/clientes")
    }
  }, [location])

  useEffect(() => {
    // Cuando cambian los filtros de texto o select, volver a la primera página
    updateFilters({
      search: searchTerm.trim(),
      activo: selectedStatus,
      conCuentaCorriente: selectedCuentaCorriente,
      offset: 0, // Reiniciar offset
    })
  }, [searchTerm, selectedStatus, selectedCuentaCorriente])

  const handleAddClient = () => {
    setSelectedClient(null)
    setIsEditing(false)
    setIsClientModalOpen(true)
  }

  const handleEditClient = (client) => {
    if (isDetailsModalOpen) setIsDetailsModalOpen(false)
    setSelectedClient(client)
    setIsEditing(true)
    setIsClientModalOpen(true)
  }

  const handleViewDetails = (client) => {
    setClientForDetails(client)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteClient = (client) => {
    if (isDetailsModalOpen) setIsDetailsModalOpen(false)
    setClientToDelete(client)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async (clientId) => {
    const result = await deleteClient(clientId)
    if (result.success) {
      setIsDeleteModalOpen(false)
      setClientToDelete(null)
    }
  }

  const handleSaveClient = async (clientData) => {
    const result = isEditing ? await updateClient(selectedClient.id, clientData) : await createClient(clientData)
    if (result.success) {
      setIsClientModalOpen(false)
    }
  }

  const handleRefresh = () => {
    // fetchClients ya se llama cuando cambian los filtros,
    // para forzar, podemos llamar a updateFilters con los filtros actuales.
    updateFilters({ ...pagination, offset: 0 })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount || 0)
  }

  const formatCuentaCorrienteInfo = (client) => {
    if (!client.tiene_cuenta_corriente) {
      return (
        <div className="flex flex-col items-center space-y-1">
          <Badge variant="secondary" className="text-xs">
            <CreditCard className="w-3 h-3 mr-1" />
            No habilitada
          </Badge>
        </div>
      )
    }
    const saldoActual = client.saldo_cuenta_corriente || 0
    const tieneSaldo = saldoActual > 0.01
    return (
      <div className="flex flex-col items-center space-y-1">
        <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
          <CreditCard className="w-3 h-3 mr-1" />
          Habilitada
        </Badge>
        <div className={`text-xs font-medium flex items-center ${tieneSaldo ? "text-red-600" : "text-green-600"}`}>
          <span className="font-mono">{formatCurrency(saldoActual)}</span>
        </div>
      </div>
    )
  }

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

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Búsqueda y Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 lg:col-span-1">
                  <Label htmlFor="search">Buscar cliente</Label>
                  <Input
                    id="search"
                    placeholder="Nombre, teléfono, email, CUIT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className=" border-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuenta-corriente">Cuenta Corriente</Label>
                  <Select value={selectedCuentaCorriente} onValueChange={setSelectedCuentaCorriente}>
                    <SelectTrigger className="border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CUENTA_CORRIENTE_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                {pagination.totalItems} {pagination.totalItems === 1 ? "cliente encontrado" : "clientes encontrados"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoadingOverlay loading={loading} text="Actualizando...">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800 text-slate-100">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium">Cliente</th>
                        <th className="text-left py-3 px-4 font-medium">Contacto</th>
                        <th className="text-left py-3 px-4 font-medium">CUIT</th>
                        <th className="text-left py-3 px-4 font-medium">Dirección</th>
                        <th className="text-center py-3 px-4 font-medium">Cuenta Corriente</th>
                        <th className="text-center py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client) => (
                        <tr key={client.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{client.nombre}</td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {client.telefono && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-3 h-3" />
                                  {client.telefono}
                                </div>
                              )}
                              {client.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-3 h-3" />
                                  {client.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">{client.cuit || "-"}</td>
                          <td className="py-3 px-4 text-sm">{client.direccion || "-"}</td>
                          <td className="py-3 px-4 text-center">{formatCuentaCorrienteInfo(client)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(client)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClient(client)}
                                disabled={client.id === 1}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteClient(client)}
                                disabled={client.id === 1}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {clients.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No se encontraron clientes</h3>
                    <p className="text-sm text-muted-foreground">
                      Intenta ajustar los filtros o agregar un nuevo cliente.
                    </p>
                  </div>
                )}
              </LoadingOverlay>

              {/* --- NUEVO: Renderizar componente de paginación --- */}
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
              />
            </CardContent>
          </Card>

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
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={() => handleConfirmDelete(clientToDelete.id)}
            client={clientToDelete}
            loading={loading}
          />
          <ClientDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            client={clientForDetails}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Clientes
