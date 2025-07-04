"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import Layout from "../components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Filter,
  Eye,
  RefreshCw,
  X,
  Barcode,
  TrendingUp,
  TrendingDown,
  Layers,
  ScanLine,
  FilterX,
} from "lucide-react"
import { formatCurrency } from "../lib/utils"
import ProductModal from "../components/stock/ProductModal"
import StockMovementModal from "../components/stock/StockMovementModal"
import DeleteProductModal from "../components/stock/DeleteProductModal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import ProductDetailsModal from "../components/stock/ProductDetailsModal"
import BarcodeModal from "../components/barcode/BarcodeModal"
import { Loading, LoadingOverlay } from "../components/ui/loading"
import { useProducts } from "../hooks/useProducts"
import { useCategories } from "../hooks/useCategories"
import { useConfig } from "../hooks/useConfig"
import { useStockMovements } from "../hooks/useStockMovements"
import { toast } from "react-toastify"
import { NumericFormat } from "react-number-format"

const STOCK_STATUS = [
  { value: "todos", label: "Todos los productos" },
  { value: "disponible", label: "Con stock disponible" },
  { value: "bajo", label: "Stock bajo" },
  { value: "agotado", label: "Sin stock" },
]

const SORT_OPTIONS = [
  { value: "nombre", label: "Nombre" },
  { value: "stock", label: "Stock" },
  { value: "precio_costo", label: "Precio Costo" },
  { value: "precio_venta", label: "Precio Venta" },
]

const Stock = () => {
  // Estados locales para filtros y UI
  const [searchByCode, setSearchByCode] = useState("")
  const [searchByNameBrand, setSearchByNameBrand] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [selectedStockStatus, setSelectedStockStatus] = useState("todos")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [appliedPriceRange, setAppliedPriceRange] = useState({ min: "", max: "" })
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isStockMovementModalOpen, setIsStockMovementModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isProductDetailsModalOpen, setIsProductDetailsModalOpen] = useState(false)
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null)
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false)
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Estados para el modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  // Estados para debounce de búsqueda
  const [debouncedSearchCode, setDebouncedSearchCode] = useState("")
  const [debouncedSearchNameBrand, setDebouncedSearchNameBrand] = useState("")

  // Refs para los inputs de búsqueda
  const searchCodeInputRef = useRef(null)
  const searchNameBrandInputRef = useRef(null)
  const debounceTimerRef = useRef(null)

  // Hooks personalizados
  const {
    products,
    loading: productsLoading,
    sortConfig,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByCode,
    fetchProducts,
    updateSorting,
    resetSorting,
  } = useProducts()
  const { categories, loading: categoriesLoading } = useCategories()
  const { config, loading: configLoading } = useConfig()
  const { createStockMovements } = useStockMovements()

  // Debounce para búsquedas de texto
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchCode(searchByCode)
      setDebouncedSearchNameBrand(searchByNameBrand)
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchByCode, searchByNameBrand])

  // Preparar categorías para el select
  const categoryOptions = useMemo(() => {
    const categoryNames = ["Todos", ...categories.map((cat) => cat.nombre)]
    return categoryNames
  }, [categories])

  // Construir filtros para enviar al backend
  const buildFilters = useMemo(() => {
    const backendFilters = {
      sortBy: sortConfig.sortBy,
      sortOrder: sortConfig.sortOrder,
    }

    // Combinar búsquedas en un solo campo 'search'
    const searchTerms = []
    if (debouncedSearchCode.trim()) searchTerms.push(debouncedSearchCode.trim())
    if (debouncedSearchNameBrand.trim()) searchTerms.push(debouncedSearchNameBrand.trim())
    if (searchTerms.length > 0) {
      backendFilters.search = searchTerms.join(" ")
    }

    // Otros filtros
    if (selectedCategory !== "Todos") {
      backendFilters.categoria = selectedCategory
    }
    if (selectedStockStatus !== "todos") {
      backendFilters.stockStatus = selectedStockStatus
    }
    if (appliedPriceRange.min) {
      backendFilters.minPrice = appliedPriceRange.min
    }
    if (appliedPriceRange.max) {
      backendFilters.maxPrice = appliedPriceRange.max
    }

    return backendFilters
  }, [
    debouncedSearchCode,
    debouncedSearchNameBrand,
    selectedCategory,
    selectedStockStatus,
    appliedPriceRange,
    sortConfig.sortBy,
    sortConfig.sortOrder,
  ])

  // Efecto para actualizar productos cuando cambien los filtros
  useEffect(() => {
    fetchProducts(buildFilters)
  }, [buildFilters, fetchProducts])

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

  const handleDeleteProduct = (product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async (productId) => {
    const result = await deleteProduct(productId)
    if (result.success) {
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
      // Recargar productos después de eliminar
      fetchProducts(buildFilters)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setProductToDelete(null)
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
      // Recargar productos después de guardar
      fetchProducts(buildFilters)
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

    const result = await createStockMovements(movementData)

    if (result.success) {
      setIsStockMovementModalOpen(false)
      // Recargar productos para obtener el stock actualizado
      fetchProducts(buildFilters)
    }
  }

  const getStockStatusColor = (product) => {
    const stockMinimo = product.stock_minimo || 5
    if (product.stock === 0) return "border-red-200 text-red-700 bg-red-50"
    if (product.stock <= stockMinimo) return "border-orange-200 text-orange-700 bg-orange-50"
    return "border-green-200 text-green-700 bg-green-50"
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

  // Función para búsqueda por código
  const handleCodeSearchChange = async (e) => {
    const value = e.target.value
    setSearchByCode(value)

    // Si el valor parece ser un código escaneado (más de 3 caracteres y sin espacios)
    if (value.length > 3 && !value.includes(" ")) {
      try {
        const result = await getProductByCode(value)
        if (result.success) {
          toast.success(`Producto encontrado: ${result.data.nombre}`)
        }
      } catch (error) {
        // Si no encuentra el producto, no hacer nada especial
      }
    }
  }

  // Función para búsqueda por nombre/marca
  const handleNameBrandSearchChange = (e) => {
    const value = e.target.value
    setSearchByNameBrand(value)
  }

  // Función para limpiar búsqueda por código
  const clearCodeSearch = () => {
    setSearchByCode("")
    setDebouncedSearchCode("")
    if (searchCodeInputRef.current) {
      searchCodeInputRef.current.focus()
    }
  }

  // Función para limpiar búsqueda por nombre/marca
  const clearNameBrandSearch = () => {
    setSearchByNameBrand("")
    setDebouncedSearchNameBrand("")
    if (searchNameBrandInputRef.current) {
      searchNameBrandInputRef.current.focus()
    }
  }

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setSearchByCode("")
    setSearchByNameBrand("")
    setDebouncedSearchCode("")
    setDebouncedSearchNameBrand("")
    setSelectedCategory("Todos")
    setSelectedStockStatus("todos")
    setPriceRange({ min: "", max: "" })
    setAppliedPriceRange({ min: "", max: "" })
    resetSorting()
  }

  const handleRefresh = () => {
    fetchProducts(buildFilters)
  }

  // Función para cambiar el ordenamiento
  const handleSortByChange = (newSortBy) => {
    updateSorting(newSortBy, sortConfig.sortOrder)
  }

  // Función para cambiar el orden (asc/desc)
  const handleSortOrderToggle = () => {
    const newOrder = sortConfig.sortOrder === "asc" ? "desc" : "asc"
    updateSorting(sortConfig.sortBy, newOrder)
  }

  // Obtener el label del campo de ordenamiento actual
  const getCurrentSortLabel = () => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sortConfig.sortBy)
    return option ? option.label : "Nombre"
  }

  // Funciones para manejar el rango de precios con formato argentino
  const handleMinPriceChange = (values) => {
    const { floatValue } = values
    setPriceRange((prev) => ({ ...prev, min: floatValue || "" }))
  }

  const handleMaxPriceChange = (values) => {
    const { floatValue } = values
    setPriceRange((prev) => ({ ...prev, max: floatValue || "" }))
  }

  // Función para aplicar filtros de precio manualmente
  const applyPriceFilters = useCallback(() => {
    setAppliedPriceRange({ ...priceRange })
  }, [priceRange])

  // Función para aplicar filtros de precio al presionar Enter
  const handlePriceKeyDown = (e) => {
    if (e.key === "Enter") {
      applyPriceFilters()
    }
  }

  // Función para aplicar filtros de precio al perder el foco
  const handlePriceBlur = () => {
    applyPriceFilters()
  }

  // Verificar si hay cambios pendientes en los filtros de precio
  const hasPendingPriceChanges = useMemo(() => {
    return priceRange.min !== appliedPriceRange.min || priceRange.max !== appliedPriceRange.max
  }, [priceRange, appliedPriceRange])

  // Loading state
  if (productsLoading && products.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <Loading text="Cargando productos..." size="lg" />
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
                <h1 className="text-3xl font-bold tracking-tight">Gestión de Stock</h1>
                <p className="text-muted-foreground mt-2">
                  Administra tu inventario, controla stock y gestiona precios de productos
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" disabled={productsLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${productsLoading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
                <Button
                  onClick={handleAddProduct}
                  disabled={productsLoading}
                  className="bg-slate-800 hover:bg-slate-900"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
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
              <CardDescription>Busca productos por código (compatible con escáner) o por nombre/marca</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Búsquedas principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Input para búsqueda por código */}
                  <div className="space-y-2">
                    <Label htmlFor="searchCode">Buscar por código</Label>
                    <div className="relative">
                      <ScanLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        ref={searchCodeInputRef}
                        id="searchCode"
                        placeholder="Código del producto..."
                        value={searchByCode}
                        onChange={handleCodeSearchChange}
                        onKeyDown={async (e) => {
                          if (e.key === "Enter" && searchByCode.length > 0) {
                            try {
                              const result = await getProductByCode(searchByCode)
                              if (result.success) {
                                toast.success(`Producto encontrado: ${result.data.nombre}`)
                              }
                            } catch {
                              toast.error("No existe ese código")
                            }
                          }
                        }}
                        className="pl-10 pr-10 border-slate-800"
                        autoComplete="off"
                      />
                      {searchByCode && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          onClick={clearCodeSearch}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Input para búsqueda por nombre/marca */}
                  <div className="space-y-2">
                    <Label htmlFor="searchNameBrand">Buscar por nombre/marca</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        ref={searchNameBrandInputRef}
                        id="searchNameBrand"
                        placeholder="Nombre, marca, descripción..."
                        value={searchByNameBrand}
                        onChange={handleNameBrandSearchChange}
                        className="pl-10 pr-10 border-slate-800"
                        autoComplete="off"
                      />
                      {searchByNameBrand && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          onClick={clearNameBrandSearch}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={categoriesLoading}>
                      <SelectTrigger className="border-slate-800">
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

                  <div className="space-y-2">
                    <Label htmlFor="stockStatus">Estado de Stock</Label>
                    <Select value={selectedStockStatus} onValueChange={setSelectedStockStatus}>
                      <SelectTrigger className="border-slate-800">
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
                </div>

                {/* Filtros avanzados */}
                <div className="flex items-center gap-2">
                  <Button
                    className="border-slate-800"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros avanzados
                  </Button>
                  {(debouncedSearchCode ||
                    debouncedSearchNameBrand ||
                    selectedCategory !== "Todos" ||
                    selectedStockStatus !== "todos" ||
                    appliedPriceRange.min ||
                    appliedPriceRange.max) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>

                {showAdvancedFilters && (
                  <div className="border-t pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sortBy">Ordenar por</Label>
                        <Select value={sortConfig.sortBy} onValueChange={handleSortByChange}>
                          <SelectTrigger className="border-slate-800">
                            <SelectValue placeholder="Ordenar por" />
                          </SelectTrigger>
                          <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priceMin">Precio mínimo</Label>
                        <NumericFormat
                          id="priceMin"
                          value={priceRange.min || ""}
                          onValueChange={handleMinPriceChange}
                          onKeyDown={handlePriceKeyDown}
                          onBlur={handlePriceBlur}
                          thousandSeparator="."
                          decimalSeparator=","
                          prefix="$ "
                          decimalScale={2}
                          fixedDecimalScale={false}
                          allowNegative={false}
                          placeholder="$ 0"
                          className="flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-slate-800"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priceMax">Precio máximo</Label>
                        <NumericFormat
                          id="priceMax"
                          value={priceRange.max || ""}
                          onValueChange={handleMaxPriceChange}
                          onKeyDown={handlePriceKeyDown}
                          onBlur={handlePriceBlur}
                          thousandSeparator="."
                          decimalSeparator=","
                          prefix="$ "
                          decimalScale={2}
                          fixedDecimalScale={false}
                          allowNegative={false}
                          placeholder="$ 999.999"
                          className="flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-slate-800"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <Button
                          onClick={applyPriceFilters}
                          disabled={!hasPendingPriceChanges}
                          className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
                          size="sm"
                        >
                          <FilterX className="w-4 h-4 mr-2" />
                          Aplicar Precios
                        </Button>
                      </div>
                    </div>

                    {/* Indicador de cambios pendientes */}
                    {hasPendingPriceChanges && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-amber-800">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">Hay cambios pendientes en los filtros de precio.</span>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">
                          Presiona Enter, sal del campo o haz clic en "Aplicar Precios" para aplicar los filtros.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Filtros activos */}
                {(debouncedSearchCode ||
                  debouncedSearchNameBrand ||
                  selectedCategory !== "Todos" ||
                  selectedStockStatus !== "todos" ||
                  appliedPriceRange.min ||
                  appliedPriceRange.max) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {debouncedSearchCode && (
                      <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800">
                        <ScanLine className="w-3 h-3" />
                        Código: "{debouncedSearchCode}"
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={clearCodeSearch}
                        >
                          <X className="w-2 h-2" />
                        </Button>
                      </Badge>
                    )}
                    {debouncedSearchNameBrand && (
                      <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                        <Search className="w-3 h-3" />
                        Nombre/Marca: "{debouncedSearchNameBrand}"
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={clearNameBrandSearch}
                        >
                          <X className="w-2 h-2" />
                        </Button>
                      </Badge>
                    )}
                    {selectedCategory !== "Todos" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        Categoría: {selectedCategory}
                      </Badge>
                    )}
                    {selectedStockStatus !== "todos" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Estado: {STOCK_STATUS.find((s) => s.value === selectedStockStatus)?.label}
                      </Badge>
                    )}
                    {(appliedPriceRange.min || appliedPriceRange.max) && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <span>
                          Precio: {appliedPriceRange.min ? formatCurrency(appliedPriceRange.min) : "$ 0"} -{" "}
                          {appliedPriceRange.max ? formatCurrency(appliedPriceRange.max) : "∞"}
                        </span>
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabla de productos */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Lista de Productos
                  </CardTitle>
                  <CardDescription>
                    {products.length} producto{products.length !== 1 ? "s" : ""} encontrado
                    {products.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>Ordenado por: {getCurrentSortLabel()}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSortOrderToggle}
                    className="flex items-center gap-1 border-slate-800"
                  >
                    {sortConfig.sortOrder === "asc" ? (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        Ascendente
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4" />
                        Descendente
                      </>
                    )}
                  </Button>
                  <Badge variant="outline" className="w-fit">
                    Total: {products.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="-mt-3">
              <LoadingOverlay loading={productsLoading} text="Cargando productos...">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr className="border-b">
                        <th className="text-slate-100 text-left py-3 px-4 font-medium text-muted-foreground">Código</th>
                        <th className="text-slate-100 text-left py-3 px-4 font-medium text-muted-foreground">
                          Producto
                        </th>
                        <th className="text-slate-100 text-left py-3 px-4 font-medium text-muted-foreground">
                          Categoría
                        </th>
                        <th className="text-slate-100 text-left py-3 px-4 font-medium text-muted-foreground">Marca</th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium text-muted-foreground">
                          Stock
                        </th>
                        <th className="text-slate-100 text-right py-3 px-4 font-medium text-muted-foreground">
                          Precio Costo
                        </th>
                        <th className="text-slate-100 text-right py-3 px-4 font-medium text-muted-foreground">
                          Precio Venta
                        </th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium text-muted-foreground">
                          Estado
                        </th>
                        <th className="text-slate-100 text-center py-3 px-4 font-medium text-muted-foreground">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const precioCosto = product.precio_costo || 0
                        const precioVenta = product.precio_venta || 0

                        return (
                          <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium">{product.codigo}</span>
                                {product.tieneCodigoBarras ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBarcodeManagement(product)}
                                    className="h-6 w-6 p-0"
                                    title="Ver código de barras"
                                  >
                                    <Barcode className="w-3 h-3" />
                                  </Button>
                                ) : null}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{product.nombre}</p>
                                {product.descripcion && product.descripcion !== "Sin Descripción" && (
                                  <p className="text-sm text-muted-foreground truncate max-w-xs">
                                    {product.descripcion}
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <Badge variant="secondary" className="text-xs">
                                {product.categoria}
                              </Badge>
                            </td>

                            <td className="py-3 px-4 text-muted-foreground">
                              {product.marca && product.marca !== "Sin Marca" ? product.marca : "-"}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className="font-medium">{product.stock}</span>
                                {product.stock <= (product.stock_minimo || 5) && product.stock > 0 && (
                                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4 text-right font-medium">{formatCurrency(precioCosto)}</td>

                            <td className="py-3 px-4 text-right font-medium text-green-600">
                              {formatCurrency(precioVenta)}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <Badge variant="outline" className={getStockStatusColor(product)}>
                                {getStockStatusText(product)}
                              </Badge>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(product)}
                                  className="h-8 w-8 p-0"
                                  title="Ver detalles"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditProduct(product)}
                                  className="h-8 w-8 p-0"
                                  title="Editar producto"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStockMovement(product)}
                                  className="h-8 w-8 p-0 border-blue-200 text-blue-600 hover:bg-blue-50"
                                  title="Movimiento de stock"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteProduct(product)}
                                  className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                  title="Eliminar producto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {products.length === 0 && !productsLoading && (
                    <div className="text-center py-16">
                      <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No se encontraron productos</h3>
                      <p className="text-muted-foreground mb-4">
                        {debouncedSearchCode ||
                        debouncedSearchNameBrand ||
                        selectedCategory !== "Todos" ||
                        selectedStockStatus !== "todos" ||
                        appliedPriceRange.min ||
                        appliedPriceRange.max
                          ? "Intenta ajustar los filtros de búsqueda"
                          : "Comienza agregando tu primer producto"}
                      </p>
                      {!debouncedSearchCode &&
                        !debouncedSearchNameBrand &&
                        selectedCategory === "Todos" &&
                        selectedStockStatus === "todos" &&
                        !appliedPriceRange.min &&
                        !appliedPriceRange.max && (
                          <Button onClick={handleAddProduct} className="mt-2">
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Primer Producto
                          </Button>
                        )}
                    </div>
                  )}
                </div>
              </LoadingOverlay>
            </CardContent>
          </Card>

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

          {/* Modal de confirmación de eliminación */}
          <DeleteProductModal
            isOpen={isDeleteModalOpen}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
            product={productToDelete}
            loading={productsLoading}
          />
        </div>
      </div>
    </Layout>
  ) 
}

export default Stock
