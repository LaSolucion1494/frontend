"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
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
  ChevronUp,
  ChevronDown,
  History,
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
import Pagination from "../components/ui/Pagination"

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
  const navigate = useNavigate()

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
  const [showFilterCard, setShowFilterCard] = useState(false)

  // Estados para el modal de eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  // Estados para búsqueda mejorada - OPTIMIZADO PARA MANTENER FOCO
  const [searchResults, setSearchResults] = useState([])
  const [isSearchActive, setIsSearchActive] = useState(false)

  // Refs para los inputs de búsqueda
  const searchCodeInputRef = useRef(null)
  const searchNameBrandInputRef = useRef(null)

  // Refs para debounce - SIN ESTADOS DE LOADING QUE CAUSEN RE-RENDERS
  const codeSearchTimeoutRef = useRef(null)
  const nameSearchTimeoutRef = useRef(null)

  // Hooks personalizados
  const {
    products,
    loading: productsLoading,
    pagination,
    sortConfig,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByCode,
    fetchProducts,
    updateSorting,
    resetSorting,
    updateFilters,
    searchProducts, // Usar la función de búsqueda del hook
    handlePageChange,
  } = useProducts()
  const { categories, loading: categoriesLoading } = useCategories()
  const { config } = useConfig()
  const { createStockMovement } = useStockMovements()

  // NUEVA FUNCIÓN DE BÚSQUEDA MEJORADA - SIN CAMBIOS DE LOADING STATE
  const handleCodeSearch = useCallback(
    async (searchTerm) => {
      if (!searchTerm.trim()) {
        setSearchResults([])
        setIsSearchActive(false)
        // Si no hay término, usar fetchProducts normal con filtros actuales
        const filters = {
          search: "",
          categoria: selectedCategory !== "Todos" ? selectedCategory : "",
          stockStatus: selectedStockStatus,
          minPrice: appliedPriceRange.min || "",
          maxPrice: appliedPriceRange.max || "",
          offset: 0,
        }
        updateFilters(filters)
        return
      }

      try {
        console.log("Buscando por código en stock:", searchTerm)
        setIsSearchActive(true)

        const searchResult = await searchProducts(searchTerm.trim(), {
          limit: pagination.itemsPerPage || 10,
          offset: 0,
        })

        console.log("Resultado búsqueda código en stock:", searchResult)

        if (searchResult.success) {
          // Filtrar y priorizar coincidencias de código
          const codeMatches = searchResult.data
            .filter((product) => product.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
              // Priorizar coincidencias exactas
              const aExact = a.codigo.toLowerCase() === searchTerm.toLowerCase()
              const bExact = b.codigo.toLowerCase() === searchTerm.toLowerCase()
              if (aExact && !bExact) return -1
              if (!aExact && bExact) return 1

              // Luego priorizar coincidencias que empiecen con el término
              const aStarts = a.codigo.toLowerCase().startsWith(searchTerm.toLowerCase())
              const bStarts = b.codigo.toLowerCase().startsWith(searchTerm.toLowerCase())
              if (aStarts && !bStarts) return -1
              if (!aStarts && bStarts) return 1

              return 0
            })

          console.log("Coincidencias de código encontradas en stock:", codeMatches.length)
          setSearchResults(codeMatches)

          // Si hay coincidencia exacta, mostrar toast
          const exactMatch = codeMatches.find((p) => p.codigo.toLowerCase() === searchTerm.toLowerCase())
          if (exactMatch) {
            toast.success(`Producto encontrado: ${exactMatch.nombre}`)
          }
        } else {
          console.error("Error en búsqueda por código en stock:", searchResult.message)
          setSearchResults([])
        }
      } catch (error) {
        console.error("Error en búsqueda por código en stock:", error)
        setSearchResults([])
      }
    },
    [searchProducts, selectedCategory, selectedStockStatus, appliedPriceRange, pagination.itemsPerPage, updateFilters],
  )

  const handleNameSearch = useCallback(
    async (searchTerm) => {
      if (!searchTerm.trim()) {
        setSearchResults([])
        setIsSearchActive(false)
        // Si no hay término, usar fetchProducts normal con filtros actuales
        const filters = {
          search: "",
          categoria: selectedCategory !== "Todos" ? selectedCategory : "",
          stockStatus: selectedStockStatus,
          minPrice: appliedPriceRange.min || "",
          maxPrice: appliedPriceRange.max || "",
          offset: 0,
        }
        updateFilters(filters)
        return
      }

      try {
        console.log("Buscando por nombre en stock:", searchTerm)
        setIsSearchActive(true)

        const searchResult = await searchProducts(searchTerm.trim(), {
          limit: pagination.itemsPerPage || 10,
          offset: 0,
        })

        console.log("Resultado búsqueda nombre en stock:", searchResult)

        if (searchResult.success) {
          // Filtrar productos que coincidan en nombre, descripción o marca
          const nameMatches = searchResult.data
            .filter((product) => {
              const term = searchTerm.toLowerCase()
              const matchesName = product.nombre.toLowerCase().includes(term)
              const matchesDescription = product.descripcion && product.descripcion.toLowerCase().includes(term)
              const matchesBrand = product.marca && product.marca.toLowerCase().includes(term)
              const matchesCode = product.codigo.toLowerCase().includes(term)

              return matchesName || matchesDescription || matchesBrand || matchesCode
            })
            .sort((a, b) => {
              const term = searchTerm.toLowerCase()

              // Priorizar coincidencias exactas en nombre
              const aNameExact = a.nombre.toLowerCase() === term
              const bNameExact = b.nombre.toLowerCase() === term
              if (aNameExact && !bNameExact) return -1
              if (!aNameExact && bNameExact) return 1

              // Luego priorizar nombres que empiecen con el término
              const aNameStarts = a.nombre.toLowerCase().startsWith(term)
              const bNameStarts = b.nombre.toLowerCase().startsWith(term)
              if (aNameStarts && !bNameStarts) return -1
              if (!aNameStarts && bNameStarts) return 1

              // Finalmente ordenar alfabéticamente
              return a.nombre.localeCompare(b.nombre)
            })

          console.log("Coincidencias de nombre encontradas en stock:", nameMatches.length)
          setSearchResults(nameMatches)
        } else {
          console.error("Error en búsqueda por nombre en stock:", searchResult.message)
          setSearchResults([])
        }
      } catch (error) {
        console.error("Error en búsqueda por nombre en stock:", error)
        setSearchResults([])
      }
    },
    [searchProducts, selectedCategory, selectedStockStatus, appliedPriceRange, pagination.itemsPerPage, updateFilters],
  )

  // DEBOUNCE OPTIMIZADO - SIN CAMBIOS DE LOADING STATE QUE CAUSEN RE-RENDERS
  useEffect(() => {
    // Limpiar timeout anterior
    if (codeSearchTimeoutRef.current) {
      clearTimeout(codeSearchTimeoutRef.current)
    }

    if (searchByCode.trim()) {
      codeSearchTimeoutRef.current = setTimeout(async () => {
        await handleCodeSearch(searchByCode)
      }, 200)
    } else {
      setSearchResults([])
      setIsSearchActive(false)
      // Si no hay búsqueda por código, usar filtros normales
      if (!searchByNameBrand.trim()) {
        const filters = {
          search: "",
          categoria: selectedCategory !== "Todos" ? selectedCategory : "",
          stockStatus: selectedStockStatus,
          minPrice: appliedPriceRange.min || "",
          maxPrice: appliedPriceRange.max || "",
          offset: 0,
        }
        updateFilters(filters)
      }
    }

    // Cleanup
    return () => {
      if (codeSearchTimeoutRef.current) {
        clearTimeout(codeSearchTimeoutRef.current)
      }
    }
  }, [searchByCode])

  useEffect(() => {
    // Limpiar timeout anterior
    if (nameSearchTimeoutRef.current) {
      clearTimeout(nameSearchTimeoutRef.current)
    }

    if (searchByNameBrand.trim()) {
      nameSearchTimeoutRef.current = setTimeout(async () => {
        await handleNameSearch(searchByNameBrand)
      }, 300)
    } else {
      setSearchResults([])
      setIsSearchActive(false)
      // Si no hay búsqueda por nombre, usar filtros normales
      if (!searchByCode.trim()) {
        const filters = {
          search: "",
          categoria: selectedCategory !== "Todos" ? selectedCategory : "",
          stockStatus: selectedStockStatus,
          minPrice: appliedPriceRange.min || "",
          maxPrice: appliedPriceRange.max || "",
          offset: 0,
        }
        updateFilters(filters)
      }
    }

    // Cleanup
    return () => {
      if (nameSearchTimeoutRef.current) {
        clearTimeout(nameSearchTimeoutRef.current)
      }
    }
  }, [searchByNameBrand])

  // Limpiar timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      if (codeSearchTimeoutRef.current) {
        clearTimeout(codeSearchTimeoutRef.current)
      }
      if (nameSearchTimeoutRef.current) {
        clearTimeout(nameSearchTimeoutRef.current)
      }
    }
  }, [])

  // DETERMINAR QUÉ PRODUCTOS MOSTRAR - OPTIMIZADO
  const displayProducts = useMemo(() => {
    // Si hay búsquedas activas, mostrar resultados de búsqueda
    if ((searchByCode.trim() || searchByNameBrand.trim()) && isSearchActive) {
      return searchResults
    }
    // Si no hay búsquedas, mostrar productos normales
    return products
  }, [searchByCode, searchByNameBrand, searchResults, products, isSearchActive])

  // Preparar categorías para el select
  const categoryOptions = useMemo(() => {
    const categoryNames = ["Todos", ...categories.map((cat) => cat.nombre)]
    return categoryNames
  }, [categories])

  // EFECTO PARA FILTROS NO-BÚSQUEDA (categoría, stock, precio)
  useEffect(() => {
    // Solo aplicar filtros automáticos si no hay búsquedas activas
    if (!searchByCode.trim() && !searchByNameBrand.trim()) {
      const newFilters = {
        search: "",
        categoria: selectedCategory !== "Todos" ? selectedCategory : "",
        stockStatus: selectedStockStatus,
        minPrice: appliedPriceRange.min || "",
        maxPrice: appliedPriceRange.max || "",
        offset: 0,
      }
      updateFilters(newFilters)
    }
  }, [selectedCategory, selectedStockStatus, appliedPriceRange, searchByCode, searchByNameBrand, updateFilters])

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
      // Refrescar productos para obtener el stock actualizado
      fetchProducts({ offset: 0 })
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

  // Función para búsqueda por código - MEJORADA
  const handleCodeSearchChange = async (e) => {
    const value = e.target.value
    setSearchByCode(value)

    // Limpiar búsqueda por nombre si se está buscando por código
    if (value.trim() && searchByNameBrand.trim()) {
      setSearchByNameBrand("")
    }
  }

  // Función para búsqueda por nombre/marca - MEJORADA
  const handleNameBrandSearchChange = (e) => {
    const value = e.target.value
    setSearchByNameBrand(value)

    // Limpiar búsqueda por código si se está buscando por nombre
    if (value.trim() && searchByCode.trim()) {
      setSearchByCode("")
    }
  }

  // Función para limpiar búsqueda por código - OPTIMIZADA
  const clearCodeSearch = () => {
    setSearchByCode("")
    setSearchResults([])
    setIsSearchActive(false)
    // NO CAMBIAR FOCO AQUÍ - mantener foco natural
  }

  // Función para limpiar búsqueda por nombre/marca - OPTIMIZADA
  const clearNameBrandSearch = () => {
    setSearchByNameBrand("")
    setSearchResults([])
    setIsSearchActive(false)
    // NO CAMBIAR FOCO AQUÍ - mantener foco natural
  }

  // Función para limpiar todos los filtros - OPTIMIZADA
  const clearFilters = () => {
    setSearchByCode("")
    setSearchByNameBrand("")
    setSearchResults([])
    setIsSearchActive(false)
    setSelectedCategory("Todos")
    setSelectedStockStatus("todos")
    setPriceRange({ min: "", max: "" })
    setAppliedPriceRange({ min: "", max: "" })
    resetSorting()
  }

  const handleRefresh = () => {
    // Limpiar búsquedas y recargar
    setSearchByCode("")
    setSearchByNameBrand("")
    setSearchResults([])
    setIsSearchActive(false)
    fetchProducts({ offset: 0 })
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

  // DETERMINAR ESTADO DE LOADING - SIMPLIFICADO
  const isCurrentlyLoading = productsLoading

  // Loading state
  if (productsLoading && displayProducts.length === 0) {
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
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setShowFilterCard(!showFilterCard)}
                  variant="outline"
                  disabled={isCurrentlyLoading}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilterCard ? "Ocultar Filtros" : "Mostrar Filtros"}
                  {showFilterCard ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                </Button>
                <Button
                  onClick={() => navigate("/reportes/historial-movimientos")}
                  variant="outline"
                  disabled={isCurrentlyLoading}
                >
                  <History className="w-4 h-4 mr-2" />
                  Historial de Movimientos
                </Button>
                <Button onClick={handleRefresh} variant="outline" disabled={isCurrentlyLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isCurrentlyLoading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
                <Button
                  onClick={handleAddProduct}
                  disabled={isCurrentlyLoading}
                  className="bg-slate-800 hover:bg-slate-900"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          {showFilterCard && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Búsqueda y Filtros
                  </CardTitle>
                  <Button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:bg-muted"
                    title={showAdvancedFilters ? "Ocultar filtros avanzados" : "Mostrar filtros avanzados"}
                  >
                    {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="sr-only">
                      {showAdvancedFilters ? "Ocultar filtros avanzados" : "Mostrar filtros avanzados"}
                    </span>
                  </Button>
                </div>
                <CardDescription>
                  Busca productos por código (compatible con escáner) o por nombre/marca. La búsqueda es más rápida y
                  eficiente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Búsquedas principales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Input para búsqueda por código - SIN LOADING INDICATORS */}
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
                          className="pl-10 pr-10 border-slate-800"
                          autoComplete="off"
                          disabled={isCurrentlyLoading}
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

                    {/* Input para búsqueda por nombre/marca - SIN LOADING INDICATORS */}
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
                          disabled={isCurrentlyLoading}
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
                      className="border-slate-800 bg-transparent"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros avanzados
                    </Button>
                    {(searchByCode ||
                      searchByNameBrand ||
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

                  {/* Indicador de búsqueda activa - SIMPLIFICADO */}
                  {(searchByCode.trim() || searchByNameBrand.trim()) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Search className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Búsqueda activa - Mostrando {displayProducts.length} resultado
                          {displayProducts.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        Los filtros de categoría, stock y precio no se aplican durante la búsqueda.
                      </p>
                    </div>
                  )}

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
                            <span className="text-sm font-medium">
                              Hay cambios pendientes en los filtros de precio.
                            </span>
                          </div>
                          <p className="text-xs text-amber-700 mt-1">
                            Presiona Enter, sal del campo o haz clic en "Aplicar Precios" para aplicar los filtros.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Filtros activos - MEJORADO */}
                  {(searchByCode ||
                    searchByNameBrand ||
                    selectedCategory !== "Todos" ||
                    selectedStockStatus !== "todos" ||
                    appliedPriceRange.min ||
                    appliedPriceRange.max) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {searchByCode && (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800">
                          <ScanLine className="w-3 h-3" />
                          Código: "{searchByCode}"
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
                      {searchByNameBrand && (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                          <Search className="w-3 h-3" />
                          Nombre/Marca: "{searchByNameBrand}"
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
          )}

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
                    {searchByCode.trim() || searchByNameBrand.trim() ? (
                      <>
                        {displayProducts.length} resultado{displayProducts.length !== 1 ? "s" : ""} de búsqueda
                        {isSearchActive && searchResults.length === 0 && " (buscando...)"}
                      </>
                    ) : (
                      <>
                        {pagination.totalItems} producto{pagination.totalItems !== 1 ? "s" : ""} encontrado
                        {pagination.totalItems !== 1 ? "s" : ""}
                      </>
                    )}
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
                    className="flex items-center gap-1 border-slate-800 bg-transparent"
                    disabled={searchByCode.trim() || searchByNameBrand.trim()} // Deshabilitar durante búsqueda
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
                    Total:{" "}
                    {searchByCode.trim() || searchByNameBrand.trim() ? displayProducts.length : pagination.totalItems}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="-mt-3">
              <LoadingOverlay loading={isCurrentlyLoading && displayProducts.length > 0} text="Cargando productos...">
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
                      {displayProducts.map((product) => {
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
                                {product.categoria_nombre}
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

                  {displayProducts.length === 0 && !isCurrentlyLoading && (
                    <div className="text-center py-16">
                      <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No se encontraron productos</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchByCode.trim() || searchByNameBrand.trim()
                          ? "No hay productos que coincidan con tu búsqueda"
                          : selectedCategory !== "Todos" ||
                              selectedStockStatus !== "todos" ||
                              appliedPriceRange.min ||
                              appliedPriceRange.max
                            ? "Intenta ajustar los filtros de búsqueda"
                            : "Comienza agregando tu primer producto"}
                      </p>
                      {!searchByCode.trim() &&
                        !searchByNameBrand.trim() &&
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

              {/* Componente de paginación - Solo mostrar si no hay búsqueda activa */}
              {!searchByCode.trim() && !searchByNameBrand.trim() && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.itemsPerPage}
                />
              )}
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
