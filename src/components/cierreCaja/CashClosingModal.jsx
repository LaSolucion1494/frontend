"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { X, CreditCard, DollarSign, AlertTriangle, Calculator } from "lucide-react"
import { formatCurrency } from "../../lib/utils"
import { useCashClosing } from "../../hooks/useCashClosing"

const CashClosingModal = ({ isOpen, onClose, onComplete, dailySummary }) => {
  const [formData, setFormData] = useState({
    efectivoEnCaja: "",
    observaciones: "",
  })
  const [errors, setErrors] = useState({})

  const { createClosing, loading } = useCashClosing()

  useEffect(() => {
    if (isOpen) {
      setFormData({
        efectivoEnCaja: "",
        observaciones: "",
      })
      setErrors({})
    }
  }, [isOpen])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Limpiar errores
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.efectivoEnCaja || Number.parseFloat(formData.efectivoEnCaja) < 0) {
      newErrors.efectivoEnCaja = "El efectivo en caja es requerido y debe ser mayor o igual a 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const closingData = {
      efectivoEnCaja: Number.parseFloat(formData.efectivoEnCaja),
      observaciones: formData.observaciones.trim() || null,
    }

    const result = await createClosing(closingData)

    if (result.success) {
      onComplete()
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen || !dailySummary) return null

  const efectivoEsperado = dailySummary.ventasPorTipoPago
    .filter((v) => v.tipo_pago === "efectivo")
    .reduce((sum, v) => sum + Number.parseFloat(v.total_monto || 0), 0)

  const efectivoEnCaja = Number.parseFloat(formData.efectivoEnCaja) || 0
  const diferencia = efectivoEnCaja - efectivoEsperado

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Nuevo Cierre de Caja</h2>
              <p className="text-sm text-slate-300 mt-1">{new Date(dailySummary.fecha).toLocaleDateString("es-AR")}</p>
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
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Resumen de ventas */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-blue-800">Resumen de Ventas del Día</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-600">Total Ventas:</p>
                      <p className="font-semibold text-blue-800">{dailySummary.resumenTotal.total_ventas}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">Monto Total:</p>
                      <p className="font-semibold text-blue-800">
                        {formatCurrency(dailySummary.resumenTotal.monto_total || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Desglose por método de pago */}
                  <div className="pt-3 border-t border-blue-200">
                    <p className="text-sm text-blue-600 mb-2">Por método de pago:</p>
                    <div className="space-y-2">
                      {dailySummary.ventasPorTipoPago.map((payment) => (
                        <div key={payment.tipo_pago} className="flex justify-between items-center">
                          <span className="text-sm capitalize text-slate-700">{payment.tipo_pago}:</span>
                          <span className="font-medium text-slate-900">{formatCurrency(payment.total_monto || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Efectivo esperado */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Efectivo Esperado:</span>
                    </div>
                    <span className="text-xl font-bold text-green-800">{formatCurrency(efectivoEsperado)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Efectivo en caja */}
              <div className="space-y-2">
                <Label htmlFor="efectivoEnCaja" className="text-sm font-medium text-slate-700">
                  Efectivo en Caja *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="efectivoEnCaja"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.efectivoEnCaja}
                    onChange={(e) => handleChange("efectivoEnCaja", e.target.value)}
                    placeholder="0.00"
                    className={`pl-10 h-12 text-lg ${errors.efectivoEnCaja ? "border-red-500" : "border-slate-300"}`}
                    disabled={loading}
                  />
                </div>
                {errors.efectivoEnCaja && <p className="text-sm text-red-600">{errors.efectivoEnCaja}</p>}
              </div>

              {/* Diferencia calculada */}
              {formData.efectivoEnCaja && (
                <Card
                  className={`${
                    diferencia === 0
                      ? "bg-blue-50 border-blue-200"
                      : diferencia > 0
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calculator
                          className={`w-5 h-5 ${
                            diferencia === 0 ? "text-blue-600" : diferencia > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            diferencia === 0 ? "text-blue-800" : diferencia > 0 ? "text-green-800" : "text-red-800"
                          }`}
                        >
                          {diferencia === 0 ? "Cuadra Perfecto" : diferencia > 0 ? "Sobrante" : "Faltante"}:
                        </span>
                      </div>
                      <span
                        className={`text-xl font-bold ${
                          diferencia === 0 ? "text-blue-800" : diferencia > 0 ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {diferencia === 0 ? "✓" : formatCurrency(Math.abs(diferencia))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="observaciones" className="text-sm font-medium text-slate-700">
                  Observaciones
                </Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleChange("observaciones", e.target.value)}
                  placeholder="Notas adicionales sobre el cierre..."
                  rows={3}
                  className="border-slate-300 resize-none"
                  disabled={loading}
                />
              </div>

              {/* Advertencia si hay diferencia */}
              {formData.efectivoEnCaja && diferencia !== 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Diferencia detectada</p>
                      <p>
                        Se registrará una {diferencia > 0 ? "sobrante" : "faltante"} de{" "}
                        <strong>{formatCurrency(Math.abs(diferencia))}</strong>. Asegúrate de contar bien el efectivo
                        antes de confirmar.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={loading || !formData.efectivoEnCaja}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirmar Cierre
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CashClosingModal
