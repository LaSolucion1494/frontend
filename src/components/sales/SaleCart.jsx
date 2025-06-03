"use client"

import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { ShoppingCart, Plus, Minus, Trash2, User, ArrowRight } from "lucide-react"
import { formatCurrency } from "../../lib/utils"

const SaleCart = ({ items, onUpdateItem, onRemoveItem, subtotal, client, onProceed }) => {
  const handleQuantityChange = (productId, change) => {
    const item = items.find((i) => i.producto_id === productId)
    if (item) {
      const newQuantity = item.cantidad + change
      if (newQuantity > 0 && newQuantity <= item.stock_disponible) {
        onUpdateItem(productId, newQuantity)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header del carrito */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center space-x-2 mb-3">
          <ShoppingCart className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Carrito de Compras</h3>
          <Badge variant="secondary">{items.length}</Badge>
        </div>

        {/* Cliente seleccionado */}
        {client && (
          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
            <User className="w-4 h-4 text-blue-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 truncate">{client.nombre}</p>
              {client.telefono && <p className="text-xs text-blue-600">{client.telefono}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Items del carrito */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-2">Carrito vacío</p>
            <p className="text-sm text-slate-500">Agrega productos para continuar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.producto_id} className="border border-slate-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {/* Nombre y código del producto */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 text-sm truncate">{item.producto_nombre}</h4>
                        <p className="text-xs text-slate-500 font-mono">{item.producto_codigo}</p>
                        {item.producto_marca && <p className="text-xs text-slate-600">{item.producto_marca}</p>}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveItem(item.producto_id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Precio unitario */}
                    <div className="text-sm">
                      <span className="text-slate-600">Precio: </span>
                      <span className="font-medium text-slate-900">{formatCurrency(item.precio_unitario)}</span>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.producto_id, -1)}
                          disabled={item.cantidad <= 1}
                          className="w-6 h-6 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(item.producto_id, 1)}
                          disabled={item.cantidad >= item.stock_disponible}
                          className="w-6 h-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.subtotal)}</p>
                        <p className="text-xs text-slate-500">Stock: {item.stock_disponible}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer con totales y botón de continuar */}
      {items.length > 0 && (
        <div className="border-t border-slate-200 p-4 space-y-4">
          {/* Resumen de totales */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Items:</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Cantidad total:</span>
              <span className="font-medium">{items.reduce((sum, item) => sum + item.cantidad, 0)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t border-slate-200 pt-2">
              <span>Subtotal:</span>
              <span className="text-green-600">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          {/* Botón continuar */}
          <Button onClick={onProceed} className="w-full bg-green-600 hover:bg-green-700" size="lg">
            Continuar al Pago
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default SaleCart
