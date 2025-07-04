"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { NumericFormat } from "react-number-format"
import {
  CreditCard,
  DollarSign,
  Smartphone,
  Building2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  User,
  Calculator,
  Receipt,
} from "lucide-react"
import toast from "react-hot-toast"

const PAYMENT_TYPES = [
  {
    value: "efectivo",
    label: "Efectivo",
    icon: DollarSign,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    iconColor: "text-slate-600",
  },
  {
    value: "tarjeta",
    label: "Tarjeta",
    icon: CreditCard,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    iconColor: "text-slate-600",
  },
  {
    value: "transferencia",
    label: "Transferencia",
    icon: Smartphone,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    iconColor: "text-slate-600",
  },
  {
    value: "cuenta_corriente",
    label: "Cuenta Corriente",
    icon: Building2,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    iconColor: "text-slate-600",
  },
]

const PaymentModal = ({ isOpen, onClose, total, onConfirm, selectedClient = null, clients = [], loading = false }) => {
  const [payments, setPayments] = useState([])
  const [newPayment, setNewPayment] = useState({
    type: "efectivo",
    amount: "",
    description: "",
  })
  const [errors, setErrors] = useState({})

  // Resetear estado cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setPayments([])
      setNewPayment({
        type: "efectivo",
        amount: "",
        description: "",
      })
      setErrors({})
    }
  }, [isOpen, total])

  // Calcular totales
  const totalPaid = payments.reduce((sum, payment) => sum + Number.parseFloat(payment.amount || 0), 0)
  const remaining = total - totalPaid
  const isExactAmount = Math.abs(remaining) < 0.01
  const isOverpaid = remaining < -0.01

  // Validar pagos
  const validatePayments = () => {
    const newErrors = {}

    if (payments.length === 0) {
      newErrors.general = "Debe agregar al menos un método de pago"
      setErrors(newErrors)
      return false
    }

    payments.forEach((payment, index) => {
      if (!payment.amount || payment.amount <= 0) {
        newErrors[`payment_${index}`] = "El monto debe ser mayor a 0"
      }
      if (!payment.type) {
        newErrors[`payment_type_${index}`] = "Debe seleccionar un tipo de pago"
      }
    })

    const hasCuentaCorriente = payments.some((p) => p.type === "cuenta_corriente")
    if (hasCuentaCorriente && !selectedClient) {
      newErrors.cuenta_corriente = "Para pagar con cuenta corriente debe seleccionar un cliente registrado"
    }

    if (!isExactAmount && !isOverpaid) {
      newErrors.total = `Falta pagar ${formatCurrency(remaining)}`
    }

    if (isOverpaid) {
      newErrors.total = `Hay un exceso de ${formatCurrency(Math.abs(remaining))}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Agregar nuevo pago
  const addPayment = () => {
    if (!newPayment.amount || Number.parseFloat(newPayment.amount) <= 0) {
      toast.error("Ingrese un monto válido")
      return
    }

    if (!newPayment.type) {
      toast.error("Seleccione un tipo de pago")
      return
    }

    if (newPayment.type === "cuenta_corriente" && !selectedClient) {
      toast.error("Para pagar con cuenta corriente debe seleccionar un cliente registrado")
      return
    }

    const payment = {
      id: Date.now(),
      type: newPayment.type,
      amount: Number.parseFloat(newPayment.amount),
      description: newPayment.description || getDefaultDescription(newPayment.type),
    }

    setPayments((prev) => [...prev, payment])
    setNewPayment({
      type: "efectivo",
      amount: "",
      description: "",
    })
    setErrors({})
  }

  // Eliminar pago
  const removePayment = (paymentId) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId))
    setErrors({})
  }

  // Actualizar pago existente
  const updatePayment = (paymentId, field, value) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === paymentId
          ? { ...payment, [field]: field === "amount" ? Number.parseFloat(value || 0) : value }
          : payment,
      ),
    )
    setErrors({})
  }

  // Obtener descripción por defecto
  const getDefaultDescription = (type) => {
    const paymentType = PAYMENT_TYPES.find((pt) => pt.value === type)
    return `Pago con ${paymentType?.label.toLowerCase() || type}`
  }

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  }

  // Obtener configuración del tipo de pago
  const getPaymentConfig = (type) => {
    return PAYMENT_TYPES.find((pt) => pt.value === type) || PAYMENT_TYPES[0]
  }

  // Manejar confirmación
  const handleConfirm = () => {
    if (!validatePayments()) {
      return
    }
    onConfirm(payments)
  }

  // Pagar el resto con efectivo
  const payRemainingWithCash = () => {
    if (remaining > 0) {
      const payment = {
        id: Date.now(),
        type: "efectivo",
        amount: remaining,
        description: "Pago del saldo restante en efectivo",
      }
      setPayments((prev) => [...prev, payment])
    }
  }

  // Ajustar el primer pago al total exacto
  const adjustToExactAmount = () => {
    if (payments.length > 0) {
      const firstPayment = payments[0]
      const otherPaymentsTotal = payments.slice(1).reduce((sum, p) => sum + p.amount, 0)
      const adjustedAmount = total - otherPaymentsTotal

      if (adjustedAmount > 0) {
        updatePayment(firstPayment.id, "amount", adjustedAmount)
      }
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden bg-white flex flex-col p-0">
        {/* Header minimalista */}
        <div className="flex-shrink-0 p-3 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-slate-800 rounded-md">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <DialogTitle className="text-lg font-semibold text-slate-800">Métodos de Pago</DialogTitle>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-y-auto min-h-0 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
            {/* Columna izquierda */}
            <div className="space-y-3">
              {/* Nuevo Pago - Minimalista */}
              <Card className="border-slate-300 shadow-sm bg-slate-800">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm font-medium text-white flex items-center">
                    <Plus className="w-3.5 h-3.5 mr-1.5 text-slate-100" />
                    Nuevo Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  {/* Tipo de pago y monto en fila */}
                  <div className="grid grid-cols-2 gap-2 -mt-8">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-100">Método</Label>
                      <Select
                        value={newPayment.type}
                        onValueChange={(value) => setNewPayment((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="h-8 border-slate-200 text-sm">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_TYPES.map((type) => {
                            const IconComponent = type.icon
                            const isDisabled = type.value === "cuenta_corriente" && !selectedClient

                            return (
                              <SelectItem key={type.value} value={type.value} disabled={isDisabled} className="py-1.5">
                                <div className="flex items-center space-x-2">
                                  <IconComponent className="w-3.5 h-3.5 text-slate-600" />
                                  <span className="text-sm">{type.label}</span>
                                  {isDisabled && <span className="text-xs text-slate-500">(Req. cliente)</span>}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-100">Monto</Label>
                      <div className="relative">
                        <NumericFormat
                          value={newPayment.amount}
                          onValueChange={(values) => setNewPayment((prev) => ({ ...prev, amount: values.value }))}
                          thousandSeparator="."
                          decimalSeparator=","
                          decimalScale={2}
                          fixedDecimalScale={true}
                          allowNegative={false}
                          placeholder="0,00"
                          className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800/20"
                        />
                        <DollarSign className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-slate-100">Descripción</Label>
                    <Input
                      value={newPayment.description}
                      onChange={(e) => setNewPayment((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder={getDefaultDescription(newPayment.type)}
                      className="h-8 border-slate-200 focus:border-slate-800 text-sm"
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={addPayment}
                      className="flex-1 h-8 border-slate-200 text-slate-800 hover:bg-slate-50 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Agregar
                    </Button>
                    {remaining > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => setNewPayment((prev) => ({ ...prev, amount: remaining.toString() }))}
                        className="h-8 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs px-2"
                      >
                        Resto
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pagos Agregados minimalista */}
              <Card className="border-slate-300 shadow-sm bg-slate-800">
                <CardHeader className="pb-2 pt-3 px-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-100">Pagos</CardTitle>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                      {payments.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {payments.length > 0 ? (
                    <div className="max-h-[calc(90vh-350px)] overflow-y-auto -mt-5">
                      {payments.map((payment) => {
                        const config = getPaymentConfig(payment.type)
                        const IconComponent = config.icon

                        return (
                          <div
                            key={payment.id}
                            className="p-2.5 bg-slate-50 "
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <IconComponent className="w-3.5 h-3.5 text-slate-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs text-slate-800 truncate">{config.label}</p>
                                  <p className="text-xs text-slate-500 truncate">{payment.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1.5 ml-2">
                                <NumericFormat
                                  value={payment.amount}
                                  onValueChange={(values) => updatePayment(payment.id, "amount", values.value)}
                                  thousandSeparator="."
                                  decimalSeparator=","
                                  decimalScale={2}
                                  fixedDecimalScale={true}
                                  allowNegative={false}
                                  className="w-20 h-6 text-xs text-right border border-slate-200 rounded px-1.5 focus:border-slate-800 focus:outline-none"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-slate-50"
                                  onClick={() => removePayment(payment.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-5 px-3 -mt-5">
                      <CreditCard className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                      <p className="text-xs text-slate-500">Sin métodos de pago</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Columna derecha - Resumen minimalista */}
            <div>
              <Card className="border-slate-300 bg-slate-800 shadow-sm h-fit">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm font-medium text-slate-100 flex items-center">
                    <Calculator className="w-3.5 h-3.5 mr-1.5 text-slate-100" />
                    Resumen
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3 -mt-7">
                  {/* Detalles minimalistas */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-100">Total:</span>
                      <span className="font-medium text-slate-50">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-100">Pagado:</span>
                      <span className="font-medium text-slate-50">{formatCurrency(totalPaid)}</span>
                    </div>
                    <Separator className="bg-slate-100 my-1" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-100">
                        {remaining > 0.01 ? "Falta:" : remaining < -0.01 ? "Exceso:" : "Estado:"}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {isExactAmount ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            <span className="font-medium text-xs text-green-500">Exacto</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className={`w-3.5 h-3.5 ${isOverpaid ? "text-red-500" : "text-amber-500"}`} />
                            <span className={`font-medium text-xs ${isOverpaid ? "text-red-500" : "text-amber-500"}`}>
                              {formatCurrency(Math.abs(remaining))}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Estado visual minimalista */}
                  <div
                    className={`p-2.5 rounded-md border ${isExactAmount
                      ? "bg-slate-50 border-slate-200"
                      : isOverpaid
                        ? "bg-red-50 border-red-100"
                        : "bg-amber-50 border-amber-100"
                      }`}
                  >
                    <div className="text-center">
                      {isExactAmount ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                      ) : (
                        <AlertCircle
                          className={`w-5 h-5 mx-auto mb-1 ${isOverpaid ? "text-red-500" : "text-amber-500"}`}
                        />
                      )}
                      <p
                        className={`font-medium text-xs ${isExactAmount ? "text-green-500" : isOverpaid ? "text-red-600" : "text-amber-600"
                          }`}
                      >
                        {isExactAmount ? "¡Completo!" : isOverpaid ? "Exceso" : "Incompleto"}
                      </p>
                    </div>
                  </div>

                  {/* Acciones rápidas minimalistas */}
                  {remaining > 0.01 && (
                    <div className="space-y-1.5">
                      <Button
                        variant="outline"
                        onClick={payRemainingWithCash}
                        className="w-full h-7 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        Resto en efectivo
                      </Button>
                      {payments.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={adjustToExactAmount}
                          className="w-full h-7 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                        >
                          <Calculator className="w-3 h-3 mr-1" />
                          Ajustar primer pago
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Errores minimalistas */}
                  {Object.keys(errors).length > 0 && (
                    <div className="border border-red-100 bg-red-50 rounded-md p-2.5">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="space-y-0.5">
                          <p className="font-medium text-red-600 text-xs">Errores:</p>
                          {Object.values(errors).map((error, index) => (
                            <p key={index} className="text-xs text-red-500">
                              • {error}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer minimalista */}
        <div className="flex-shrink-0 border-t border-slate-100 p-3 bg-white">
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">
              {payments.length > 0 && (
                <span>
                  {payments.length} método{payments.length !== 1 ? "s" : ""} • {formatCurrency(totalPaid)}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="px-4 h-8 border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={loading || !isExactAmount || payments.length === 0}
                className="px-4 h-8 bg-slate-800 hover:bg-slate-700 text-white text-xs"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Confirmar ({formatCurrency(total)})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentModal
