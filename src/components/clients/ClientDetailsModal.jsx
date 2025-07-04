"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  User,
  Edit,
  Trash2,
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Building,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  History,
  Infinity,
  Calculator,
  UserCheck,
  Activity,
} from "lucide-react"
import { clientsService } from "../../services/clientsService"
import { Loading } from "../ui/loading"

const ClientDetailsModal = ({ isOpen, onClose, client, onEdit, onDelete, onToggleStatus }) => {
  const [cuentaCorriente, setCuentaCorriente] = useState(null)
  const [loadingCuenta, setLoadingCuenta] = useState(false)

  useEffect(() => {
    if (isOpen && client && client.tiene_cuenta_corriente) {
      fetchCuentaCorriente()
    } else {
      setCuentaCorriente(null)
    }
  }, [isOpen, client])

  const fetchCuentaCorriente = async () => {
    if (!client?.id) return

    setLoadingCuenta(true)
    try {
      const result = await clientsService.getCuentaCorriente(client.id)
      if (result.success) {
        setCuentaCorriente(result.data)
      }
    } catch (error) {
      console.error("Error al cargar cuenta corriente:", error)
    } finally {
      setLoadingCuenta(false)
    }
  }

  if (!client || !isOpen) return null

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  }

  const getSaldoStatus = (saldo, limite) => {
    if (!saldo || saldo <= 0.01) return "positive"
    if (!limite) return "normal" // Sin límite
    const porcentajeUsado = saldo / limite
    if (porcentajeUsado >= 0.9) return "critical"
    if (porcentajeUsado >= 0.7) return "warning"
    return "normal"
  }

  const tieneLimit = client.limite_credito !== null && client.limite_credito !== undefined
  const saldoPendiente = client.saldo_cuenta_corriente || 0
  const tieneSaldoPendiente = saldoPendiente > 0.01

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Detalles del Cliente</h2>
              <p className="text-sm text-slate-300 mt-1">Información completa y estado de cuenta</p>
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
                    <h1 className="text-3xl font-bold text-slate-900">{client.nombre}</h1>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4" />
                      <span>ID: #{client.id}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Registrado:{" "}
                        {new Date(client.fecha_creacion).toLocaleDateString("es-AR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cuenta Corriente - Solo si el cliente tiene cuenta corriente */}
            {client.tiene_cuenta_corriente ? (
              <div className="bg-white rounded-lg border border-slate-800 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Estado de Cuenta Corriente</h3>
                  {loadingCuenta && <Loading size="sm" className="ml-3" />}
                </div>

                {loadingCuenta ? (
                  <div className="flex items-center justify-center py-8">
                    <Loading text="Cargando información de cuenta corriente..." />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Configuración de Límite */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-700">Configuración de Límite</span>
                        {tieneLimit ? (
                          <Calculator className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Infinity className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge
                          className={`${tieneLimit
                              ? "bg-orange-100 text-orange-800 border-orange-200"
                              : "bg-green-100 text-green-800 border-green-200"
                            } border`}
                        >
                          {tieneLimit ? (
                            <>
                              <Calculator className="w-3 h-3 mr-1" />
                              Con límite
                            </>
                          ) : (
                            <>
                              <Infinity className="w-3 h-3 mr-1" />
                              Sin límite
                            </>
                          )}
                        </Badge>
                        {tieneLimit && (
                          <span className="text-sm font-medium text-slate-900">
                            {formatCurrency(client.limite_credito)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Métricas Principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Saldo Pendiente */}
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">Saldo Pendiente</span>
                          <DollarSign className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-2xl font-bold ${tieneSaldoPendiente ? "text-red-600" : "text-green-600"}`}
                          >
                            {formatCurrency(saldoPendiente)}
                          </span>
                          {tieneSaldoPendiente && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {tieneSaldoPendiente ? "Monto adeudado por el cliente" : "Sin deuda pendiente"}
                        </p>
                      </div>

                      {/* Crédito Disponible */}
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">Crédito Disponible</span>
                          <TrendingUp className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2">
                          {tieneLimit ? (
                            <>
                              <span
                                className={`text-2xl font-bold ${getSaldoStatus(saldoPendiente, client.limite_credito) === "critical"
                                    ? "text-red-600"
                                    : getSaldoStatus(saldoPendiente, client.limite_credito) === "warning"
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                  }`}
                              >
                                {formatCurrency(Math.max(0, (client.limite_credito || 0) - saldoPendiente))}
                              </span>
                              {getSaldoStatus(saldoPendiente, client.limite_credito) === "critical" && (
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                              )}
                            </>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Infinity className="w-6 h-6 text-green-600" />
                              <span className="text-2xl font-bold text-green-600">Ilimitado</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {tieneLimit ? "Crédito restante disponible" : "Sin restricciones de crédito"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Información de Contacto y Datos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información de Contacto */}
              <div className="bg-white rounded-lg border border-slate-800 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Información de Contacto</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Teléfono</span>
                    </div>
                    <span className="font-medium text-slate-900">{client.telefono || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Email</span>
                    </div>
                    <span className="font-medium text-slate-900 break-all text-right max-w-xs">
                      {client.email || "-"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <span className="text-slate-600">Dirección</span>
                    </div>
                    <span className="font-medium text-slate-900 text-right max-w-xs">{client.direccion || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Información Fiscal y Sistema */}
              <div className="bg-white rounded-lg border border-slate-800 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Building className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Información Fiscal</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">CUIT</span>
                    </div>
                    <span className="font-medium text-slate-900 font-mono">{client.cuit || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Cuenta Corriente</span>
                    </div>
                    <Badge
                      className={`${client.tiene_cuenta_corriente
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                        } border`}
                    >
                      {client.tiene_cuenta_corriente ? "Habilitada" : "No habilitada"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Última actualización</span>
                    </div>
                    <span className="font-medium text-slate-900 text-sm">
                      {client.fecha_actualizacion && client.fecha_actualizacion !== client.fecha_creacion
                        ? new Date(client.fecha_actualizacion).toLocaleDateString("es-AR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                        : "Sin cambios"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notas - Solo si existen */}
            {client.notas && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Notas Adicionales</h3>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">{client.notas}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-t border-slate-300 bg-slate-100">
          <Button variant="outline" onClick={onClose} className="border-slate-800 text-slate-700 hover:bg-slate-50">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
          <div className="flex space-x-3">
            {client.tiene_cuenta_corriente ? (
              <Button variant="outline" className="border-slate-800 text-slate-700 hover:bg-slate-50">
                <History className="w-4 h-4 mr-2" />
                Ver Movimientos
              </Button>
            ) : null}
            < Button
              variant="outline"
            onClick={() => onEdit(client)}
            className="border-slate-800 text-slate-700 hover:bg-slate-50"
            disabled={client.id === 1}
            >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={() => onDelete(client)}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            disabled={client.id === 1}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
    </div >
  )
}

export default ClientDetailsModal
