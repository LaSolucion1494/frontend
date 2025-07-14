"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Checkbox } from "../ui/checkbox"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { User, Save, X, AlertCircle, Infinity, Calculator } from "lucide-react"

const ClientModal = ({ isOpen, onClose, onSave, client, isEditing, loading }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    cuit: "",
    notas: "",
    // Campos para cuenta corriente
    tiene_cuenta_corriente: false,
    tipo_limite: "sin_limite", // "sin_limite" o "con_limite"
    limite_credito: "",
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      if (isEditing && client) {
        setFormData({
          nombre: client.nombre || "",
          telefono: client.telefono || "",
          email: client.email || "",
          direccion: client.direccion || "",
          cuit: client.cuit || "",
          notas: client.notas || "",
          tiene_cuenta_corriente: client.tiene_cuenta_corriente || false,
          tipo_limite: client.limite_credito ? "con_limite" : "sin_limite",
          limite_credito: client.limite_credito || "",
        })
      } else {
        setFormData({
          nombre: "",
          telefono: "",
          email: "",
          direccion: "",
          cuit: "",
          notas: "",
          tiene_cuenta_corriente: false,
          tipo_limite: "sin_limite",
          limite_credito: "",
        })
      }
      setErrors({})
    }
  }, [isOpen, isEditing, client])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Limpiar error si existe
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Si desactiva cuenta corriente, resetear configuración
    if (field === "tiene_cuenta_corriente" && !value) {
      setFormData((prev) => ({
        ...prev,
        tipo_limite: "sin_limite",
        limite_credito: "",
      }))
      if (errors.limite_credito) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.limite_credito
          return newErrors
        })
      }
    }

    // Si cambia a sin límite, limpiar el campo de límite
    if (field === "tipo_limite" && value === "sin_limite") {
      setFormData((prev) => ({
        ...prev,
        limite_credito: "",
      }))
      if (errors.limite_credito) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.limite_credito
          return newErrors
        })
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar nombre (obligatorio)
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = "El nombre no puede exceder 100 caracteres"
    }

    // Validar email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    // Validar límite de crédito solo si tiene cuenta corriente Y eligió con límite
    if (formData.tiene_cuenta_corriente && formData.tipo_limite === "con_limite") {
      if (!formData.limite_credito || Number.parseFloat(formData.limite_credito) <= 0) {
        newErrors.limite_credito = "El límite de crédito debe ser mayor a 0"
      }
    }

    // Validar longitud de campos
    if (formData.telefono.length > 20) {
      newErrors.telefono = "El teléfono no puede exceder 20 caracteres"
    }

    if (formData.direccion.length > 500) {
      newErrors.direccion = "La dirección no puede exceder 500 caracteres"
    }

    if (formData.notas.length > 1000) {
      newErrors.notas = "Las notas no pueden exceder 1000 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Limpiar espacios en blanco y preparar datos
    const cleanedData = {
      nombre: formData.nombre.trim(),
      telefono: formData.telefono.trim() || null,
      email: formData.email.trim() || null,
      direccion: formData.direccion.trim() || null,
      cuit: formData.cuit.trim() || null,
      notas: formData.notas.trim() || null,
      tieneCuentaCorriente: formData.tiene_cuenta_corriente,
      limiteCredito:
        formData.tiene_cuenta_corriente && formData.tipo_limite === "con_limite"
          ? Number.parseFloat(formData.limite_credito)
          : null,
    }

    onSave(cleanedData)
  }

  const handleClose = () => {
    setFormData({
      nombre: "",
      telefono: "",
      email: "",
      direccion: "",
      cuit: "",
      notas: "",
      tiene_cuenta_corriente: false,
      tipo_limite: "sin_limite",
      limite_credito: "",
    })
    setErrors({})
    onClose()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
      <div className="bg-white shadow-xl w-full max-w-2xl h-[90vh]  flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{isEditing ? "Editar Cliente" : "Nuevo Cliente"}</h2>
              <p className="text-sm text-slate-300 mt-1">
                {isEditing ? "Modifica la información del cliente" : "Agrega un nuevo cliente al sistema"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 200px)" }}>
            <div className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Información Básica
                </h3>

                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-sm font-medium text-slate-900">
                    Nombre del Cliente <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    className={`bg-slate-50 ${errors.nombre ? "border-red-500 focus:border-red-500" : "border-slate-800"}`}
                    disabled={loading}
                    maxLength={100}
                  />
                  {errors.nombre && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.nombre}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-sm font-medium text-slate-900">
                      Teléfono
                    </Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      className={`bg-slate-50 ${errors.telefono ? "border-red-500 focus:border-red-500" : "border-slate-800"}`}
                      disabled={loading}
                      maxLength={20}
                    />
                    {errors.telefono && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{errors.telefono}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-900">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`bg-slate-50 ${errors.email ? "border-red-500 focus:border-red-500" : "border-slate-800"}`}
                      disabled={loading}
                    />
                    {errors.email && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{errors.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CUIT */}
                  <div className="space-y-2">
                    <Label htmlFor="cuit" className="text-sm font-medium text-slate-900">
                      CUIT
                    </Label>
                    <Input
                      id="cuit"
                      type="text"
                      value={formData.cuit}
                      onChange={(e) => handleInputChange("cuit", e.target.value)}
                      className={`bg-slate-50 ${errors.cuit ? "border-red-500 focus:border-red-500" : "border-slate-800"}`}
                      disabled={loading}
                      maxLength={15}
                    />
                    {errors.cuit && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{errors.cuit}</span>
                      </div>
                    )}
                  </div>

                  {/* Dirección */}
                  <div className="space-y-2">
                    <Label htmlFor="direccion" className="text-sm font-medium text-slate-900">
                      Dirección
                    </Label>
                    <Input
                      id="direccion"
                      type="text"
                      value={formData.direccion}
                      onChange={(e) => handleInputChange("direccion", e.target.value)}
                      className={`bg-slate-50 ${errors.direccion ? "border-red-500 focus:border-red-500" : "border-slate-800"}`}
                      disabled={loading}
                      maxLength={500}
                    />
                    {errors.direccion && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{errors.direccion}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notas */}
                <div className="space-y-2">
                  <Label htmlFor="notas" className="text-sm font-medium text-slate-900">
                    Notas
                  </Label>
                  <Textarea
                    id="notas"
                    value={formData.notas}
                    onChange={(e) => handleInputChange("notas", e.target.value)}
                    className={`h-20 resize-none bg-slate-50 ${errors.notas ? "border-red-500 focus:border-red-500" : "border-slate-800"}`}
                    disabled={loading}
                    maxLength={1000}
                  />
                  {errors.notas && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.notas}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cuenta Corriente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center">
                  Cuenta Corriente
                </h3>

                {/* Checkbox para habilitar cuenta corriente */}
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-800">
                  <Checkbox
                    id="tiene_cuenta_corriente"
                    checked={formData.tiene_cuenta_corriente}
                    onCheckedChange={(checked) => handleInputChange("tiene_cuenta_corriente", checked)}
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="tiene_cuenta_corriente"
                      className="text-sm font-medium text-slate-900 cursor-pointer"
                    >
                      Habilitar cuenta corriente
                    </Label>
                    <p className="text-xs text-slate-600 mt-1">Permite al cliente realizar compras a crédito</p>
                  </div>
                </div>

                {/* Configuración de límite (solo si tiene cuenta corriente) */}
                {formData.tiene_cuenta_corriente && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-900">Configuración de Límite de Crédito</Label>

                      <RadioGroup
                        value={formData.tipo_limite}
                        onValueChange={(value) => handleInputChange("tipo_limite", value)}
                        className="space-y-3"
                        disabled={loading}
                      >
                        {/* Sin límite */}
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
                          <RadioGroupItem value="sin_limite" id="sin_limite" />
                          <div className="flex-1">
                            <Label htmlFor="sin_limite" className="cursor-pointer flex items-center">
                              <Infinity className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="font-medium text-slate-900">Sin límite</span>
                            </Label>
                            <p className="text-xs text-slate-600 mt-1">
                              El cliente puede comprar sin restricción de monto
                            </p>
                          </div>
                          {formData.tipo_limite === "sin_limite" && (
                            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Recomendado</div>
                          )}
                        </div>

                        {/* Con límite */}
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
                          <RadioGroupItem value="con_limite" id="con_limite" />
                          <div className="flex-1">
                            <Label htmlFor="con_limite" className="cursor-pointer flex items-center">
                              <Calculator className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="font-medium text-slate-900">Con límite específico</span>
                            </Label>
                            <p className="text-xs text-slate-600 mt-1">
                              Establecer un monto máximo que el cliente puede deber
                            </p>
                          </div>
                        </div>
                      </RadioGroup>

                      {/* Campo de límite de crédito (solo si eligió con límite) */}
                      {formData.tipo_limite === "con_limite" && (
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="limite_credito" className="text-sm font-medium text-slate-900">
                            Monto del Límite <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="limite_credito"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.limite_credito}
                            onChange={(e) => handleInputChange("limite_credito", e.target.value)}
                            placeholder="0.00"
                            className={`bg-slate-50 ${errors.limite_credito ? "border-red-500 focus:border-red-500" : "border-slate-800"}`}
                            disabled={loading}
                          />
                          {errors.limite_credito && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">{errors.limite_credito}</span>
                            </div>
                          )}
                          {formData.limite_credito && Number.parseFloat(formData.limite_credito) > 0 && (
                            <p className="text-xs text-green-600">
                              Límite establecido: {formatCurrency(formData.limite_credito)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-end space-x-3 p-5 border-t border-slate-300 bg-slate-100 mt-10">
            <Button
              className="border-slate-800"
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-slate-800 hover:bg-slate-700" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? "Actualizar" : "Crear"} Cliente
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
