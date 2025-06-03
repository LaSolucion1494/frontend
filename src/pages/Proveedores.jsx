"use client"

import { useState, useMemo, useEffect } from "react"
import { useLocation } from "react-router-dom"
import Layout from "../components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Truck, Search, Plus, Edit, Trash2, RefreshCw, Filter, CreditCard, Phone, MapPin } from "lucide-react"
import SupplierModal from "../components/suppliers/SupplierModal"
import DeleteSupplierModal from "../components/suppliers/DeleteSupplierModal"
import { Loading, LoadingOverlay } from "../components/ui/loading"
import { useSuppliers } from "../hooks/useSuppliers"

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
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading text="Cargando proveedores..." size="lg" />
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
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Proveedores</h1>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleAddSupplier} className="flex items-center bg-slate-800 hover:bg-slate-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-5 bg-slate-800 border border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-800 border-b border-slate-700">
            <CardTitle className="flex items-center text-white p-1 -mt-4 -ml-4 text-xs">
              <Filter className="w-3 h-3 mr-1" />
              Búsqueda de Proveedores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 -mt-6 -mb-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Nombre, CUIT, teléfono, dirección..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de proveedores */}
        <LoadingOverlay loading={loading} text="Cargando proveedores...">
          <Card className="bg-slate-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Proveedores ({filteredSuppliers.length})
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
                      <th className="text-center py-3 px-4 font-medium text-white">CUIT</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Nombre</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Teléfono</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Dirección</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-slate-600">{supplier.cuit || "-"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="font-medium text-slate-900">{supplier.nombre}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="text-slate-600">{supplier.telefono || "-"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="text-slate-600 truncate max-w-xs">{supplier.direccion || "-"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditSupplier(supplier)}
                              className="border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteSupplier(supplier)}>
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
                    <Truck className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 mb-2">No se encontraron proveedores</p>
                    <p className="text-sm text-slate-500">
                      {searchTerm ? "Intenta ajustar la búsqueda" : "Comienza agregando tu primer proveedor"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </LoadingOverlay>

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
    </Layout>
  )
}

export default Proveedores
