"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Plus, Barcode, X, AlertTriangle, Type, ScanLine, RefreshCw } from "lucide-react"
import { useProducts } from "../../hooks/useProducts"
import SalesQuantityModal from "./SalesQuantityModal"

const ProductSelectionModal = ({ isOpen, onClose, onProductSelect, loading: externalLoading = false }) => {
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

  // Función para búsqueda por código
  const handleCodeSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setCodeSearchResults([])
      return
    }

    setCodeSearchLoading(true)
    try {
      console.log("Buscando por código en ventas:", searchTerm)

      const searchResult = await searchProducts(searchTerm.trim(), {
        limit: 20,
      })

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

        setCodeSearchResults(codeMatches)
      } else {
        setCodeSearchResults([])
      }
    } catch (error) {
      console.error("Error en búsqueda por código:", error)
      setCodeSearchResults([])
    } finally {
      setCodeSearchLoading(false)
    }
  }

  // Función para búsqueda por nombre/descripción
  const handleNameSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setNameSearchResults([])
      return
    }

    setNameSearchLoading(true)
    try {
      console.log("Buscando por nombre en ventas:", searchTerm)

      const searchResult = await searchProducts(searchTerm.trim(), {
        limit: 30,
      })

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

            return a.nombre.localeCompare(b.nombre)
          })

        setNameSearchResults(nameMatches)
      } else {
        setNameSearchResults([])
      }
    } catch (error) {
      console.error("Error en búsqueda por nombre:", error)
      setNameSearchResults([])
    } finally {
      setNameSearchLoading(false)
    }
  }

  // Debounce para búsquedas
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (codeSearchTerm.trim()) {
        handleCodeSearch(codeSearchTerm)
      } else {
        setCodeSearchResults([])
      }
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [codeSearchTerm])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nameSearchTerm.trim()) {
        handleNameSearch(nameSearchTerm)
      } else {
        setNameSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [nameSearchTerm])

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
  }

  // Limpiar estado al cerrar
  const handleClose = () => {
    clearSearches()
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
              disabled={codeSearchLoading || nameSearchLoading || externalLoading}
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
      <div className="bg-white shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden relative z-[101]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Seleccionar Productos</h2>
              <p className="text-sm text-slate-300 mt-1">Búsqueda avanzada para agregar productos al carrito</p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            disabled={codeSearchLoading || nameSearchLoading || externalLoading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 120px)" }}>
          <div className="space-y-6">
            {/* Búsquedas duales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Búsqueda por Código */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Barcode className="w-4 h-4" />
                  Búsqueda por Código
                </div>
                <div className="relative">
                  <ScanLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    ref={codeSearchInputRef}
                    placeholder="Escribe o escanea el código..."
                    value={codeSearchTerm}
                    onChange={(e) => setCodeSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-slate-800 focus:ring-2 focus:ring-slate-200"
                    autoComplete="off"
                    disabled={codeSearchLoading || nameSearchLoading || externalLoading}
                  />
                  {codeSearchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Resultados de código */}
                {codeSearchResults.length > 0 && (
                  <div className="border rounded-lg bg-white shadow-sm max-h-96 overflow-y-auto">
                    <div className="p-2 bg-blue-50 border-b">
                      <span className="text-xs font-medium text-blue-700 flex items-center gap-1">
                        <Barcode className="w-3 h-3" />
                        {codeSearchResults.length} código{codeSearchResults.length !== 1 ? "s" : ""} encontrado
                        {codeSearchResults.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div>
                      {codeSearchResults.slice(0, 8).map((product) => renderProduct(product, codeSearchTerm, "code"))}
                    </div>
                    {codeSearchResults.length > 8 && (
                      <div className="p-2 bg-slate-50 border-t text-center">
                        <span className="text-xs text-slate-600">
                          Mostrando 8 de {codeSearchResults.length} resultados
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {codeSearchTerm && codeSearchResults.length === 0 && !codeSearchLoading && (
                  <div className="text-center py-4 text-slate-500 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-red-400" />
                    <p className="text-sm font-medium text-red-700">Código no encontrado</p>
                    <p className="text-xs text-red-600">"{codeSearchTerm}"</p>
                  </div>
                )}
              </div>

              {/* Búsqueda por Nombre/Descripción */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Type className="w-4 h-4" />
                  Búsqueda por Nombre/Descripción
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    ref={nameSearchInputRef}
                    placeholder="Escribe el nombre del producto..."
                    value={nameSearchTerm}
                    onChange={(e) => setNameSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-slate-800 focus:ring-2 focus:ring-slate-200"
                    autoComplete="off"
                    disabled={codeSearchLoading || nameSearchLoading || externalLoading}
                  />
                  {nameSearchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Resultados de nombre */}
                {nameSearchResults.length > 0 && (
                  <div className="border rounded-lg bg-white shadow-sm max-h-96 overflow-y-auto">
                    <div className="p-2 bg-green-50 border-b">
                      <span className="text-xs font-medium text-green-700 flex items-center gap-1">
                        <Type className="w-3 h-3" />
                        {nameSearchResults.length} producto{nameSearchResults.length !== 1 ? "s" : ""} encontrado
                        {nameSearchResults.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div>
                      {nameSearchResults.slice(0, 8).map((product) => renderProduct(product, nameSearchTerm, "name"))}
                    </div>
                    {nameSearchResults.length > 8 && (
                      <div className="p-2 bg-slate-50 border-t text-center">
                        <span className="text-xs text-slate-600">
                          Mostrando 8 de {nameSearchResults.length} resultados
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {nameSearchTerm &&
                  nameSearchTerm.length >= 1 &&
                  nameSearchResults.length === 0 &&
                  !nameSearchLoading && (
                    <div className="text-center py-4 text-slate-500 bg-orange-50 rounded-lg border border-orange-200">
                      <Package className="w-6 h-6 mx-auto mb-1 text-orange-400" />
                      <p className="text-sm font-medium text-orange-700">Sin resultados</p>
                      <p className="text-xs text-orange-600">"{nameSearchTerm}"</p>
                    </div>
                  )}
              </div>
            </div>

            {/* Botón para limpiar búsquedas */}
            {(codeSearchTerm || nameSearchTerm) && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={clearSearches}
                  variant="outline"
                  size="sm"
                  className="text-slate-600 bg-transparent hover:bg-slate-50"
                  disabled={codeSearchLoading || nameSearchLoading || externalLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar búsquedas
                </Button>
              </div>
            )}

            {/* Estado inicial */}
            {!codeSearchTerm && !nameSearchTerm && (
              <div className="text-center py-12 text-slate-500">
                <Search className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="font-medium text-lg mb-2">Busque productos para agregar</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Use los campos de búsqueda para encontrar productos por código o nombre
                </p>
                <div className="space-y-2 text-xs text-slate-400">
                  <p>
                    <strong>Búsqueda por código:</strong> Ideal para códigos de barras o códigos específicos
                  </p>
                  <p>
                    <strong>Búsqueda por nombre:</strong> Busca en nombre, descripción y marca del producto
                  </p>
                  <p>
                    <strong>Doble clic</strong> en cualquier producto o use el botón "Agregar" para seleccionar
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
          loading={codeSearchLoading || nameSearchLoading || externalLoading}
        />
      </div>
    </div>
  )
}

export default ProductSelectionModal
