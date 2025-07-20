"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Plus, Barcode, X, AlertTriangle, Type, ScanLine, RefreshCw } from "lucide-react"
import { useProducts } from "../../hooks/useProducts"
import SalesQuantityModal from "./SalesQuantityModal"

const ProductSelectionModal = ({ isOpen, onClose, onProductSelect, loading: externalLoading = false }) => {
  // Estado para controlar el tipo de búsqueda activa
  const [searchType, setSearchType] = useState("name") // "name" o "code"

  // Referencias para los inputs
  const codeSearchInputRef = useRef(null)
  const nameSearchInputRef = useRef(null)

  // Estados para búsqueda por código
  const [codeSearchTerm, setCodeSearchTerm] = useState("")
  const [codeSearchResults, setCodeSearchResults] = useState([])
  const [codeSearchLoading, setCodeSearchLoading] = useState(false)

  // Estados para búsqueda por nombre/descripción
  const [nameSearchTerm, setNameSearchTerm] = useState("")
  const [nameSearchResults, setNameSearchResults] = useState([])
  const [nameSearchLoading, setNameSearchLoading] = useState(false)

  // Estados para modal de cantidad
  const [showQuantityModal, setShowQuantityModal] = useState(false)
  const [selectedProductForQuantity, setSelectedProductForQuantity] = useState(null)

  // Hook de productos
  const { searchProducts } = useProducts()

  // Referencias para los timeouts del debounce
  const codeSearchTimeoutRef = useRef(null)
  const nameSearchTimeoutRef = useRef(null)

  // Función para cambiar el tipo de búsqueda
  const handleSearchTypeChange = (newType) => {
    setSearchType(newType)

    // Limpiar búsquedas al cambiar de tipo
    if (newType === "code") {
      setNameSearchTerm("")
      setNameSearchResults([])
      setNameSearchLoading(false)
      // Enfocar el input de código después de un pequeño delay
      setTimeout(() => {
        codeSearchInputRef.current?.focus()
      }, 100)
    } else {
      setCodeSearchTerm("")
      setCodeSearchResults([])
      setCodeSearchLoading(false)
      // Enfocar el input de nombre después de un pequeño delay
      setTimeout(() => {
        nameSearchInputRef.current?.focus()
      }, 100)
    }
  }

  // Función para búsqueda por código - MEJORADA PARA MANTENER FOCO
  const handleCodeSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setCodeSearchResults([])
      return
    }

    try {
      console.log("Buscando por código en modal:", searchTerm)

      const searchResult = await searchProducts(searchTerm.trim(), {
        limit: 20,
      })

      console.log("Resultado búsqueda código en modal:", searchResult)

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

        console.log("Coincidencias de código encontradas en modal:", codeMatches.length)
        setCodeSearchResults(codeMatches)
      } else {
        console.error("Error en búsqueda por código en modal:", searchResult.message)
        setCodeSearchResults([])
      }
    } catch (error) {
      console.error("Error en búsqueda por código en modal:", error)
      setCodeSearchResults([])
    }
  }

  // Función para búsqueda por nombre - MEJORADA PARA MANTENER FOCO
  const handleNameSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setNameSearchResults([])
      return
    }

    try {
      console.log("Buscando por nombre en modal:", searchTerm)

      const searchResult = await searchProducts(searchTerm.trim(), {
        limit: 30,
      })

      console.log("Resultado búsqueda nombre en modal:", searchResult)

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

        console.log("Coincidencias de nombre encontradas en modal:", nameMatches.length)
        setNameSearchResults(nameMatches)
      } else {
        console.error("Error en búsqueda por nombre en modal:", searchResult.message)
        setNameSearchResults([])
      }
    } catch (error) {
      console.error("Error en búsqueda por nombre en modal:", error)
      setNameSearchResults([])
    }
  }

  // DEBOUNCE MEJORADO - SIN CAMBIOS DE LOADING STATE QUE CAUSEN RE-RENDERS
  useEffect(() => {
    // Limpiar timeout anterior
    if (codeSearchTimeoutRef.current) {
      clearTimeout(codeSearchTimeoutRef.current)
    }

    if (codeSearchTerm.trim()) {
      // Mostrar loading solo al inicio de la búsqueda
      setCodeSearchLoading(true)

      codeSearchTimeoutRef.current = setTimeout(async () => {
        await handleCodeSearch(codeSearchTerm)
        setCodeSearchLoading(false)
      }, 200)
    } else {
      setCodeSearchResults([])
      setCodeSearchLoading(false)
    }

    // Cleanup
    return () => {
      if (codeSearchTimeoutRef.current) {
        clearTimeout(codeSearchTimeoutRef.current)
      }
    }
  }, [codeSearchTerm])

  useEffect(() => {
    // Limpiar timeout anterior
    if (nameSearchTimeoutRef.current) {
      clearTimeout(nameSearchTimeoutRef.current)
    }

    if (nameSearchTerm.trim()) {
      // Mostrar loading solo al inicio de la búsqueda
      setNameSearchLoading(true)

      nameSearchTimeoutRef.current = setTimeout(async () => {
        await handleNameSearch(nameSearchTerm)
        setNameSearchLoading(false)
      }, 300)
    } else {
      setNameSearchResults([])
      setNameSearchLoading(false)
    }

    // Cleanup
    return () => {
      if (nameSearchTimeoutRef.current) {
        clearTimeout(nameSearchTimeoutRef.current)
      }
    }
  }, [nameSearchTerm])

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

  // Enfocar el input correcto cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (searchType === "name") {
          nameSearchInputRef.current?.focus()
        } else {
          codeSearchInputRef.current?.focus()
        }
      }, 200)
    }
  }, [isOpen, searchType])

  // Función para resaltar términos de búsqueda
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text
    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  }

  // Manejar selección de producto
  const handleSelectProduct = (product) => {
    if (product.stock <= 0) {
      if (
        window.confirm(`El producto "${product.nombre}" no tiene stock disponible. ¿Desea agregarlo de todas formas?`)
      ) {
        setSelectedProductForQuantity(product)
        setShowQuantityModal(true)
      }
    } else {
      setSelectedProductForQuantity(product)
      setShowQuantityModal(true)
    }
  }

  // Manejar doble clic para selección directa
  const handleDoubleClick = (product) => {
    handleSelectProduct(product)
  }

  const handleQuantityConfirm = (product, quantity) => {
    onProductSelect(product, quantity)
    setShowQuantityModal(false)
    setSelectedProductForQuantity(null)
    handleClose()
  }

  const handleQuantityModalClose = () => {
    setShowQuantityModal(false)
    setSelectedProductForQuantity(null)
  }

  // Limpiar búsquedas
  const clearSearches = () => {
    setCodeSearchTerm("")
    setNameSearchTerm("")
    setCodeSearchResults([])
    setNameSearchResults([])
    setCodeSearchLoading(false)
    setNameSearchLoading(false)
  }

  // Limpiar estado al cerrar
  const handleClose = () => {
    clearSearches()
    setSearchType("name") // Resetear a búsqueda por nombre por defecto
    onClose()
  }

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  // Obtener estado del stock
  const getStockStatus = (product) => {
    const stockMinimo = product.stock_minimo || 5

    if (product.stock <= 0) {
      return {
        status: "sin-stock",
        color: "text-red-600 bg-red-50 border-red-200",
        text: "Sin stock",
        icon: AlertTriangle,
      }
    } else if (product.stock <= stockMinimo) {
      return {
        status: "stock-bajo",
        color: "text-orange-600 bg-orange-50 border-orange-200",
        text: "Stock bajo",
        icon: Package,
      }
    } else {
      return {
        status: "disponible",
        color: "text-green-600 bg-green-50 border-green-200",
        text: "Disponible",
        icon: Package,
      }
    }
  }

  // Renderizar producto
  const renderProduct = (product, searchTerm, searchType) => {
    const stockStatus = getStockStatus(product)
    const StatusIcon = stockStatus.icon

    return (
      <div
        key={`${searchType}-${product.id}`}
        className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer border-b border-slate-100 last:border-b-0"
        onDoubleClick={() => handleDoubleClick(product)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm font-medium bg-slate-100 px-2 py-1 rounded text-slate-700">
                {searchType === "code" ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: highlightSearchTerm(product.codigo, searchTerm),
                    }}
                  />
                ) : (
                  product.codigo
                )}
              </span>
              <Badge variant="outline" className={stockStatus.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {stockStatus.text}
              </Badge>
              {searchType === "code" && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Barcode className="w-3 h-3 mr-1" />
                  Código
                </Badge>
              )}
              {searchType === "name" && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Type className="w-3 h-3 mr-1" />
                  Nombre
                </Badge>
              )}
            </div>

            <h4 className="font-semibold text-slate-900 text-base mb-1 line-clamp-1">
              {searchType === "name" ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(product.nombre, searchTerm),
                  }}
                />
              ) : (
                product.nombre
              )}
            </h4>

            {/* Descripción */}
            {product.descripcion && product.descripcion !== "Sin Descripción" && (
              <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(product.descripcion, searchTerm),
                  }}
                />
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Stock: {product.stock}</span>
              <span>Mín: {product.stock_minimo || 5}</span>
              <span>Marca: {product.marca || "Sin marca"}</span>
              <span>Cat: {product.categoria_nombre || "Sin categoría"}</span>
            </div>
          </div>

          <div className="text-right ml-4 flex-shrink-0">
            <div className="text-base font-bold text-green-600 mb-1">{formatCurrency(product.precio_venta)}</div>
            <div className="text-xs text-slate-500 mb-2">Costo: {formatCurrency(product.precio_costo)}</div>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                handleSelectProduct(product)
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              size="sm"
              disabled={externalLoading}
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Obtener los resultados y términos actuales según el tipo de búsqueda
  const getCurrentSearchData = () => {
    if (searchType === "code") {
      return {
        searchTerm: codeSearchTerm,
        results: codeSearchResults,
        loading: codeSearchLoading,
        setSearchTerm: setCodeSearchTerm,
      }
    } else {
      return {
        searchTerm: nameSearchTerm,
        results: nameSearchResults,
        loading: nameSearchLoading,
        setSearchTerm: setNameSearchTerm,
      }
    }
  }

  const currentSearch = getCurrentSearchData()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
      <div className="bg-white shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative z-[101]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Seleccionar Productos</h2>
              <p className="text-sm text-slate-200 mt-1">Encuentra y agrega productos a tu carrito</p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-slate-200 hover:text-white hover:bg-white/10 rounded-lg"
            disabled={externalLoading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Toggle de tipo de búsqueda */}
        <div className="flex-shrink-0 p-6 bg-slate-50 border-b">
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-xl p-1 shadow-sm border border-slate-200">
              <div className="flex">
                <button
                  onClick={() => handleSearchTypeChange("name")}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    searchType === "name"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Buscar por Nombre</span>
                </button>
                <button
                  onClick={() => handleSearchTypeChange("code")}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    searchType === "code"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Barcode className="w-4 h-4" />
                  <span>Buscar por Código</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 200px)" }}>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Input de búsqueda único */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {searchType === "code" ? "Búsqueda por Código" : "Búsqueda por Nombre y Descripción"}
                </h3>
                <p className="text-sm text-slate-600">
                  {searchType === "code"
                    ? "Escribe o escanea el código del producto"
                    : "Escribe el nombre, descripción o marca del producto"}
                </p>
              </div>

              <div className="relative max-w-2xl mx-auto">
                {searchType === "code" ? (
                  <>
                    <ScanLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      ref={codeSearchInputRef}
                      placeholder="Escribe o escanea el código del producto..."
                      value={codeSearchTerm}
                      onChange={(e) => setCodeSearchTerm(e.target.value)}
                      className="pl-12 pr-12 h-14 text-lg border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl shadow-sm"
                      autoComplete="off"
                      disabled={externalLoading}
                    />
                  </>
                ) : (
                  <>
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      ref={nameSearchInputRef}
                      placeholder="Escribe el nombre del producto..."
                      value={nameSearchTerm}
                      onChange={(e) => setNameSearchTerm(e.target.value)}
                      className="pl-12 pr-12 h-14 text-lg border-2 border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl shadow-sm"
                      autoComplete="off"
                      disabled={externalLoading}
                    />
                  </>
                )}
                {currentSearch.loading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-600" />
                  </div>
                )}
              </div>

              {/* Botón para limpiar búsqueda */}
              {currentSearch.searchTerm && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => currentSearch.setSearchTerm("")}
                    variant="outline"
                    size="sm"
                    className="text-slate-600 bg-white hover:bg-slate-50 border-slate-200 rounded-lg"
                    disabled={externalLoading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar búsqueda
                  </Button>
                </div>
              )}
            </div>

            {/* Resultados */}
            {currentSearch.results.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div
                  className={`p-4 border-b ${
                    searchType === "code" ? "bg-blue-50 border-blue-100" : "bg-green-50 border-green-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold flex items-center gap-2 ${
                        searchType === "code" ? "text-blue-800" : "text-green-800"
                      }`}
                    >
                      {searchType === "code" ? <Barcode className="w-4 h-4" /> : <Type className="w-4 h-4" />}
                      {currentSearch.results.length} producto{currentSearch.results.length !== 1 ? "s" : ""} encontrado
                      {currentSearch.results.length !== 1 ? "s" : ""}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        searchType === "code"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-green-100 text-green-700 border-green-200"
                      }
                    >
                      {searchType === "code" ? "Búsqueda por código" : "Búsqueda por nombre"}
                    </Badge>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {currentSearch.results
                    .slice(0, 10)
                    .map((product) => renderProduct(product, currentSearch.searchTerm, searchType))}
                </div>
                {currentSearch.results.length > 10 && (
                  <div className="p-4 bg-slate-50 border-t text-center">
                    <span className="text-sm text-slate-600">
                      Mostrando 10 de {currentSearch.results.length} resultados
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Sin resultados */}
            {currentSearch.searchTerm &&
              currentSearch.searchTerm.length >= 1 &&
              currentSearch.results.length === 0 &&
              !currentSearch.loading && (
                <div
                  className={`text-center py-8 rounded-xl border-2 border-dashed ${
                    searchType === "code" ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"
                  }`}
                >
                  {searchType === "code" ? (
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-400" />
                  ) : (
                    <Package className="w-12 h-12 mx-auto mb-3 text-orange-400" />
                  )}
                  <p
                    className={`text-lg font-semibold mb-1 ${
                      searchType === "code" ? "text-red-700" : "text-orange-700"
                    }`}
                  >
                    {searchType === "code" ? "Código no encontrado" : "Sin resultados"}
                  </p>
                  <p className={`text-sm ${searchType === "code" ? "text-red-600" : "text-orange-600"}`}>
                    No se encontraron productos para "{currentSearch.searchTerm}"
                  </p>
                </div>
              )}

            {/* Estado inicial */}
            {!currentSearch.searchTerm && (
              <div className="text-center py-16">
                <div
                  className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                    searchType === "code" ? "bg-blue-100" : "bg-green-100"
                  }`}
                >
                  {searchType === "code" ? (
                    <ScanLine className="w-10 h-10 text-blue-600" />
                  ) : (
                    <Search className="w-10 h-10 text-green-600" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {searchType === "code" ? "Escanea o escribe un código" : "Busca productos por nombre"}
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  {searchType === "code"
                    ? "Utiliza el lector de códigos de barras o escribe el código manualmente para encontrar productos específicos."
                    : "Escribe el nombre, descripción o marca del producto que estás buscando."}
                </p>
                <div className="space-y-2 text-sm text-slate-500">
                  <p>
                    <strong>Tip:</strong>{" "}
                    {searchType === "code"
                      ? "Los códigos de barras se pueden escanear directamente"
                      : "Puedes buscar por palabras parciales"}
                  </p>
                  <p>
                    <strong>Doble clic</strong> en cualquier producto para agregarlo rápidamente
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de cantidad */}
        <SalesQuantityModal
          isOpen={showQuantityModal}
          onClose={handleQuantityModalClose}
          onConfirm={handleQuantityConfirm}
          product={selectedProductForQuantity}
          loading={externalLoading}
        />
      </div>
    </div>
  )
}

export default ProductSelectionModal
