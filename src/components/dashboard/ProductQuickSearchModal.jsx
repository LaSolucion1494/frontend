"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Search, Package, Barcode, X, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react"
import { formatCurrency } from "../../lib/utils"

const ProductQuickSearchModal = ({ isOpen, onClose, searchResults, searchTerm, onNavigateToStock }) => {
  // Función para obtener el color del estado de stock
  const getStockStatusColor = (product) => {
    const stockMinimo = product.stock_minimo || 5
    if (product.stock === 0) return "text-red-600 bg-red-50 border-red-200"
    if (product.stock <= stockMinimo) return "text-orange-600 bg-orange-50 border-orange-200"
    return "text-green-600 bg-green-50 border-green-200"
  }

  // Función para obtener el texto del estado de stock
  const getStockStatusText = (product) => {
    const stockMinimo = product.stock_minimo || 5
    if (product.stock === 0) return "Sin stock"
    if (product.stock <= stockMinimo) return "Stock bajo"
    return "Disponible"
  }

  const handleNavigateToStock = () => {
    onNavigateToStock()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Resultados de Búsqueda
          </DialogTitle>
          <DialogDescription>
            {searchResults.length} producto{searchResults.length !== 1 ? "s" : ""} encontrado
            {searchResults.length !== 1 ? "s" : ""}
            {searchTerm && ` para "${searchTerm}"`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Código y estado */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Barcode className="w-4 h-4 text-slate-500" />
                          <span className="font-mono text-sm font-medium bg-slate-100 px-2 py-1 rounded">
                            {product.codigo}
                          </span>
                        </div>
                        <Badge variant="outline" className={getStockStatusColor(product)}>
                          <div className="flex items-center gap-1">
                            {product.stock === 0 ? (
                              <X className="w-3 h-3" />
                            ) : product.stock <= (product.stock_minimo || 5) ? (
                              <AlertTriangle className="w-3 h-3" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            {getStockStatusText(product)}
                          </div>
                        </Badge>
                      </div>

                      {/* Nombre del producto */}
                      <h3 className="font-semibold text-lg text-slate-900 mb-2">{product.nombre}</h3>

                      {/* Descripción */}
                      {product.descripcion && product.descripcion !== "Sin Descripción" && (
                        <p className="text-sm text-slate-600 mb-3">{product.descripcion}</p>
                      )}

                      {/* Información adicional */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Stock:</span>
                          <div className="font-semibold text-slate-900">{product.stock} unidades</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Stock mínimo:</span>
                          <div className="font-semibold text-slate-900">{product.stock_minimo || 5}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Marca:</span>
                          <div className="font-semibold text-slate-900">{product.marca || "Sin marca"}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Categoría:</span>
                          <div className="font-semibold text-slate-900">{product.categoria_nombre}</div>
                        </div>
                      </div>
                    </div>

                    {/* Precios */}
                    <div className="text-right ml-6">
                      <div className="mb-2">
                        <span className="text-sm text-slate-500">Precio de venta</span>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(product.precio_venta)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Precio de costo</span>
                        <div className="text-lg font-semibold text-slate-700">
                          {formatCurrency(product.precio_costo)}
                        </div>
                      </div>
                      {/* Margen de ganancia */}
                      <div className="mt-2">
                        <span className="text-xs text-slate-500">Margen:</span>
                        <div className="text-sm font-medium text-blue-600">
                          {product.precio_costo > 0
                            ? (((product.precio_venta - product.precio_costo) / product.precio_costo) * 100).toFixed(1)
                            : 0}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron productos</h3>
              <p className="text-slate-600 mb-4">Intenta con otro término de búsqueda</p>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="border-t pt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {searchResults.length > 0 && (
              <span>
                Mostrando {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleNavigateToStock}
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Package className="w-4 h-4" />
              Ir a Stock
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProductQuickSearchModal
