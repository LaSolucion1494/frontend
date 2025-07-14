"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import Layout from "../components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Truck, Search, Plus, Edit, Trash2, RefreshCw, CreditCard, Phone, MapPin, Building2 } from "lucide-react"
import SupplierModal from "../components/suppliers/SupplierModal"
import DeleteSupplierModal from "../components/suppliers/DeleteSupplierModal"
import { Loading, LoadingOverlay } from "../components/ui/loading"
import { useSuppliers } from "../hooks/useSuppliers"
import Pagination from "../components/ui/Pagination"

const Proveedores = () => {
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState(null)

  const {
    suppliers,
    loading,
    pagination,
    handlePageChange,
    updateFilters,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    fetchSuppliers,
  } = useSuppliers()

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    if (urlParams.get("action") === "create") {
      handleAddSupplier()
      window.history.replaceState({}, "", "/proveedores")
    }
  }, [location])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updateFilters({ search: searchTerm, offset: 0 })
    }, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, updateFilters])

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

  const handleConfirmDelete = async (supplierId) => {
    const result = await deleteSupplier(supplierId)
    if (result.success) {
      setIsDeleteModalOpen(false)
      setSupplierToDelete(null)
    }
  }

  const handleSaveSupplier = async (supplierData) => {
    const result = isEditing
      ? await updateSupplier(selectedSupplier.id, supplierData)
      : await createSupplier(supplierData)
    if (result.success) {
      setIsSupplierModalOpen(false)
    }
  }

  const handleRefresh = () => {
    fetchSuppliers({ offset: 0 })
  }

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
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Proveedores</h1>
                <p className="text-muted-foreground mt-2">Administra la información de tus proveedores.</p>
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

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Búsqueda de Proveedores
              </CardTitle>
              <CardDescription>Encuentra proveedores por nombre, CUIT, teléfono o dirección.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative -mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-800"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Lista de Proveedores
                </CardTitle>
                <Badge variant="outline" className="w-fit">
                  Total: {pagination.totalItems}
                </Badge>
              </div>
              <CardDescription>
                {pagination.totalItems}{" "}
                {pagination.totalItems === 1 ? "proveedor encontrado" : "proveedores encontrados"}
              </CardDescription>
            </CardHeader>
            <CardContent className="-mt-3">
              <LoadingOverlay loading={loading && suppliers.length > 0} text="Actualizando...">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800 text-slate-100">
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Nombre</th>
                        <th className="text-left py-3 px-4 font-medium">CUIT</th>
                        <th className="text-left py-3 px-4 font-medium">Contacto</th>
                        <th className="text-left py-3 px-4 font-medium">Dirección</th>
                        <th className="text-center py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((supplier) => (
                        <tr key={supplier.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{supplier.nombre}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-mono">
                                {supplier.cuit || <span className="text-muted-foreground italic">N/A</span>}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {supplier.telefono || <span className="text-muted-foreground italic">N/A</span>}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm truncate max-w-xs">
                                {supplier.direccion || <span className="text-muted-foreground italic">N/A</span>}
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
                                disabled={supplier.id === 1}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteSupplier(supplier)}
                                className="h-8 w-8 p-0"
                                disabled={supplier.id === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {suppliers.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium">No se encontraron proveedores</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm ? "Intenta con otra búsqueda." : "Agrega tu primer proveedor."}
                      </p>
                    </div>
                  )}
                </div>
              </LoadingOverlay>
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
              />
            </CardContent>
          </Card>

          <SupplierModal
            isOpen={isSupplierModalOpen}
            onClose={() => setIsSupplierModalOpen(false)}
            onSave={handleSaveSupplier}
            supplier={selectedSupplier}
            isEditing={isEditing}
            loading={loading}
          />
          <DeleteSupplierModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={() => handleConfirmDelete(supplierToDelete.id)}
            supplier={supplierToDelete}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Proveedores
