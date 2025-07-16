"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Plus, Barcode, Tag, X, AlertTriangle } from "lucide-react"
import { useDebounce } from "../../hooks/useDebounce"
import SalesQuantityModal from "./SalesQuantityModal"

const ProductSelectionModal = ({
  isOpen,
  onClose,
  onProductSelect,
  products = [],
  loading = false,
  onSearchChange,
  onPageChange,
  pagination,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  // ELIMINAR: const [filteredProducts, setFilteredProducts] = useState([])
  const [showQuantityModal, setShowQuantityModal] = useState(false)
  const [selectedProductForQuantity, setSelectedProductForQuantity] = useState(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // ELIMINAR: useEffect para filtrado local
  /*
  useEffect(() => {
    let filtered = products.filter((product) => product.activo !== false)

    // Filtrar por término de búsqueda
    if (debouncedSearchTerm) {
      const normalizedSearch = debouncedSearchTerm
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

      filtered = filtered.filter((product) => {
        const normalizedName = product.nombre
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
        const normalizedCode = product.codigo ? product.codigo.toLowerCase() : ""
        const normalizedBrand = product.marca
          ? product.marca
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
          : ""

        return (
          normalizedName.includes(normalizedSearch) ||
          normalizedCode.includes(normalizedSearch) ||
          normalizedBrand.includes(normalizedSearch)
        )
      })
    }

    // Ordenar por relevancia
    filtered.sort((a, b) => {
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase()
        const aNameMatch = a.nombre.toLowerCase().includes(searchLower)
        const bNameMatch = b.nombre.toLowerCase().includes(searchLower)

        if (aNameMatch && !bNameMatch) return -1
        if (!aNameMatch && bNameMatch) return 1
      }

      return a.nombre.localeCompare(b.nombre)
    })

    setFilteredProducts(filtered.slice(0, 50))
  }, [debouncedSearchTerm, products])
  */

  // NUEVO: Disparar la búsqueda en el backend cuando el término de búsqueda debounced cambia
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, onSearchChange])

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

  const handleQuantityConfirm = (product, quantity) => {
    onProductSelect(product, quantity)
    setShowQuantityModal(false)
    setSelectedProductForQuantity(null)
    onClose()
  }

  const handleQuantityModalClose = () => {
    setShowQuantityModal(false)
    setSelectedProductForQuantity(null)
  }

  // Limpiar estado al cerrar
  const handleClose = () => {
    setSearchTerm("")
    // ELIMINAR: setFilteredProducts([])
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

  // Obtener estado del stock para ventas
  const getStockStatus = (product) => {
    const stockMinimo = product.stock_minimo || 5

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
        icon: Package,
      }
    } else {
      return {
        status: "disponible",
        color: "bg-green-100 text-green-800 border-green-200",
        text: "Disponible",
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
              <p className="text-sm text-slate-300 mt-1">Agregue productos al carrito de ventas</p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            disabled={loading}
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
                onChange={(e) => setSearchTerm(e.target.value)} // Esto ahora dispara el useEffect que llama a onSearchChange
                className="pl-10 border-slate-300 bg-slate-50 focus:border-slate-800 focus:ring-slate-800/20"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Resultados de búsqueda */}
            <div className="border border-slate-200 bg-white rounded-lg shadow-sm">
              {loading ? (
                <div className="p-12 text-center text-slate-500">
                  <div className="inline-block h-8 w-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-4"></div>
                  <p className="font-medium">Buscando productos...</p>
                </div>
              ) : products.length > 0 ? ( // CAMBIO: Usar `products` directamente
                <div className="divide-y divide-slate-100">
                  {products.map((product) => {
                    // CAMBIO: Usar `products` directamente
                    const stockStatus = getStockStatus(product)
                    const precioVenta = product.precio_venta || 0
                    const StatusIcon = stockStatus.icon
                    const stockMinimo = product.stock_minimo || 5

                    return (
                      <div key={product.id} className="p-5 hover:bg-slate-50 transition-colors">
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
                                onClick={() => handleSelectProduct(product)}
                                className="ml-4 bg-slate-800 hover:bg-slate-700 text-white"
                                size="sm"
                                disabled={loading}
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
                                {product.stock <= 0 && (
                                  <div className="flex items-center text-red-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span className="text-xs ml-1">Sin disponibilidad</span>
                                  </div>
                                )}
                              </div>

                              {/* Precios */}
                              <div className="text-right">
                                <div className="font-medium text-sm text-slate-900">
                                  Precio: {formatCurrency(precioVenta)}
                                </div>
                                {product.precio_costo && (
                                  <div className="text-xs text-slate-500">
                                    Costo: {formatCurrency(product.precio_costo)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* NUEVO: Controles de paginación */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="p-4 flex justify-between items-center border-t border-slate-100 bg-slate-50">
                      <Button
                        onClick={() => onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1 || loading}
                        variant="outline"
                        size="sm"
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-slate-600">
                        Página {pagination.currentPage} de {pagination.totalPages}
                      </span>
                      <Button
                        onClick={() => onPageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages || loading}
                        variant="outline"
                        size="sm"
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                </div>
              ) : searchTerm && products.length === 0 ? ( // CAMBIO: Usar `products` directamente
                <div className="p-12 text-center text-slate-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="font-medium text-lg mb-2">No se encontraron productos</h3>
                  <p className="text-sm text-slate-400">
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
                  <p className="text-xs text-slate-400">
                    Los productos sin stock aparecerán marcados y requerirán confirmación
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de cantidad */}
        <SalesQuantityModal
          isOpen={showQuantityModal}
          onClose={handleQuantityModalClose}
          onConfirm={handleQuantityConfirm}
          product={selectedProductForQuantity}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default ProductSelectionModal
