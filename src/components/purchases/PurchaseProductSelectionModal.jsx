"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Plus, Barcode, Tag, TrendingUp, X, AlertTriangle } from "lucide-react"
import { useDebounce } from "../../hooks/useDebounce"
import { useProducts } from "../../hooks/useProducts"
import PurchaseQuantityModal from "./PurchaseQuantityModal"

const PurchaseProductSelectionModal = ({ isOpen, onClose, onProductSelect, loading: externalLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showQuantityModal, setShowQuantityModal] = useState(false)
  const [selectedProductForQuantity, setSelectedProductForQuantity] = useState(null)

  // Usar el hook de productos para la búsqueda
  const { searchProducts } = useProducts()

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Realizar búsqueda en el backend cuando cambia el término
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        const result = await searchProducts(debouncedSearchTerm)
        if (result.success) {
          setSearchResults(result.data || [])
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error("Error en búsqueda de productos:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearchTerm, searchProducts])

  // Manejar doble clic para selección directa
  const handleDoubleClick = (product) => {
    // Simplemente llamar a la misma función que el botón "Agregar"
    handleSelectProduct(product)
  }

  // Manejar selección de producto (clic simple - abre modal de cantidad)
  const handleSelectProduct = (product) => {
    setSelectedProductForQuantity(product)
    setShowQuantityModal(true)
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

  // Limpiar estado al cerrar
  const handleClose = () => {
    setSearchTerm("")
    setSearchResults([])
    setIsSearching(false)
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

  // Obtener estado del stock para compras (enfoque en reposición)
  const getStockStatus = (product) => {
    const stockMinimo = product.stock_minimo_config || product.stock_minimo || 5

    if (product.stock <= 0) {
      return {
        status: "sin-stock",
        color: "bg-red-100 text-red-800 border-red-200",
        text: "Sin stock",
        icon: AlertTriangle,
      }
    } else if (product.stock <= stockMinimo) {
      return {
        status: "stock-bajo",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        text: "Stock bajo",
        icon: TrendingUp,
      }
    } else {
      return {
        status: "stock-ok",
        color: "bg-green-100 text-green-800 border-green-200",
        text: "Stock OK",
        icon: Package,
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
      <div className="bg-white shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative z-[101]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Seleccionar Productos</h2>
              <p className="text-sm text-slate-300 mt-1">Busque y agregue productos al carrito de compras</p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            disabled={isSearching || externalLoading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 120px)" }}>
          <div className="space-y-6">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por nombre, código o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 bg-slate-50 focus:border-slate-800 focus:ring-slate-800/20"
                disabled={isSearching || externalLoading}
                autoFocus
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-800"></div>
                </div>
              )}
            </div>

            {/* Información de búsqueda */}
            {searchTerm && searchTerm.length < 2 && (
              <div className="text-center text-slate-500 text-sm">Escriba al menos 2 caracteres para buscar</div>
            )}

            {/* Resultados de búsqueda */}
            <div className="border border-slate-200 bg-white rounded-lg shadow-sm">
              {isSearching ? (
                <div className="p-12 text-center text-slate-500">
                  <div className="inline-block h-8 w-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-4"></div>
                  <p className="font-medium">Buscando productos...</p>
                  <p className="text-sm text-slate-400 mt-1">Buscando en toda la base de datos</p>
                </div>
              ) : searchTerm && searchTerm.length >= 2 && searchResults.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {searchResults.map((product) => {
                    const stockStatus = getStockStatus(product)
                    const precioCosto = product.precio_costo || product.precioCosto || 0
                    const StatusIcon = stockStatus.icon
                    const stockMinimo = product.stock_minimo_config || product.stock_minimo || 5

                    return (
                      <div
                        key={product.id}
                        className="p-5 hover:bg-slate-50 transition-colors group cursor-pointer"
                        onDoubleClick={() => handleDoubleClick(product)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-900 leading-tight text-lg mb-2">
                                  {product.nombre}
                                </h4>
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                  {product.codigo && (
                                    <div className="flex items-center">
                                      <Barcode className="h-3 w-3 mr-1" />
                                      <span className="font-mono">{product.codigo}</span>
                                    </div>
                                  )}
                                  {product.marca && (
                                    <div className="flex items-center">
                                      <Tag className="h-3 w-3 mr-1" />
                                      <span>{product.marca}</span>
                                    </div>
                                  )}
                                  {product.categoria_nombre && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-slate-50 text-slate-600 border-slate-300"
                                    >
                                      {product.categoria_nombre}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation() // Evitar que se dispare el doble clic
                                  handleSelectProduct(product)
                                }}
                                className="ml-4 bg-slate-800 hover:bg-slate-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                size="sm"
                                disabled={isSearching || externalLoading}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Agregar
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              {/* Stock */}
                              <div className="flex items-center space-x-3">
                                <Badge className={`text-xs border ${stockStatus.color}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {stockStatus.text}
                                </Badge>
                                <span className="text-sm text-slate-600">
                                  Stock: <span className="font-medium">{product.stock}</span>
                                  <span className="text-slate-400"> (mín: {stockMinimo})</span>
                                </span>
                                {product.stock <= stockMinimo && (
                                  <div className="flex items-center text-orange-600">
                                    <TrendingUp className="h-3 w-3" />
                                    <span className="text-xs ml-1">Necesita reposición</span>
                                  </div>
                                )}
                              </div>

                              {/* Precios */}
                              <div className="text-right">
                                <div className="font-medium text-sm text-slate-900">
                                  Costo: {formatCurrency(precioCosto)}
                                </div>
                                {product.precio_venta && (
                                  <div className="text-xs text-slate-500">
                                    Venta: {formatCurrency(product.precio_venta)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {searchResults.length === 50 && (
                    <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-100">
                      Mostrando los primeros 50 resultados. Refine su búsqueda para ver más productos específicos.
                    </div>
                  )}
                </div>
              ) : searchTerm && searchTerm.length >= 2 && searchResults.length === 0 && !isSearching ? (
                <div className="p-12 text-center text-slate-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="font-medium text-lg mb-2">No se encontraron productos</h3>
                  <p className="text-sm text-slate-400 mb-2">No hay productos que coincidan con "{searchTerm}"</p>
                  <p className="text-xs text-slate-400">
                    Intente con otros términos de búsqueda o verifique la ortografía
                  </p>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <Search className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="font-medium text-lg mb-2">Busque productos para agregar</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Use el campo de búsqueda para encontrar productos por nombre, código o marca
                  </p>
                  <p className="text-xs text-slate-400 mb-2">
                    <strong>Doble clic</strong> en cualquier producto o use el botón "Agregar" para seleccionar
                  </p>
                  <p className="text-xs text-slate-400">
                    Los productos con stock bajo aparecerán marcados para facilitar la reposición
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de cantidad */}
        <PurchaseQuantityModal
          isOpen={showQuantityModal}
          onClose={handleQuantityModalClose}
          onConfirm={handleQuantityConfirm}
          product={selectedProductForQuantity}
          loading={isSearching || externalLoading}
        />
      </div>
    </div>
  )
}

export default PurchaseProductSelectionModal
