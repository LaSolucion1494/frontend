"use client"

import { useState, useMemo } from "react"
import Layout from "../components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Tag, Search, Plus, Edit, Trash2, RefreshCw, Filter, Package } from "lucide-react"
import CategoryModal from "../components/categories/CategoryModal"
import { Loading, LoadingOverlay } from "../components/ui/loading"
import { useCategories } from "../hooks/useCategories"

const Categorias = () => {
  // Estados locales para filtros y UI
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryName}"?`)) {
      await deleteCategory(categoryId)
    }
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
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading text="Cargando categorías..." size="lg" />
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
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Categorías</h1>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleAddCategory} className="flex items-center bg-slate-800 hover:bg-slate-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda - Compacto como en Stock */}
        <Card className="mb-5 bg-slate-800 border border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-800 border-b border-slate-700">
            <CardTitle className="flex items-center text-white p-1 -mt-4 -ml-4 text-xs">
              <Filter className="w-3 h-3 mr-1" />
              Búsqueda de Categorías
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 -mt-6 -mb-5">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Solo búsqueda */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Nombre o descripción..."
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

        {/* Tabla de categorías */}
        <LoadingOverlay loading={loading} text="Cargando categorías...">
          <Card className="bg-slate-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Categorías ({filteredCategories.length})
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
                      <th className="text-center py-3 px-4 font-medium text-white">Descripción</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr key={category.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="font-medium text-slate-900">{category.nombre}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="text-slate-600 max-w-md truncate">{category.descripcion || "-"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCategory(category)}
                              className="border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCategory(category.id, category.nombre)}
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
                    <Tag className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 mb-2">No se encontraron categorías</p>
                    <p className="text-sm text-slate-500">
                      {searchTerm ? "Intenta ajustar la búsqueda" : "Comienza agregando tu primera categoría"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </LoadingOverlay>

        {/* Modal de categoría */}
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleSaveCategory}
          category={selectedCategory}
          isEditing={isEditing}
          loading={loading}
        />
      </div>
    </Layout>
  )
}

export default Categorias
