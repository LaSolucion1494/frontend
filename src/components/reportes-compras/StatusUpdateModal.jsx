"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Edit, CheckCircle, Clock, XCircle, AlertTriangle, AlertCircle, Package, Calendar } from "lucide-react"
import toast from "react-hot-toast"

// Componente para formatear precios
const PriceDisplay = ({ value, className = "" }) => {
  return (
    <span className={className}>
      {new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
      }).format(value || 0)}
    </span>
  )
}

export default function StatusUpdateModal({ isOpen, onClose, purchase, onUpdate }) {
  const [newStatus, setNewStatus] = useState("")
  const [observations, setObservations] = useState("")
  const [saving, setSaving] = useState(false)

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && purchase) {
      setNewStatus(purchase.estado)
      setObservations(purchase.observaciones || "")
    }
  }, [isOpen, purchase])

  // Configuración de estados
  const statusConfig = {
    pendiente: {
      label: "Pendiente",
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      description: "La compra está registrada pero no se han recibido productos",
    },
    parcial: {
      label: "Parcial",
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-100",
      description: "Se han recibido algunos productos pero no todos",
    },
    recibida: {
      label: "Recibida",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
      description: "Todos los productos han sido recibidos completamente",
    },
    cancelada: {
      label: "Cancelada",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-100",
      description: "La compra ha sido cancelada y no se recibirán productos",
    },
  }

  // Obtener estados disponibles según el estado actual
  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case "pendiente":
        return ["pendiente", "parcial", "recibida", "cancelada"]
      case "parcial":
        return ["parcial", "recibida", "cancelada"]
      case "recibida":
        return ["recibida"] // No se puede cambiar desde recibida
      case "cancelada":
        return ["cancelada"] // No se puede cambiar desde cancelada
      default:
        return ["pendiente"]
    }
  }

  // Validar si el cambio de estado es válido
  const isValidStatusChange = (fromStatus, toStatus) => {
    if (fromStatus === toStatus) return true

    const validTransitions = {
      pendiente: ["parcial", "recibida", "cancelada"],
      parcial: ["recibida", "cancelada"],
      recibida: [], // No se puede cambiar
      cancelada: [], // No se puede cambiar
    }

    return validTransitions[fromStatus]?.includes(toStatus) || false
  }

  // Manejar actualización de estado
  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error("Seleccione un estado")
      return
    }

    if (!isValidStatusChange(purchase.estado, newStatus)) {
      toast.error("Cambio de estado no válido")
      return
    }

    // Validaciones específicas
    if (newStatus === "recibida" && purchase.estado === "pendiente") {
      toast.error("No puede marcar como recibida sin haber recibido productos. Use la opción 'Recibir Productos'")
      return
    }

    setSaving(true)
    try {
      const result = await onUpdate(purchase.id, {
        estado: newStatus,
        observaciones: observations.trim(),
      })

      if (result.success) {
        toast.success("Estado actualizado exitosamente")
        onClose()
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Error al actualizar el estado")
    } finally {
      setSaving(false)
    }
  }

  // Obtener badge de estado
  const getStatusBadge = (estado) => {
    const config = statusConfig[estado] || statusConfig.pendiente
    const Icon = config.icon

    return (
      <Badge variant="secondary" className={`flex items-center space-x-1 ${config.bg}`}>
        <Icon className={`h-3 w-3 ${config.color}`} />
        <span>{config.label}</span>
      </Badge>
    )
  }

  if (!purchase) return null

  const availableStatuses = getAvailableStatuses(purchase.estado)
  const selectedConfig = statusConfig[newStatus] || statusConfig.pendiente

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5 text-blue-600" />
            <span>Cambiar Estado - {purchase.numero_compra}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la compra */}
          <div className="p-4 bg-gray-50 rounded-lg">
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
                  {getStatusBadge(purchase.estado)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Total:</span>
                  <PriceDisplay value={purchase.total} className="font-medium text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Selección de nuevo estado */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newStatus">Nuevo Estado</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((status) => {
                    const config = statusConfig[status]
                    const Icon = config.icon
                    return (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center space-x-2">
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Descripción del estado seleccionado */}
            {newStatus && (
              <div className={`p-3 rounded-lg ${selectedConfig.bg}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <selectedConfig.icon className={`h-4 w-4 ${selectedConfig.color}`} />
                  <span className={`font-medium ${selectedConfig.color}`}>{selectedConfig.label}</span>
                </div>
                <p className="text-sm text-gray-700">{selectedConfig.description}</p>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              placeholder="Agregue observaciones sobre el cambio de estado..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Alertas según el estado */}
          {newStatus === "cancelada" && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Atención:</strong> Al cancelar la compra, no se podrán recibir más productos. Esta acción debe
                ser realizada solo si la compra no se va a completar.
              </AlertDescription>
            </Alert>
          )}

          {newStatus === "recibida" && purchase.estado !== "recibida" && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Nota:</strong> Marcar como recibida indica que todos los productos han sido entregados
                completamente. Asegúrese de haber recibido todos los productos antes de confirmar.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateStatus} disabled={saving || !newStatus || newStatus === purchase.estado}>
            {saving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Actualizando...</span>
              </div>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Actualizar Estado
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
