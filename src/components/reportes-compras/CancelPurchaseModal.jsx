"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, AlertCircle, Trash2, Package, Calendar } from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency } from "@/lib/utils"

export default function CancelPurchaseModal({ isOpen, onClose, purchase, onCancel }) {
  const [motivo, setMotivo] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMotivo("")
      setSaving(false)
    }
  }, [isOpen])

  const handleCancel = async () => {
    if (!motivo.trim()) {
      toast.error("Debe especificar un motivo para la cancelación.")
      return
    }

    setSaving(true)
    try {
      const result = await onCancel(purchase.id, motivo.trim())
      if (result.success) {
        toast.success("Compra cancelada exitosamente. Stock revertido.")
        onClose()
      } else {
        toast.error(result.message || "Error al cancelar la compra.")
      }
    } catch (error) {
      console.error("Error cancelling purchase:", error)
      toast.error("Error inesperado al cancelar la compra.")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !purchase) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
      <div className="bg-white shadow-xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden relative z-[101]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-slate-800 text-white">
          <div className="flex items-center space-x-3">
            <Trash2 className="h-6 w-6 text-red-300" />
            <span className="text-xl font-semibold">Cancelar Compra - {purchase.numero_compra}</span>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            disabled={saving}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Información de la compra */}
            <Card className="border border-slate-800">
              <CardHeader>
                <CardTitle>Información de la Compra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Fecha:</span>
                      <span className="font-medium">{new Date(purchase.fecha_compra).toLocaleDateString("es-AR")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Proveedor:</span>
                      <span className="font-medium">{purchase.proveedor_nombre}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Estado actual:</span>
                      <span className="font-medium text-red-600">{purchase.estado_formatted}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="font-medium text-green-600">{formatCurrency(purchase.total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Motivo de cancelación */}
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de Cancelación</Label>
              <Textarea
                id="motivo"
                placeholder="Explique por qué se está cancelando esta compra..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={4}
                className="resize-none border border-slate-800"
              />
            </div>

            {/* Alerta de impacto */}
            <Alert className="border border-slate-800 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-900">¡Acción Irreversible!</AlertTitle>
              <AlertDescription className="text-red-800">
                Al cancelar esta compra, se revertirán los cambios de stock de los productos que fueron recibidos. Esta
                acción no se puede deshacer.
              </AlertDescription>
            </Alert>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-end space-x-3 p-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={saving} className="border-slate-800 bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
            <Button onClick={handleCancel} disabled={saving || !motivo.trim()}>
              {saving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Cancelando...</span>
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Confirmar Cancelación
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
