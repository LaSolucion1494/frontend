"use client"

import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import {
  Package,
  Edit,
  RefreshCw,
  Trash2,
  X,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Tag,
  Barcode,
  Percent,
} from "lucide-react"
import { formatCurrency, calculateSalePrice } from "../../lib/utils"
import BarcodeDisplay from "../barcode/BarcodeDisplay"

const ProductDetailsModal = ({ isOpen, onClose, product, onEdit, onStockMovement, onDelete, config }) => {
  if (!product || !isOpen) return null

  const precioVenta = calculateSalePrice(product.precioCosto, config.rentabilidad, config.iva, config.ingresosBrutos)
  const ganancia = precioVenta - product.precioCosto

  const getStockStatus = () => {
    if (product.stock === 0) {
      return {
        text: "Sin stock",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: AlertTriangle,
        iconColor: "text-red-600",
      }
    }
    if (product.stock <= 5) {
      return {
        text: "Stock bajo",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: AlertTriangle,
        iconColor: "text-orange-600",
      }
    }
    return {
      text: "Disponible",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
      iconColor: "text-green-600",
    }
  }

  const stockStatus = getStockStatus()
  const StatusIcon = stockStatus.icon

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Detalles del Producto</h2>
              <p className="text-sm text-slate-300 mt-1">Información completa del producto {product.codigo}</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 200px)" }}>
          <div className="space-y-6">
            {/* Información principal del producto */}
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{product.nombre}</h2>
                    <p className="text-slate-600 mb-3">{product.descripcion}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500">Código:</span>
                        <span className="font-mono font-semibold text-slate-900 bg-white px-2 py-1 rounded border">
                          {product.codigo}
                        </span>
                        {product.tieneCodigoBarras ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Con código de barras
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500">Stock:</span>
                        <span className="font-bold text-lg text-slate-900">{product.stock} unidades</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${stockStatus.color} border px-3 py-1`}>
                    <StatusIcon className="w-4 h-4 mr-2" />
                    {stockStatus.text}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Grid de información detallada */}
            <div
              className={`grid grid-cols-1 ${product.tieneCodigoBarras ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-6`}
            >
              {/* Información Comercial */}
              <Card className="bg-white border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Información Comercial</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Categoría:</span>
                      <span className="font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded text-sm">
                        {product.categoria}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Marca:</span>
                      <span className="font-medium text-slate-900">{product.marca}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Proveedor:</span>
                      <span className="font-medium text-slate-900">{product.proveedor}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información de Precios */}
              <Card className="bg-white border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Información de Precios</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Precio de Costo:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(product.precioCosto)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Precio de Venta:</span>
                      <span className="font-bold text-green-600">{formatCurrency(precioVenta)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Ganancia:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(ganancia)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Margen:</span>
                      <span className="font-bold text-purple-600 flex items-center">
                        <Percent className="w-4 h-4 mr-1" />
                        {config.rentabilidad}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Información Adicional y Código de Barras (solo si tiene código de barras) */}
            <div
              className={`grid grid-cols-1 ${product.tieneCodigoBarras ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-6`}
            >
              {/* Información Adicional */}
              <Card className="bg-white border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Información Adicional</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-600 text-sm">Fecha de ingreso:</span>
                      <p className="font-medium text-slate-900">
                        {new Date(product.fechaIngreso).toLocaleDateString("es-AR", {
                          timeZone: "UTC",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    {product.tieneCodigoBarras ? (
                      <div>
                        <span className="text-slate-600 text-sm flex items-center mb-2">
                          <Barcode className="w-4 h-4 mr-1" />
                          Código de barras:
                        </span>
                        <p className="font-mono font-medium text-slate-900 bg-slate-100 px-3 py-2 rounded border text-sm">
                          {product.codigo}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              {/* Código de Barras Visual - Solo mostrar si tiene código de barras habilitado */}
              {product.tieneCodigoBarras ? (
                <Card className="bg-white border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <Barcode className="w-5 h-5 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Código de Barras</h3>
                    </div>
                    <BarcodeDisplay
                      code={product.codigo}
                      productName={product.nombre}
                      showControls={true}
                      size="medium"
                    />
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-t border-slate-200 bg-slate-50">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => onEdit(product)} className="hover:bg-blue-50">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" onClick={() => onStockMovement(product)} className="hover:bg-green-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Stock
            </Button>
            <Button variant="destructive" onClick={() => onDelete(product)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsModal
