"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Plus, Barcode, Tag, TrendingUp, X, AlertTriangle } from "lucide-react"
import { useDebounce } from "../../hooks/useDebounce"

const PurchaseProductSelectionModal = ({ isOpen, onClose, onProductSelect, products = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState([])

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Filtrar productos cuando cambia el término de búsqueda
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

  // Manejar selección de producto
  const handleSelectProduct = (product) => {
    onProductSelect(product)
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
    if (product.stock <= 0) {
      return {
        status: "sin-stock",
        color: "bg-red-100 text-red-800 border-red-200",
        text: "Sin stock",
        icon: AlertTriangle,
      }
    } else if (product.stock <= product.stock_minimo) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden bg-white flex flex-col p-0">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-slate-200 bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">Seleccionar Productos</DialogTitle>
                <p className="text-sm text-slate-300 mt-1">Agregue productos al carrito de compras</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por nombre, código o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 bg-white focus:border-slate-800 focus:ring-slate-800/20"
                disabled={loading}
              />
            </div>

            {/* Resultados de búsqueda */}
            <div className="border border-slate-200 bg-white rounded-lg shadow-sm">
              {loading ? (
                <div className="p-12 text-center text-slate-500">
                  <div className="inline-block h-8 w-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-4"></div>
                  <p className="font-medium">Buscando productos...</p>
                </div>
              ) : searchTerm && filteredProducts.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product)
                    const precioCosto = product.precio_costo || product.precioCosto || 0
                    const StatusIcon = stockStatus.icon

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
                                  {product.stock_minimo && (
                                    <span className="text-slate-400"> (mín: {product.stock_minimo})</span>
                                  )}
                                </span>
                                {product.stock <= product.stock_minimo && (
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

                  {filteredProducts.length === 50 && (
                    <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-100">
                      Mostrando los primeros 50 resultados. Refine su búsqueda para ver más productos.
                    </div>
                  )}
                </div>
              ) : searchTerm && filteredProducts.length === 0 ? (
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
                    Los productos con stock bajo aparecerán marcados para facilitar la reposición
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PurchaseProductSelectionModal
