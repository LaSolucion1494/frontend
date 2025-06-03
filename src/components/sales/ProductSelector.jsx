"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { Search, Package, Plus, Minus } from "lucide-react"
import { useProducts } from "../../hooks/useProducts"
import { formatCurrency } from "../../lib/utils"
import { Loading } from "../ui/loading"
import { useConfig } from "../../hooks/useConfig"

const ProductSelector = ({ onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [quantities, setQuantities] = useState({})
  const { products, loading, updateFilters } = useProducts()
  const { config } = useConfig()

  useEffect(() => {
    updateFilters({
      search: searchTerm,
      activo: "true", // Solo productos activos
      conStock: "true", // Solo productos con stock
    })
  }, [searchTerm, updateFilters])

  const handleQuantityChange = (productId, change) => {
    setQuantities((prev) => {
      const currentQty = prev[productId] || 1
      const newQty = Math.max(1, currentQty + change)
      return { ...prev, [productId]: newQty }
    })
  }

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1
    onAddToCart(product, quantity)
    // Reset quantity after adding
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }))
  }

  const filteredProducts = products.filter(
    (product) =>
      product.stock > 0 && // Solo productos con stock
      (product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.marca && product.marca.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading text="Cargando productos..." size="lg" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Seleccionar Productos</h3>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar productos por nombre, código o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      {/* Lista de productos */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const quantity = quantities[product.id] || 1
            const precio_venta = Number(product.precio_venta) || 0

            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header del producto */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 text-sm truncate">{product.nombre}</h4>
                          <p className="text-xs text-slate-500 font-mono">{product.codigo}</p>
                        </div>
                      </div>
                      <Badge variant={product.stock > 10 ? "default" : "destructive"} className="text-xs">
                        Stock: {product.stock}
                      </Badge>
                    </div>

                    {/* Información del producto */}
                    <div className="space-y-1">
                      {product.marca && <p className="text-sm text-slate-600">Marca: {product.marca}</p>}
                      <p className="text-lg font-bold text-green-600">{formatCurrency(precio_venta)}</p>
                    </div>

                    {/* Selector de cantidad */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(product.id, -1)}
                          disabled={quantity <= 1}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(product.id, 1)}
                          disabled={quantity >= product.stock}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={quantity > product.stock}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Agregar
                      </Button>
                    </div>

                    {/* Total del item */}
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-sm text-slate-600">
                        Total:{" "}
                        <span className="font-semibold text-slate-900">{formatCurrency(precio_venta * quantity)}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-2">No se encontraron productos</p>
            <p className="text-sm text-slate-500">
              {searchTerm ? "Intenta con otros términos de búsqueda" : "No hay productos disponibles con stock"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductSelector
