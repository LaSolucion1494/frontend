"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { X, Save, AlertCircle, Truck } from "lucide-react"

const SupplierModal = ({ isOpen, onClose, onSave, supplier = null, isEditing = false, loading = false }) => {
  const [formData, setFormData] = useState({
    cuit: "",
    nombre: "",
    telefono: "",
    direccion: "",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      if (isEditing && supplier) {
        setFormData({
          cuit: supplier.cuit || "",
          nombre: supplier.nombre || "",
          telefono: supplier.telefono || "",
          direccion: supplier.direccion || "",
        })
      } else {
        setFormData({
          cuit: "",
          nombre: "",
          telefono: "",
          direccion: "",
        })
      }
      setErrors({})
    }
  }, [isOpen, isEditing, supplier])

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
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar nombre (obligatorio)
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = "El nombre no puede exceder 100 caracteres"
    }

    // Validar longitud de campos
    if (formData.cuit.length > 15) {
      newErrors.cuit = "El CUIT no puede exceder 15 caracteres"
    }

    if (formData.telefono.length > 20) {
      newErrors.telefono = "El teléfono no puede exceder 20 caracteres"
    }

    if (formData.direccion.length > 500) {
      newErrors.direccion = "La dirección no puede exceder 500 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Limpiar espacios en blanco
    const cleanedData = Object.keys(formData).reduce((acc, key) => {
      acc[key] = formData[key].trim()
      return acc
    }, {})

    onSave(cleanedData)
  }

  const handleClose = () => {
    setFormData({
      cuit: "",
      nombre: "",
      telefono: "",
      direccion: "",
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className=" bg-white shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800 ">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>
              <p className="text-sm text-slate-300 mt-1">
                {isEditing ? "Modifica la información del proveedor" : "Agrega un nuevo proveedor al sistema"}
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
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
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

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium text-slate-900">
                  Nombre del Proveedor <span className="text-red-500">*</span>
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

              {/* Dirección */}
              <div className="space-y-2">
                <Label htmlFor="direccion" className="text-sm font-medium text-slate-900">
                  Dirección
                </Label>
                <Textarea
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange("direccion", e.target.value)}
                  className={`h-20 resize-none bg-slate-50 ${errors.direccion ? "border-red-500 focus:border-red-500" : "border-slate-800"}`}
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
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-slate-300 bg-slate-100">
            <Button className="border-slate-800" type="button" variant="outline" onClick={handleClose} disabled={loading}>
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
                  {isEditing ? "Actualizar" : "Crear"} Proveedor
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SupplierModal
