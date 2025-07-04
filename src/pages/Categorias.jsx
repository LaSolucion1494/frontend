"use client"

import { useState, useMemo } from "react"
import Layout from "../components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Tag, Search, Plus, Edit, Trash2, RefreshCw, Filter, Package } from "lucide-react"
import CategoryModal from "../components/categories/CategoryModal"
import DeleteCategoryModal from "../components/categories/DeleteCategoryModal"
import { Loading, LoadingOverlay } from "../components/ui/loading"
import { useCategories } from "../hooks/useCategories"

const Categorias = () => {
  // Estados locales para filtros y UI
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Estados para el modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  // Hook personalizado para categorías
  const { categories, loading, createCategory, updateCategory, deleteCategory, fetchCategories } = useCategories()

  // Filtrar categorías localmente
  const filteredCategories = useMemo(() => {
    const filtered = categories.filter((category) => {
      // Filtro por búsqueda
      const matchesSearch =
        category.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })

    return filtered
  }, [categories, searchTerm])

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setIsEditing(false)
    setIsCategoryModalOpen(true)
  }

  const handleEditCategory = (category) => {
    setSelectedCategory(category)
    setIsEditing(true)
    setIsCategoryModalOpen(true)
  }

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async (categoryId) => {
    const result = await deleteCategory(categoryId)
    if (result.success) {
      setIsDeleteModalOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setCategoryToDelete(null)
  }

  const handleSaveCategory = async (categoryData) => {
    let result
    if (isEditing) {
      result = await updateCategory(selectedCategory.id, categoryData)
    } else {
      result = await createCategory(categoryData)
    }

    if (result.success) {
      setIsCategoryModalOpen(false)
    }
  }

  const handleRefresh = () => {
    fetchCategories()
  }

  // Loading state
  if (loading && categories.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <Loading text="Cargando categorías..." size="lg" />
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
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Categorías</h1>
                <p className="text-muted-foreground mt-2">
                  Organiza tus productos en categorías para facilitar la navegación y gestión del inventario
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
                <Button onClick={handleAddCategory} disabled={loading} className="bg-slate-800 hover:bg-slate-900">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Categoría
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Búsqueda de Categorías
              </CardTitle>
              <CardDescription>Encuentra categorías por nombre o descripción</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 -mt-3">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Nombre o descripción..."
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

          {/* Tabla de categorías */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Lista de Categorías
                  </CardTitle>
                  <CardDescription>
                    {filteredCategories.length}{" "}
                    {filteredCategories.length === 1 ? "categoría encontrada" : "categorías encontradas"}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="w-fit">
                  Total: {categories.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="-mt-3">
              <LoadingOverlay loading={loading} text="Cargando categorías...">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr className="border-b">
                        <th className="text-slate-100 text-left py-3 px-4 font-medium text-muted-foreground">
                          Categoría
                        </th>
                        <th className="text-slate-100 text-left py-3 px-4 font-medium text-muted-foreground">
                          Descripción
                        </th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium text-muted-foreground">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map((category) => (
                        <tr key={category.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{category.nombre}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm max-w-md truncate">
                                {category.descripcion || (
                                  <span className="text-muted-foreground italic">Sin descripción</span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditCategory(category)}
                                className="h-8 w-8 p-0"
                                title="Editar categoría"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCategory(category)}
                                className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                title="Eliminar categoría"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredCategories.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No se encontraron categorías</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm
                          ? "Intenta ajustar los criterios de búsqueda"
                          : "Comienza agregando tu primera categoría"}
                      </p>
                      {!searchTerm && (
                        <Button onClick={handleAddCategory} className="mt-2">
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Primera Categoría
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </LoadingOverlay>
            </CardContent>
          </Card>

          {/* Modal de categoría */}
          <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            onSave={handleSaveCategory}
            category={selectedCategory}
            isEditing={isEditing}
            loading={loading}
          />

          {/* Modal de confirmación de eliminación */}
          <DeleteCategoryModal
            isOpen={isDeleteModalOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            category={categoryToDelete}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Categorias
