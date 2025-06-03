"use client"

import { useState, useMemo, useRef } from "react"
import Layout from "../components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Package, Search, Plus, Edit, Trash2, AlertTriangle, Filter, Eye, RefreshCw, X, Barcode } from "lucide-react"
import { formatCurrency, calculateSalePrice } from "../lib/utils"
import ProductModal from "../components/stock/ProductModal"
import StockMovementModal from "../components/stock/StockMovementModal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import ProductDetailsModal from "../components/stock/ProductDetailsModal"
import BarcodeModal from "../components/barcode/BarcodeModal"
import { Loading, LoadingOverlay } from "../components/ui/loading"
import { useProducts } from "../hooks/useProducts"
import { useCategories } from "../hooks/useCategories"
import { useConfig } from "../hooks/useConfig"
import { useStockMovements } from "../hooks/useStockMovements"
import { toast } from "react-toastify"

const STOCK_STATUS = [
  { value: "todos", label: "Todos los productos" },
  { value: "disponible", label: "Con stock disponible" },
  { value: "bajo", label: "Stock bajo" },
  { value: "agotado", label: "Sin stock" },
]

const Stock = () => {
  // Estados locales para filtros y UI
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [selectedStockStatus, setSelectedStockStatus] = useState("todos")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [sortBy, setSortBy] = useState("nombre")
  const [sortOrder, setSortOrder] = useState("asc")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isStockMovementModalOpen, setIsStockMovementModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] = useState(false)
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null)
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false)
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState(null)

  // Ref para el input de búsqueda
  const searchInputRef = useRef(null)

  // Hooks personalizados
  const {
    products,
    loading: productsLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByCode,
    fetchProducts,
  } = useProducts()
  const { categories, loading: categoriesLoading } = useCategories()
  const { config, loading: configLoading } = useConfig()
  const { createStockMovement } = useStockMovements()

  // Filtrar y ordenar productos localmente
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // Filtro por búsqueda
      const matchesSearch =
        product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.marca.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por categoría
      const matchesCategory = selectedCategory === "Todos" || product.categoria === selectedCategory

      // Filtro por estado de stock
      let matchesStock = true
      switch (selectedStockStatus) {
        case "disponible":
          matchesStock = product.stock > 0
          break
        case "bajo":
          matchesStock = product.stock <= (product.stock_minimo || 5) && product.stock > 0
          break
        case "agotado":
          matchesStock = product.stock === 0
          break
      }

      // Filtro por rango de precios
      const matchesPrice =
        (!priceRange.min || product.precioCosto >= Number(priceRange.min)) &&
        (!priceRange.max || product.precioCosto <= Number(priceRange.max))

      return matchesSearch && matchesCategory && matchesStock && matchesPrice
    })

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [products, searchTerm, selectedCategory, selectedStockStatus, priceRange, sortBy, sortOrder])

  // Preparar categorías para el select
  const categoryOptions = useMemo(() => {
    const categoryNames = ["Todos", ...categories.map((cat) => cat.nombre)]
    return categoryNames
  }, [categories])

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsEditing(false)
    setIsProductModalOpen(true)
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setIsEditing(true)
    setIsProductModalOpen(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      await deleteProduct(productId)
    }
  }

  const handleStockMovement = (product) => {
    setSelectedProduct(product)
    setIsStockMovementModalOpen(true)
  }

  const handleSaveProduct = async (productData) => {
    let result
    if (isEditing) {
      result = await updateProduct(selectedProduct.id, productData)
    } else {
      result = await createProduct(productData)
    }

    if (result.success) {
      setIsProductModalOpen(false)
    }
  }

  const handleStockUpdate = async (productId, newStock, movement) => {
    const movementData = {
      productId: productId,
      tipo: movement.type,
      cantidad: movement.quantity,
      motivo: movement.reason,
      notas: movement.notes || "",
    }

    const result = await createStockMovement(movementData)

    if (result.success) {
      setIsStockMovementModalOpen(false)
      // Recargar productos para obtener el stock actualizado
      await fetchProducts()
    }
  }

  const getStockStatusColor = (product) => {
    const stockMinimo = product.stock_minimo || 5
    if (product.stock === 0) return "text-red-600 bg-red-50"
    if (product.stock <= stockMinimo) return "text-orange-600 bg-orange-50"
    return "text-green-600 bg-green-50"
  }

  const getStockStatusText = (product) => {
    const stockMinimo = product.stock_minimo || 5
    if (product.stock === 0) return "Sin stock"
    if (product.stock <= stockMinimo) return "Stock bajo"
    return "Disponible"
  }

  const handleViewDetails = (product) => {
    setSelectedProductForDetails(product)
    setIsProductDetailsModalOpen(true)
  }

  const handleBarcodeManagement = (product) => {
    setSelectedProductForBarcode(product)
    setIsBarcodeModalOpen(true)
  }

  // Función para buscar producto cuando se escanea con pistola
  const handleSearchChange = async (e) => {
    const value = e.target.value
    setSearchTerm(value)

    // Si el valor parece ser un código escaneado (más de 3 caracteres y sin espacios)
    if (value.length > 3 && !value.includes(" ")) {
      try {
        const result = await getProductByCode(value)
        if (result.success) {
          // Si encuentra el producto, mantener el término de búsqueda para mostrarlo
          toast.success(`Producto encontrado: ${result.data.nombre}`)
        }
      } catch (error) {
        // Si no encuentra el producto, no hacer nada especial
        // El usuario puede seguir escribiendo
      }
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("Todos")
    setSelectedStockStatus("todos")
    setPriceRange({ min: "", max: "" })
    setSortBy("nombre")
    setSortOrder("asc")
  }

  const handleRefresh = () => {
    fetchProducts()
  }

  // Loading state
  if (productsLoading && products.length === 0) {
    return (
      <Layout>
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading text="Cargando productos..." size="lg" />
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
            <h1 className="text-3xl font-bold text-slate-900">Gestión de Stock</h1>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleAddProduct} className="flex items-center bg-slate-800 hover:bg-slate-700">
              <Plus className="w-4 h-4" />
              Nuevo Producto
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Búsqueda */}
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="search" className="text-sm font-medium text-white">
                    Buscar productos
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      ref={searchInputRef}
                      id="search"
                      placeholder="Código, nombre, marca..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}     // solo actualiza estado
                      onKeyDown={async e => {
                        if (e.key === "Enter" && searchTerm.length > 3 && !searchTerm.includes(" ")) {
                          try {
                            const result = await getProductByCode(searchTerm)
                            if (result.success) {
                              toast.success(`Producto encontrado: ${result.data.nombre}`)
                            }
                          } catch {
                            toast.error("No existe ese código")
                          }
                        }
                      }}
                      className="pl-10 h-11 …"
                      autoComplete="off"
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-white">
                    Categoría
                  </Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={categoriesLoading}>
                    <SelectTrigger className="h-11 border-slate-300 focus:border-slate-500">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Estado de stock */}
                <div className="space-y-2">
                  <Label htmlFor="stockStatus" className="text-sm font-medium text-white">
                    Estado de Stock
                  </Label>
                  <Select value={selectedStockStatus} onValueChange={setSelectedStockStatus}>
                    <SelectTrigger className="h-11 border-slate-300 focus:border-slate-500">
                      <SelectValue placeholder="Estado de stock" />
                    </SelectTrigger>
                    <SelectContent>
                      {STOCK_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenar por y Limpiar filtros */}
                <div className="space-y-2">
                  <Label htmlFor="sortBy" className="text-sm font-medium text-white">
                    Ordenar por
                  </Label>
                  <div className="flex space-x-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-11 border-slate-300 focus:border-slate-500 flex-1">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nombre">Nombre</SelectItem>
                        <SelectItem value="codigo">Código</SelectItem>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="precioCosto">Precio</SelectItem>
                        <SelectItem value="categoria">Categoría</SelectItem>
                        <SelectItem value="marca">Marca</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={clearFilters}
                      className="h-11 w-11 border-slate-300 text-slate-700 hover:bg-slate-50 shrink-0"
                      title="Limpiar filtros"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de productos */}
        <LoadingOverlay loading={productsLoading} text="Cargando productos...">
          <Card className="bg-slate-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Productos ({filteredProducts.length})
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={productsLoading}>
                    <RefreshCw className={`w-4 h-4 ${productsLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full bg-white">
                  <thead>
                    <tr className="bg-slate-800">
                      <th className="text-center py-3 px-4 font-medium text-white">Código</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Producto</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Categoría</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Marca</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Stock</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Precio Costo</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Precio Venta</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Estado</th>
                      <th className="text-center py-3 px-4 font-medium text-white">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const precioVenta = calculateSalePrice(
                        product.precioCosto,
                        config.rentabilidad || 40,
                        config.iva || 21,
                        config.ingresosBrutos || 0,
                      )

                      return (
                        <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <span className="font-mono text-sm font-medium">{product.codigo}</span>
                              {product.tieneCodigoBarras ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBarcodeManagement(product)}
                                  className="p-1"
                                  title="Ver código de barras"
                                >
                                  <Barcode className="w-3 h-3" />
                                </Button>
                              ) : null}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div>
                              <p className="font-medium text-slate-900">{product.nombre}</p>
                              <p className="text-sm text-slate-600 truncate max-w-xs">{product.descripcion}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              {product.categoria}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-center">{product.marca}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center space-x-2">
                              <span className="font-medium">{product.stock}</span>
                              {product.stock <= (product.stock_minimo || 5) && product.stock > 0 && (
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-center">{formatCurrency(product.precioCosto)}</td>
                          <td className="py-3 px-4 font-medium text-green-600 text-center">
                            {formatCurrency(precioVenta)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(
                                product,
                              )}`}
                            >
                              {getStockStatusText(product)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleStockMovement(product)}>
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(product)}
                                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {filteredProducts.length === 0 && !productsLoading && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600 mb-2">No se encontraron productos</p>
                    <p className="text-sm text-slate-500">Intenta ajustar los filtros o agregar nuevos productos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </LoadingOverlay>

        {/* Modales */}
        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSave={handleSaveProduct}
          product={selectedProduct}
          isEditing={isEditing}
          categories={categories}
          config={config}
        />

        <StockMovementModal
          isOpen={isStockMovementModalOpen}
          onClose={() => setIsStockMovementModalOpen(false)}
          product={selectedProduct}
          onStockUpdate={handleStockUpdate}
        />

        <ProductDetailsModal
          isOpen={isProductDetailsModalOpen}
          onClose={() => setIsProductDetailsModalOpen(false)}
          product={selectedProductForDetails}
          onEdit={handleEditProduct}
          onStockMovement={handleStockMovement}
          onDelete={handleDeleteProduct}
          config={config}
        />

        <BarcodeModal
          isOpen={isBarcodeModalOpen}
          onClose={() => setIsBarcodeModalOpen(false)}
          product={selectedProductForBarcode}
        />
      </div>
    </Layout>
  )
}

export default Stock
