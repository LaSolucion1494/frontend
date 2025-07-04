"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { X, Save, AlertCircle, Tag } from "lucide-react"

const CategoryModal = ({ isOpen, onClose, onSave, category = null, isEditing = false, loading = false }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      if (isEditing && category) {
        setFormData({
          nombre: category.nombre || "",
          descripcion: category.descripcion || "",
        })
      } else {
        setFormData({
          nombre: "",
          descripcion: "",
        })
      }
      setErrors({})
    }
  }, [isOpen, isEditing, category])

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
    } else if (formData.nombre.length > 50) {
      newErrors.nombre = "El nombre no puede exceder 50 caracteres"
    }

    // Validar descripción (opcional)
    if (formData.descripcion.length > 200) {
      newErrors.descripcion = "La descripción no puede exceder 200 caracteres"
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
    const cleanedData = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
    }

    onSave(cleanedData)
  }

  const handleClose = () => {
    setFormData({
      nombre: "",
      descripcion: "",
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{isEditing ? "Editar Categoría" : "Nueva Categoría"}</h2>
              <p className="text-sm text-slate-300 mt-1">
                {isEditing ? "Modifica la información de la categoría" : "Agrega una nueva categoría al sistema"}
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
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium text-slate-900">
                  Nombre de la Categoría <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Ej: Repuestos de Motor"
                  className={`bg-slate-100 ${errors.nombre ? "border-red-500 focus:border-red-500" : "border-slate-800"}`}
                  disabled={loading}
                  maxLength={50}
                />
                {errors.nombre && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.nombre}</span>
                  </div>
                )}
                <p className="text-xs text-slate-600">Máximo 50 caracteres</p>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-sm font-medium text-slate-900">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  placeholder="Describe brevemente esta categoría (opcional)"
                  className={`h-24 resize-none bg-slate-100 ${errors.descripcion ? "border-red-500 focus:border-red-500" : "border-slate-800"}`}
                  disabled={loading}
                  maxLength={200}
                />
                {errors.descripcion && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.descripcion}</span>
                  </div>
                )}
                <p className="text-xs text-slate-600">Máximo 200 caracteres (opcional)</p>
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
                  {isEditing ? "Actualizar" : "Crear"} Categoría
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryModal
