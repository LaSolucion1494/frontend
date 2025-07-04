"use client"

import { useState, useMemo, useEffect } from "react"
import { useLocation } from "react-router-dom"
import Layout from "../components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import {
  Truck,
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Filter,
  CreditCard,
  Phone,
  MapPin,
  Building2,
  Users,
} from "lucide-react"
import SupplierModal from "../components/suppliers/SupplierModal"
import DeleteSupplierModal from "../components/suppliers/DeleteSupplierModal"
import { Loading, LoadingOverlay } from "../components/ui/loading"
import { useSuppliers } from "../hooks/useSuppliers"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"

const Proveedores = () => {
  const location = useLocation()

  // Estados locales para filtros y UI
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Estados para el modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState(null)

  // Hook personalizado para proveedores
  const { suppliers, loading, createSupplier, updateSupplier, deleteSupplier, fetchSuppliers } = useSuppliers()

  // Verificar si se debe abrir el modal al cargar la página
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const action = urlParams.get("action")

    if (action === "create") {
      handleAddSupplier()
      // Limpiar el parámetro de la URL
      window.history.replaceState({}, "", "/proveedores")
    }
  }, [location])

  // Filtrar proveedores localmente
  const filteredSuppliers = useMemo(() => {
    const filtered = suppliers.filter((supplier) => {
      // Filtro por búsqueda
      const matchesSearch =
        supplier.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.cuit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.telefono?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.direccion?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })

    return filtered
  }, [suppliers, searchTerm])

  const handleAddSupplier = () => {
    setSelectedSupplier(null)
    setIsEditing(false)
    setIsSupplierModalOpen(true)
  }

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier)
    setIsEditing(true)
    setIsSupplierModalOpen(true)
  }

  const handleDeleteSupplier = (supplier) => {
    setSupplierToDelete(supplier)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async (supplierId, supplierName) => {
    const result = await deleteSupplier(supplierId)
    if (result.success) {
      setIsDeleteModalOpen(false)
      setSupplierToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setSupplierToDelete(null)
  }

  const handleSaveSupplier = async (supplierData) => {
    let result
    if (isEditing) {
      result = await updateSupplier(selectedSupplier.id, supplierData)
    } else {
      result = await createSupplier(supplierData)
    }

    if (result.success) {
      setIsSupplierModalOpen(false)
    }
  }

  const handleRefresh = () => {
    fetchSuppliers()
  }

  // Loading state
  if (loading && suppliers.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <Loading text="Cargando proveedores..." size="lg" />
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
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Proveedores</h1>
                <p className="text-muted-foreground mt-2">
                  Administra la información de tus proveedores y mantén actualizada su información de contacto
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
                <Button onClick={handleAddSupplier} disabled={loading} className="bg-slate-800 hover:bg-slate-900">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Proveedor
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
              <CardDescription>Encuentra proveedores por nombre, CUIT, teléfono o dirección</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative -mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Nombre, CUIT, teléfono, dirección..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-slate-800"
                    />
                  </div>
                </div>
                {searchTerm && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      Búsqueda: "{searchTerm}"
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")} className="h-6 px-2 text-xs">
                      Limpiar
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabla de proveedores */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Lista de Proveedores
                  </CardTitle>
                  <CardDescription>
                    {filteredSuppliers.length}{" "}
                    {filteredSuppliers.length === 1 ? "proveedor encontrado" : "proveedores encontrados"}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="w-fit">
                  Total: {suppliers.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="-mt-3">
              <LoadingOverlay loading={loading} text="Cargando proveedores...">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800 ">
                      <tr className="border-b">
                        <th className="text-left text-slate-100 py-3 px-4 font-medium text-muted-foreground">CUIT</th>
                        <th className="text-left text-slate-100 py-3 px-4 font-medium text-muted-foreground">Nombre</th>
                        <th className="text-left text-slate-100 py-3 px-4 font-medium text-muted-foreground">Contacto</th>
                        <th className="text-left text-slate-100 py-3 px-4 font-medium text-muted-foreground">Dirección</th>
                        <th className="text-center text-slate-100 py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSuppliers.map((supplier) => (
                        <tr key={supplier.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-mono">
                                {supplier.cuit || <span className="text-muted-foreground italic">Sin CUIT</span>}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{supplier.nombre}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {supplier.telefono || (
                                  <span className="text-muted-foreground italic">Sin teléfono</span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm truncate max-w-xs">
                                {supplier.direccion || (
                                  <span className="text-muted-foreground italic">Sin dirección</span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditSupplier(supplier)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSupplier(supplier)}
                                className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredSuppliers.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No se encontraron proveedores</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm
                          ? "Intenta ajustar los criterios de búsqueda"
                          : "Comienza agregando tu primer proveedor"}
                      </p>
                      {!searchTerm && (
                        <Button onClick={handleAddSupplier} className="mt-2">
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Primer Proveedor
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </LoadingOverlay>
            </CardContent>
          </Card>

          {/* Modal de proveedor */}
          <SupplierModal
            isOpen={isSupplierModalOpen}
            onClose={() => setIsSupplierModalOpen(false)}
            onSave={handleSaveSupplier}
            supplier={selectedSupplier}
            isEditing={isEditing}
            loading={loading}
          />

          {/* Modal de confirmación de eliminación */}
          <DeleteSupplierModal
            isOpen={isDeleteModalOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            supplier={supplierToDelete}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Proveedores
