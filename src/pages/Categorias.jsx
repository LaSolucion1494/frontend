"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Tag, Search, Plus, Edit, Trash2, RefreshCw, Package } from "lucide-react"
import CategoryModal from "../components/categories/CategoryModal"
import DeleteCategoryModal from "../components/categories/DeleteCategoryModal"
import { Loading, LoadingOverlay } from "../components/ui/loading"
import { useCategories } from "../hooks/useCategories"
import Pagination from "../components/ui/Pagination"

const Categorias = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  const {
    categories,
    loading,
    pagination,
    handlePageChange,
    updateFilters,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchCategories,
  } = useCategories()

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updateFilters({ search: searchTerm, offset: 0 })
    }, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm, updateFilters])

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

  const handleSaveCategory = async (categoryData) => {
    const result = isEditing
      ? await updateCategory(selectedCategory.id, categoryData)
      : await createCategory(categoryData)
    if (result.success) {
      setIsCategoryModalOpen(false)
    }
  }

  const handleRefresh = () => {
    fetchCategories({ offset: 0 })
  }

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
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Categorías</h1>
                <p className="text-muted-foreground mt-2">Organiza tus productos para una mejor gestión.</p>
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

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Búsqueda de Categorías
              </CardTitle>
              <CardDescription>Encuentra categorías por nombre o descripción.</CardDescription>
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
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Lista de Categorías
              </CardTitle>
              <CardDescription>
                {pagination.totalItems}{" "}
                {pagination.totalItems === 1 ? "categoría encontrada" : "categorías encontradas"}
              </CardDescription>
            </CardHeader>
            <CardContent className="-mt-3">
              <LoadingOverlay loading={loading && categories.length > 0} text="Actualizando...">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800 text-slate-100">
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Categoría</th>
                        <th className="text-left py-3 px-4 font-medium">Descripción</th>
                        <th className="text-center py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
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
                                disabled={category.id === 1}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCategory(category)}
                                className="h-8 w-8 p-0"
                                title="Eliminar categoría"
                                disabled={category.id === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {categories.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium">No se encontraron categorías</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm ? "Intenta con otra búsqueda." : "Agrega tu primera categoría."}
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

          <CategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            onSave={handleSaveCategory}
            category={selectedCategory}
            isEditing={isEditing}
            loading={loading}
          />
          <DeleteCategoryModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={() => handleConfirmDelete(categoryToDelete.id)}
            category={categoryToDelete}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  )
}

export default Categorias
