"use client"

import { Button } from "../ui/button"
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
  Receipt,
  Building,
  TrendingUp,
  Calculator,
  Activity,
  PackageCheck,
  PlusCircle,
} from "lucide-react"
import { formatCurrency } from "../../lib/utils"
import BarcodeDisplay from "../barcode/BarcodeDisplay"

const ProductDetailsModal = ({ isOpen, onClose, product, onEdit, onStockMovement, onDelete, }) => {
  if (!product || !isOpen) return null

  // Usar los precios guardados en la base de datos
  const precioCosto = product.precio_costo || 0
  const precioVenta = product.precio_venta || 0


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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
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
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50" style={{ maxHeight: "calc(95vh - 200px)" }}>
          <div className="space-y-6">
            {/* Hero Section - Información Principal */}
            <div className="bg-white rounded-lg border border-slate-800 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h1 className="text-3xl font-bold text-slate-900">{product.nombre}</h1>
                    <Badge className={`${stockStatus.color} border px-3 py-1`}>
                      <StatusIcon className="w-4 h-4 mr-2" />
                      {stockStatus.text}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-slate-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <PackageCheck className="w-4 h-4" />
                      <span>Código: {product.codigo}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Ingresado:{" "}
                        {new Date(product.fechaIngreso).toLocaleDateString("es-AR", {
                          timeZone: "UTC",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" />
                      <span>Stock: {product.stock} unidades</span>
                    </div>
                  </div>
                  {product.descripcion && product.descripcion !== "Sin Descripción" && (
                    <p className="text-slate-600 leading-relaxed">{product.descripcion}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Precios */}
            <div className="bg-white rounded-lg border border-slate-800 p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Información de Precios</h3>
              </div>

              <div className="space-y-6">
                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Precio de Costo */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Precio de Costo</span>
                      <Calculator className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(precioCosto)}</div>
                    <p className="text-xs text-slate-500 mt-1">Costo base del producto</p>
                  </div>

                  {/* Precio de Venta */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Precio de Venta</span>
                      <DollarSign className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(precioVenta)}</div>
                    <p className="text-xs text-slate-500 mt-1">Precio final al público</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Información Comercial y Código de Barras */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información Comercial */}
              <div className="bg-white rounded-lg border border-slate-800 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Tag className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Información Comercial</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Categoría</span>
                    </div>
                    <span className="font-medium text-slate-900">{product.categoria}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Marca</span>
                    </div>
                    <span className="font-medium text-slate-900">
                      {product.marca && product.marca !== "Sin Marca" ? product.marca : "Sin marca"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Proveedor</span>
                    </div>
                    <span className="font-medium text-slate-900">{product.proveedor || "Sin proveedor"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <Barcode className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Código de Barras</span>
                    </div>
                    <Badge
                      className={`${product.tieneCodigoBarras
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                        } border`}
                    >
                      {product.tieneCodigoBarras ? "Habilitado" : "No habilitado"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Código de Barras Visual - Solo mostrar si tiene código de barras habilitado */}
              {product.tieneCodigoBarras ? (
                <div className="bg-white rounded-lg border border-slate-800 p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <Barcode className="w-4 h-4 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Código de Barras</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-sm text-slate-600 mb-2">Código:</div>
                      <div className="font-mono font-medium text-slate-900 text-lg">{product.codigo}</div>
                    </div>
                    <BarcodeDisplay
                      code={product.codigo}
                      productName={product.nombre}
                      showControls={true}
                      size="medium"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-slate-800 p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <Activity className="w-4 h-4 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Información Adicional</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">Fecha de Ingreso</span>
                      </div>
                      <span className="font-medium text-slate-900">
                        {new Date(product.fechaIngreso).toLocaleDateString("es-AR", {
                          timeZone: "UTC",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <PackageCheck className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">Stock Actual</span>
                      </div>
                      <span className="font-medium text-slate-900">{product.stock} unidades</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">Estado</span>
                      </div>
                      <Badge className={`${stockStatus.color} border`}>
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {stockStatus.text}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-t border-slate-300 bg-slate-100">
          <Button variant="outline" onClick={onClose} className="border-slate-800 text-slate-700 hover:bg-slate-50">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onEdit(product)}
              className="border-slate-800 text-slate-700 hover:bg-slate-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              onClick={() => onStockMovement(product)}
              className="border-slate-800 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Stock
            </Button>
            <Button
              variant="outline"
              onClick={() => onDelete(product)}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
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
