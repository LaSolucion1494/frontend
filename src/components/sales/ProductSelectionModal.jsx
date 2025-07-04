"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Plus, AlertTriangle, Barcode, Tag } from "lucide-react"
import { useDebounce } from "../../hooks/useDebounce"

const ProductSelectionModal = ({ isOpen, onClose, onProductSelect, products = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState([])

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Filtrar productos cuando cambia el término de búsqueda o categoría
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
    if (product.stock <= 0) {
      if (
        window.confirm(`El producto "${product.nombre}" no tiene stock disponible. ¿Desea agregarlo de todas formas?`)
      ) {
        onProductSelect(product)
        onClose()
      }
    } else {
      onProductSelect(product)
      onClose()
    }
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
    if (product.stock <= 0) {
      return { status: "sin-stock", color: "bg-red-100 text-red-800", text: "Sin stock" }
    } else if (product.stock <= product.stock_minimo) {
      return { status: "stock-bajo", color: "bg-yellow-100 text-yellow-800", text: "Stock bajo" }
    } else {
      return { status: "stock-ok", color: "bg-green-100 text-green-800", text: "Disponible" }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Package className="w-5 h-5 mr-2 text-green-600" />
            Seleccionar Producto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar por nombre, código o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-400 bg-slate-100 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Resultados de búsqueda */}
          <div className="max-h-96 overflow-y-auto border border-gray-400 bg-slate-100 rounded-lg">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Buscando productos...
              </div>
            ) : searchTerm && filteredProducts.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product)

                  return (
                    <div key={product.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 leading-tight">{product.nombre}</h4>
                              <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                                {product.codigo && (
                                  <div className="flex items-center">
                                    <Barcode className="h-3 w-3 mr-1" />
                                    {product.codigo}
                                  </div>
                                )}
                                {product.marca && (
                                  <div className="flex items-center">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {product.marca}
                                  </div>
                                )}
                              </div>
                              {product.categoria_nombre && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {product.categoria_nombre}
                                </Badge>
                              )}
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

                          <div className="flex items-center justify-between mt-3">
                            {/* Stock */}
                            <div className="flex items-center space-x-2">
                              <Badge className={`text-xs ${stockStatus.color}`}>{stockStatus.text}</Badge>
                              <span className="text-xs text-gray-500">
                                Stock: {product.stock}
                                {product.stock_minimo && (
                                  <span className="text-gray-400"> (mín: {product.stock_minimo})</span>
                                )}
                              </span>
                              {product.stock <= 0 && <AlertTriangle className="h-3 w-3 text-red-500" />}
                            </div>

                            {/* Precios */}
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{formatCurrency(product.precio_venta)}</div>
                              {product.precio_costo && (
                                <div className="text-xs text-gray-500">
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

                {filteredProducts.length === 50 && (
                  <div className="p-3 text-center text-xs text-gray-500 bg-gray-50">
                    Mostrando los primeros 50 resultados. Refine su búsqueda para ver más.
                  </div>
                )}
              </div>
            ) : searchTerm && filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No se encontraron productos</p>
                <p className="text-sm text-gray-400 mt-1">Intente con otros términos de búsqueda</p>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Busque un producto para agregar</p>
                <p className="text-sm text-gray-400 mt-1">Use el campo de búsqueda arriba</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProductSelectionModal
