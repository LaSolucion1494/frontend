"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { X, Save, AlertCircle } from "lucide-react"

const ConfigModal = ({ isOpen, onClose, onSave, configs = [], category, loading = false }) => {
  const [formData, setFormData] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen && configs.length > 0) {
      setFormData(configs.map((config) => ({ ...config })))
      setErrors({})
    }
  }, [isOpen, configs])

  const handleInputChange = (index, field, value) => {
    const updatedData = [...formData]
    updatedData[index] = { ...updatedData[index], [field]: value }
    setFormData(updatedData)

    // Limpiar error si existe
    if (errors[updatedData[index].key]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[updatedData[index].key]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    formData.forEach((config) => {
      // Validar campos requeridos
      if (!config.value && config.value !== 0) {
        newErrors[config.key] = "Este campo es obligatorio"
        return
      }

      // Validar tipos específicos
      if (config.type === "numero") {
        const numValue = Number(config.value)
        if (isNaN(numValue)) {
          newErrors[config.key] = "Debe ser un número válido"
        } else if (numValue < 0) {
          newErrors[config.key] = "No puede ser un número negativo"
        } else if (
          config.key.includes("rentabilidad") ||
          config.key.includes("iva") ||
          config.key.includes("ingresos")
        ) {
          if (numValue > 100) {
            newErrors[config.key] = "El porcentaje no puede ser mayor a 100%"
          }
        }
      }

      // Validar longitud para campos de texto
      if (config.type === "texto" && config.value.length > 200) {
        newErrors[config.key] = "Máximo 200 caracteres"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSave(formData)
  }

  const handleClose = () => {
    setFormData([])
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-800">
          <div className="flex items-center space-x-3">
            {category?.icon && (
              <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center`}>
                <category.icon className="w-4 h-4 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-white">Editar {category?.title || "Configuración"}</h2>
              <p className="text-sm text-slate-300 mt-1">
                {category?.description || "Modifica los valores de configuración"}
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
              {formData.map((config, index) => (
                <div key={config.key} className="space-y-2">
                  <Label htmlFor={config.key} className="text-sm font-medium text-slate-900">
                    {config.label}
                    {config.type === "numero" &&
                      (config.key.includes("rentabilidad") ||
                        config.key.includes("iva") ||
                        config.key.includes("ingresos")) && <span className="text-slate-500 ml-1">(%)</span>}
                  </Label>

                  {config.key === "empresa_direccion" ? (
                    <Textarea
                      id={config.key}
                      value={config.value}
                      onChange={(e) => handleInputChange(index, "value", e.target.value)}
                      placeholder={config.description}
                      className={`h-20 resize-none ${errors[config.key] ? "border-red-500 focus:border-red-500" : ""}`}
                      disabled={loading}
                    />
                  ) : (
                    <Input
                      id={config.key}
                      type={config.type === "numero" ? "number" : "text"}
                      value={config.value}
                      onChange={(e) => handleInputChange(index, "value", e.target.value)}
                      placeholder={config.description}
                      className={errors[config.key] ? "border-red-500 focus:border-red-500" : ""}
                      disabled={loading}
                      min={config.type === "numero" ? "0" : undefined}
                      max={
                        config.type === "numero" &&
                        (config.key.includes("rentabilidad") ||
                          config.key.includes("iva") ||
                          config.key.includes("ingresos"))
                          ? "100"
                          : undefined
                      }
                      step={config.type === "numero" ? "0.01" : undefined}
                    />
                  )}

                  {errors[config.key] && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors[config.key]}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-600">{config.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
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
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ConfigModal
