"use client"

import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { X, CreditCard, DollarSign, TrendingUp, TrendingDown, FileText, Calculator, ShoppingCart } from "lucide-react"
import { formatCurrency, formatDateTime } from "../../lib/utils"

const CashClosingDetailsModal = ({ isOpen, onClose, closing }) => {
  if (!isOpen || !closing) return null

  const diferencia = Number.parseFloat(closing.diferencia) || 0
  const isDiferenciaPositiva = diferencia > 0
  const isDiferenciaNegativa = diferencia < 0
  const isDiferenciaCero = diferencia === 0

  // Parsear detalles de ventas si existen
  const detallesVentas = closing.detalles_ventas || []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Detalles del Cierre de Caja</h2>
              <p className="text-sm text-slate-300 mt-1">
                {new Date(closing.fecha_cierre).toLocaleDateString("es-AR")}
              </p>
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Información principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información del cierre */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Información del Cierre
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fecha de cierre:</span>
                    <span className="font-medium">{formatDateTime(closing.fecha_cierre)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Realizado por:</span>
                    <span className="font-medium">{closing.usuario_nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fecha de registro:</span>
                    <span className="font-medium">{formatDateTime(closing.fecha_creacion)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Resumen de ventas */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Resumen de Ventas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total de ventas:</span>
                    <Badge variant="secondary">{closing.total_ventas} ventas</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monto total:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(Number.parseFloat(closing.monto_total_ventas) || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalles por método de pago */}
            {detallesVentas.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Desglose por Método de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {detallesVentas.map((detalle, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="text-center">
                          <p className="text-sm text-slate-600 capitalize mb-1">{detalle.tipo_pago}</p>
                          <p className="text-lg font-semibold text-slate-900">
                            {formatCurrency(Number.parseFloat(detalle.total_monto) || 0)}
                          </p>
                          <p className="text-xs text-slate-500">{detalle.cantidad_ventas} ventas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Análisis de efectivo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Efectivo esperado */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-600 mb-1">Efectivo Esperado</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(Number.parseFloat(closing.efectivo_esperado) || 0)}
                  </p>
                </CardContent>
              </Card>

              {/* Efectivo en caja */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Calculator className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm text-green-600 mb-1">Efectivo en Caja</p>
                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(Number.parseFloat(closing.efectivo_en_caja) || 0)}
                  </p>
                </CardContent>
              </Card>

              {/* Diferencia */}
              <Card
                className={`${
                  isDiferenciaCero
                    ? "bg-blue-50 border-blue-200"
                    : isDiferenciaPositiva
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                }`}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                      isDiferenciaCero ? "bg-blue-100" : isDiferenciaPositiva ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {isDiferenciaCero ? (
                      <Calculator
                        className={`w-6 h-6 ${
                          isDiferenciaCero ? "text-blue-600" : isDiferenciaPositiva ? "text-green-600" : "text-red-600"
                        }`}
                      />
                    ) : isDiferenciaPositiva ? (
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <p
                    className={`text-sm mb-1 ${
                      isDiferenciaCero ? "text-blue-600" : isDiferenciaPositiva ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isDiferenciaCero ? "Cuadra Perfecto" : isDiferenciaPositiva ? "Sobrante" : "Faltante"}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDiferenciaCero ? "text-blue-800" : isDiferenciaPositiva ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {isDiferenciaCero ? "✓" : formatCurrency(Math.abs(diferencia))}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Observaciones */}
            {closing.observaciones && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Observaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-slate-700 whitespace-pre-wrap">{closing.observaciones}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end p-6 border-t border-slate-200 bg-slate-50">
          <Button onClick={onClose} className="bg-slate-800 hover:bg-slate-700">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CashClosingDetailsModal
