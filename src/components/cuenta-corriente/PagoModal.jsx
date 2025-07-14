"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { X, Save, DollarSign, User, AlertCircle, Calendar } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { NumericFormat } from "react-number-format"

const PagoModal = ({ isOpen, onClose, onSave, cliente = null }) => {
  const [formData, setFormData] = useState({
    cliente_id: "",
    monto: "",
    fecha_pago: new Date().toISOString().split("T")[0],
    comprobante: "",
    notas: "",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && cliente) {
      const saldoActualNumerico = Number(cliente.saldo_actual) || 0
      setFormData((prev) => ({
        ...prev,
        cliente_id: cliente.cliente_id || cliente.id,
        // Pre-llenar con saldo si hay deuda (saldo positivo)
        monto: saldoActualNumerico > 0 ? saldoActualNumerico.toFixed(2) : "",
      }))
    } else if (isOpen && !cliente) {
      resetForm()
    }
  }, [isOpen, cliente])

  const resetForm = () => {
    setFormData({
      cliente_id: "",
      monto: "",
      fecha_pago: new Date().toISOString().split("T")[0],
      comprobante: "",
      notas: "",
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.monto || Number.parseFloat(formData.monto) <= 0) {
      newErrors.monto = "El monto debe ser mayor a 0"
    }

    if (!formData.fecha_pago) {
      newErrors.fecha_pago = "La fecha es obligatoria"
    }

    const saldoActualNumerico = Number(cliente?.saldo_actual) || 0

    // Validar que el cliente tenga saldo pendiente (deuda) para pagar
    if (cliente && saldoActualNumerico <= 0 && Number.parseFloat(formData.monto) > 0) {
      // Si el saldo es 0 o a favor, y se intenta pagar, se asume que es un error
      // o que el pago es para una deuda futura. Para este caso, se permite.
      // Si se quiere restringir, se podría añadir:
      // newErrors.monto = "El cliente no tiene saldo pendiente para pagar";
    }

    // La validación de que el monto no sea mayor al saldo actual se elimina,
    // ya que ahora se permite que el pago genere un saldo a favor.

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const pagoData = {
        cliente_id: Number.parseInt(formData.cliente_id),
        monto: Number.parseFloat(formData.monto),
        fecha_pago: formData.fecha_pago,
        comprobante: formData.comprobante || null,
        notas: formData.notas || null,
      }

      const result = await onSave(pagoData)

      if (result.success) {
        resetForm()
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  }

  if (!isOpen) return null
  if (!cliente) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
      <div className="bg-white shadow-xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden relative z-[101]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Registrar Pago</h2>
              <p className="text-sm text-slate-300 mt-1">Registra un pago para la cuenta corriente</p>
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
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(90vh - 200px)" }}>
            <div className="p-6">
              <div className="space-y-6">
                {/* Información del Cliente (Minimalista) */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                    <CardTitle className="text-base font-semibold text-slate-800 flex items-center">
                      <User className="w-4 h-4 mr-2 text-slate-600" />
                      Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900">{cliente.cliente_nombre || cliente.nombre}</div>
                          <div className="text-sm text-slate-600">
                            {cliente.cliente_telefono && <span>Tel: {cliente.cliente_telefono}</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información de cuenta corriente */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <div className="text-xs text-slate-600 mb-1">Saldo Actual</div>
                        <div
                          className={`font-semibold ${
                            (Number(cliente.saldo_actual) || 0) > 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {formatCurrency(Number(cliente.saldo_actual) || 0)}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <div className="text-xs text-slate-600 mb-1">Límite de Crédito</div>
                        <div className="font-semibold text-slate-900">
                          {cliente.limite_credito ? formatCurrency(cliente.limite_credito) : "Sin límite"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Información del pago */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                    <CardTitle className="text-base font-semibold text-slate-800 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-slate-600" />
                      Información del Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="monto" className="text-sm font-medium text-slate-700">
                          Monto *
                        </Label>
                        <div className="relative">
                          <NumericFormat
                            value={formData.monto}
                            onValueChange={(values) => handleChange("monto", values.value)}
                            thousandSeparator="."
                            decimalSeparator=","
                            decimalScale={2}
                            fixedDecimalScale={true}
                            allowNegative={false}
                            placeholder="0,00"
                            className={`h-10 w-full rounded-md border px-3 py-2 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800/20 ${
                              errors.monto ? "border-red-500" : "border-slate-300"
                            } bg-slate-50 focus:border-slate-800`}
                            disabled={loading}
                          />
                          <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                        {errors.monto && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{errors.monto}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fecha_pago" className="text-sm font-medium text-slate-700">
                          Fecha *
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <Input
                            id="fecha_pago"
                            type="date"
                            value={formData.fecha_pago}
                            onChange={(e) => handleChange("fecha_pago", e.target.value)}
                            className={`pl-10 h-10 ${
                              errors.fecha_pago ? "border-red-500" : "border-slate-300"
                            } bg-slate-50 focus:border-slate-800 focus:ring-slate-800/20`}
                            disabled={loading}
                          />
                        </div>
                        {errors.fecha_pago && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{errors.fecha_pago}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comprobante" className="text-sm font-medium text-slate-700">
                        Comprobante (opcional)
                      </Label>
                      <Input
                        id="comprobante"
                        value={formData.comprobante}
                        onChange={(e) => handleChange("comprobante", e.target.value)}
                        placeholder="Número de comprobante o recibo"
                        className="h-10 border-slate-300 bg-slate-50 focus:border-slate-800 focus:ring-slate-800/20"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notas" className="text-sm font-medium text-slate-700">
                        Notas (opcional)
                      </Label>
                      <Textarea
                        id="notas"
                        value={formData.notas}
                        onChange={(e) => handleChange("notas", e.target.value)}
                        placeholder="Notas adicionales sobre el pago..."
                        rows={3}
                        className="border-slate-300 resize-none bg-slate-50 focus:border-slate-800 focus:ring-slate-800/20"
                        disabled={loading}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="flex-shrink-0 flex justify-between items-center p-6 border-t border-slate-300 bg-slate-100">
            <div className="text-sm text-slate-600">
              {cliente && (
                <span>
                  Saldo actual: <span className="font-medium">{formatCurrency(Number(cliente.saldo_actual) || 0)}</span>
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="px-6 h-10 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm bg-transparent"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="px-6 h-10 bg-slate-800 hover:bg-slate-700 text-white text-sm"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Registrar Pago
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PagoModal
