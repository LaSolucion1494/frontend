"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { X, Save, FileText, User, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { NumericFormat } from "react-number-format"

const AjusteModal = ({ isOpen, onClose, onSave, cliente = null }) => {
  const [formData, setFormData] = useState({
    cliente_id: "",
    tipo: "disminuir_saldo", // Cambiado de "credito" a "disminuir_saldo"
    monto: "",
    concepto: "",
    notas: "",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && cliente) {
      setFormData((prev) => ({
        ...prev,
        cliente_id: cliente.cliente_id || cliente.id,
      }))
    } else if (isOpen && !cliente) {
      resetForm()
    }
  }, [isOpen, cliente])

  const resetForm = () => {
    setFormData({
      cliente_id: "",
      tipo: "disminuir_saldo", // Cambiado de "credito" a "disminuir_saldo"
      monto: "",
      concepto: "",
      notas: "",
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.monto || Number.parseFloat(formData.monto) <= 0) {
      newErrors.monto = "El monto debe ser mayor a 0"
    }

    if (!formData.concepto) {
      newErrors.concepto = "El concepto es obligatorio"
    }

    const saldoActualNumerico = Number(cliente?.saldo_actual) || 0

    if (cliente && formData.tipo === "aumentar_saldo" && cliente.limite_credito) {
      // Para aumentar_saldo (débito), validar límite de crédito
      const nuevoSaldoSimulado = saldoActualNumerico + Number.parseFloat(formData.monto || 0)
      if (nuevoSaldoSimulado > cliente.limite_credito) {
        const disponible = cliente.limite_credito - saldoActualNumerico
        newErrors.monto = `El ajuste excede el límite de crédito. Disponible: ${formatCurrency(disponible)}`
      }
    }

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
      const ajusteData = {
        cliente_id: Number.parseInt(formData.cliente_id),
        tipo: formData.tipo, // Ahora envía "aumentar_saldo" o "disminuir_saldo"
        monto: Number.parseFloat(formData.monto),
        concepto: formData.concepto,
        notas: formData.notas || null,
      }

      const result = await onSave(ajusteData)

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
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Crear Ajuste</h2>
              <p className="text-sm text-slate-300 mt-1">Registra un ajuste manual en la cuenta corriente</p>
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
                {/* Información del Cliente */}
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

                {/* Información del ajuste */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                    <CardTitle className="text-base font-semibold text-slate-800 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-slate-600" />
                      Información del Ajuste
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Tipo de Ajuste</Label>
                        <RadioGroup
                          value={formData.tipo}
                          onValueChange={(value) => handleChange("tipo", value)}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="disminuir_saldo" id="disminuir_saldo" className="peer sr-only" />
                            <Label
                              htmlFor="disminuir_saldo"
                              className="flex items-center space-x-2 cursor-pointer text-green-700 p-2 rounded-md border border-transparent peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-50 hover:bg-slate-50"
                            >
                              <ArrowDownRight className="w-4 h-4" />
                              <span>Disminuir saldo (reduce deuda)</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="aumentar_saldo" id="aumentar_saldo" className="peer sr-only" />
                            <Label
                              htmlFor="aumentar_saldo"
                              className="flex items-center space-x-2 cursor-pointer text-red-700 p-2 rounded-md border border-transparent peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-50 hover:bg-slate-50"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                              <span>Aumentar saldo (aumenta deuda)</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="monto" className="text-sm font-medium text-slate-700">
                            Monto *
                          </Label>
                          <NumericFormat
                            id="monto"
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
                          {errors.monto && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">{errors.monto}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="concepto" className="text-sm font-medium text-slate-700">
                            Concepto *
                          </Label>
                          <Input
                            id="concepto"
                            value={formData.concepto}
                            onChange={(e) => handleChange("concepto", e.target.value)}
                            placeholder="Motivo del ajuste"
                            className={`h-10 ${errors.concepto ? "border-red-500" : "border-slate-300"} bg-slate-50 focus:border-slate-800 focus:ring-slate-800/20`}
                            disabled={loading}
                          />
                          {errors.concepto && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">{errors.concepto}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notas" className="text-sm font-medium text-slate-700">
                          Notas (opcional)
                        </Label>
                        <Textarea
                          id="notas"
                          value={formData.notas}
                          onChange={(e) => handleChange("notas", e.target.value)}
                          placeholder="Notas adicionales sobre el ajuste..."
                          rows={3}
                          className="border-slate-300 bg-slate-50 focus:border-slate-800 focus:ring-slate-800/20 resize-none"
                          disabled={loading}
                        />
                      </div>
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
                    Crear Ajuste
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

export default AjusteModal
