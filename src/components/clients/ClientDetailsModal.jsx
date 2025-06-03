"use client"

import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
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
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
} from "lucide-react"

const ClientDetailsModal = ({ isOpen, onClose, client, onEdit, onDelete, onToggleStatus }) => {
  if (!client || !isOpen) return null

  const handleToggleStatus = () => {
    onToggleStatus(client)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Detalles del Cliente</h2>
              <p className="text-sm text-slate-300 mt-1">Información completa del cliente</p>
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
            {/* Información principal del cliente */}
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{client.nombre}</h2>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500">ID:</span>
                        <span className="font-mono font-semibold text-slate-900 bg-white px-2 py-1 rounded border">
                          #{client.id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      className={`${
                        client.activo
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      } border px-3 py-1`}
                    >
                      {client.activo ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                      {client.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    {client.id !== 1 && (
                      <Button variant="outline" size="sm" onClick={handleToggleStatus} className="flex items-center">
                        {client.activo ? (
                          <ToggleRight className="w-4 h-4 mr-2" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 mr-2" />
                        )}
                        {client.activo ? "Desactivar" : "Activar"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grid de información detallada */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información de Contacto */}
              <Card className="bg-white border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Información de Contacto</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Teléfono:
                      </span>
                      <span className="font-medium text-slate-900">{client.telefono || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email:
                      </span>
                      <span className="font-medium text-slate-900 break-all">{client.email || "-"}</span>
                    </div>
                    <div className="flex justify-between items-start py-2">
                      <span className="text-slate-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Dirección:
                      </span>
                      <span className="font-medium text-slate-900 text-right max-w-xs">{client.direccion || "-"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información Fiscal */}
              <Card className="bg-white border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Building className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Información Fiscal</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">CUIT:</span>
                      <span className="font-medium text-slate-900 font-mono">{client.cuit || "-"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Información Adicional */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-white border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Información Adicional</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-slate-600 text-sm">Fecha de registro:</span>
                      <p className="font-medium text-slate-900">
                        {new Date(client.fecha_creacion).toLocaleDateString("es-AR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {client.fecha_actualizacion && client.fecha_actualizacion !== client.fecha_creacion && (
                      <div>
                        <span className="text-slate-600 text-sm">Última actualización:</span>
                        <p className="font-medium text-slate-900">
                          {new Date(client.fecha_actualizacion).toLocaleDateString("es-AR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}

                    {client.notas && (
                      <div>
                        <span className="text-slate-600 text-sm flex items-center mb-2">
                          <FileText className="w-4 h-4 mr-1" />
                          Notas:
                        </span>
                        <div className="bg-slate-50 p-3 rounded border">
                          <p className="text-slate-900 text-sm whitespace-pre-wrap">{client.notas}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
            <Button
              variant="outline"
              onClick={() => onEdit(client)}
              className="hover:bg-blue-50"
              disabled={client.id === 1}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => onDelete(client)} disabled={client.id === 1}>
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDetailsModal
