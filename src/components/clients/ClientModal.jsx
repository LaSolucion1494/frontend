"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { User, Save, X, Phone, Mail, MapPin, FileText, Building, AlertCircle } from "lucide-react"

const ClientModal = ({ isOpen, onClose, onSave, client, isEditing, loading }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    cuit: "",
    notas: "",
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (client && isEditing) {
      setFormData({
        nombre: client.nombre || "",
        telefono: client.telefono || "",
        email: client.email || "",
        direccion: client.direccion || "",
        cuit: client.cuit || "",
        notas: client.notas || "",
      })
    } else {
      setFormData({
        nombre: "",
        telefono: "",
        email: "",
        direccion: "",
        cuit: "",
        notas: "",
      })
    }
    setErrors({})
  }, [client, isEditing, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Limpiar campos vacíos
    const dataToSave = {
      nombre: formData.nombre.trim(),
      telefono: formData.telefono.trim() || null,
      email: formData.email.trim() || null,
      direccion: formData.direccion.trim() || null,
      cuit: formData.cuit.trim() || null,
      notas: formData.notas.trim() || null,
    }

    await onSave(dataToSave)
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        nombre: "",
        telefono: "",
        email: "",
        direccion: "",
        cuit: "",
        notas: "",
      })
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{isEditing ? "Editar Cliente" : "Nuevo Cliente"}</h2>
              <p className="text-sm text-slate-300 mt-1">
                {isEditing ? "Modifica la información del cliente" : "Agrega un nuevo cliente"}
              </p>
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
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Información Básica
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium text-slate-700">
                      Nombre *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => handleChange("nombre", e.target.value)}
                        placeholder="Nombre completo del cliente"
                        className={`pl-10 h-11 ${errors.nombre ? "border-red-500" : "border-slate-300"}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.nombre && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{errors.nombre}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-sm font-medium text-slate-700">
                      Teléfono
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => handleChange("telefono", e.target.value)}
                        placeholder="Número de teléfono"
                        className="pl-10 h-11 border-slate-300"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className={`pl-10 h-11 ${errors.email ? "border-red-500" : "border-slate-300"}`}
                        disabled={loading}
                      />
                    </div>
                    {errors.email && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{errors.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Información Adicional
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cuit" className="text-sm font-medium text-slate-700">
                      CUIT
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="cuit"
                        value={formData.cuit}
                        onChange={(e) => handleChange("cuit", e.target.value)}
                        placeholder="XX-XXXXXXXX-X"
                        className="pl-10 h-11 border-slate-300 font-mono"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direccion" className="text-sm font-medium text-slate-700">
                      Dirección
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="direccion"
                        value={formData.direccion}
                        onChange={(e) => handleChange("direccion", e.target.value)}
                        placeholder="Dirección completa"
                        className="pl-10 h-11 border-slate-300"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas" className="text-sm font-medium text-slate-700">
                    Notas
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                    <Textarea
                      id="notas"
                      value={formData.notas}
                      onChange={(e) => handleChange("notas", e.target.value)}
                      placeholder="Notas adicionales sobre el cliente..."
                      rows={3}
                      className="pl-10 border-slate-300 resize-none"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
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
            <Button type="submit" className="bg-slate-800 hover:bg-slate-700" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? "Actualizando..." : "Guardando..."}
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? "Actualizar" : "Guardar"} Cliente
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientModal
