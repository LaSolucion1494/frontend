"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import { Package, Save, X, DollarSign, TrendingUp, Percent, Plus, Lock, RefreshCw, Barcode } from 'lucide-react'
import { formatCurrency } from "../../lib/utils"
import { NumericFormat } from "react-number-format"
import { LoadingSpinner } from "../ui/loading"
import { useSuppliers } from "../../hooks/useSuppliers"
import { barcodeService } from "../../services/barcodeService"
import BarcodeDisplay from "../barcode/BarcodeDisplay"
import BarcodeModal from "../barcode/BarcodeModal"
import toast from "react-hot-toast"

const ProductModal = ({ isOpen, onClose, onSave, product, isEditing, categories = [], config = {} }) => {
  const navigate = useNavigate()
  const { suppliers, loading: suppliersLoading } = useSuppliers()

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria: "Sin Categoría",
    marca: "",
    stock: "",
    precioCosto: 0,
    proveedorId: "1",
    tieneCodigoBarras: false,
  })
  const [loading, setLoading] = useState(false)
  const [showBarcodePreview, setShowBarcodePreview] = useState(false)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [validatingCode, setValidatingCode] = useState(false)

  // Configuración con valores por defecto
  const defaultConfig = {
    rentabilidad: 40,
    iva: 21,
    ...config,
  }

  useEffect(() => {
    if (product && isEditing) {
      setFormData({
        codigo: product.codigo || "",
        nombre: product.nombre || "",
        descripcion: product.descripcion === "Sin Descripción" ? "" : product.descripcion || "",
        categoria: product.categoria || "Sin Categoría",
        marca: product.marca === "Sin Marca" ? "" : product.marca || "",
        stock: product.stock > 0 ? product.stock.toString() : "",
        precioCosto: product.precioCosto || 0,
        proveedorId: product.proveedor_id ? product.proveedor_id.toString() : "1",
        tieneCodigoBarras: product.tieneCodigoBarras || false,
      })
    } else {
      // Para productos nuevos, NO generar código automáticamente
      setFormData({
        codigo: "", // Vacío por defecto
        nombre: "",
        descripcion: "",
        categoria: "Sin Categoría",
        marca: "",
        stock: "",
        precioCosto: 0,
        proveedorId: "1",
        tieneCodigoBarras: false,
      })
    }
  }, [product, isEditing, isOpen])

  const validateCodeUniqueness = async (code) => {
    if (!code || code.trim() === "") return true
    
    setValidatingCode(true)
    try {
      const isUnique = await barcodeService.validateUniqueCode(
        code.trim(), 
        isEditing ? product.id : null
      )
      return isUnique
    } catch (error) {
      console.error("Error validating code:", error)
      toast.error("Error al validar el código")
      return false
    } finally {
      setValidatingCode(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar que el código no esté duplicado solo si hay código
      if (formData.codigo && formData.codigo.trim()) {
        const isUnique = await validateCodeUniqueness(formData.codigo)
        
        if (!isUnique) {
          toast.error("El código ya existe. Por favor, usa otro código.")
          setLoading(false)
          return
        }
      }

      const dataToSave = {
        ...formData,
        // Solo incluir stock si no estamos editando
        ...(isEditing ? {} : { stock: formData.stock === "" ? 0 : Number(formData.stock) }),
        proveedorId: Number(formData.proveedorId),
        // Limpiar campos vacíos para usar valores por defecto
        descripcion: formData.descripcion.trim() || undefined,
        marca: formData.marca.trim() || null,
        categoria: formData.categoria === "Sin Categoría" ? undefined : formData.categoria,
      }
      await onSave(dataToSave)
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("Error al guardar el producto")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleStockChange = (e) => {
    const value = e.target.value
    if (value === "" || /^\d+$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        stock: value,
      }))
    }
  }

  const handleStockFocus = (e) => {
    if (e.target.value === "0") {
      setFormData((prev) => ({
        ...prev,
        stock: "",
      }))
    }
  }

  const handleCreateSupplier = () => {
    // Cerrar el modal actual
    handleClose()
    // Navegar a proveedores con parámetro para abrir modal
    navigate("/proveedores?action=create")
  }

  const handleGenerateCode = async () => {
    setGeneratingCode(true)
    try {
      const newCode = await barcodeService.generateUniqueProductCode(isEditing ? product.id : null)
      handleChange("codigo", newCode)
      toast.success("Código único generado")
    } catch (error) {
      console.error("Error generating code:", error)
      toast.error("Error al generar código único")
    } finally {
      setGeneratingCode(false)
    }
  }

  const handleBarcodeToggle = async (checked) => {
    if (checked) {
      // Si se activa el toggle y no hay código, generar uno automáticamente
      if (!formData.codigo.trim()) {
        setGeneratingCode(true)
        try {
          const newCode = await barcodeService.generateUniqueProductCode(isEditing ? product.id : null)
          handleChange("codigo", newCode)
          handleChange("tieneCodigoBarras", true)
          toast.success("Código de barras habilitado y código generado")
        } catch (error) {
          console.error("Error generating code:", error)
          toast.error("Error al generar código")
          return
        } finally {
          setGeneratingCode(false)
        }
      } else {
        // Si ya hay código, validar que sea único antes de activar
        const isUnique = await validateCodeUniqueness(formData.codigo)
        if (isUnique) {
          handleChange("tieneCodigoBarras", true)
          toast.success("Código de barras habilitado")
        } else {
          toast.error("El código ya existe. Cambia el código antes de habilitar el código de barras.")
          return
        }
      }
    } else {
      // Si se desactiva, solo cambiar el toggle
      handleChange("tieneCodigoBarras", false)
      toast.info("Código de barras deshabilitado")
    }
  }

  const handleCodeBlur = async () => {
    if (formData.codigo && formData.codigo.trim()) {
      const isUnique = await validateCodeUniqueness(formData.codigo)
      if (!isUnique) {
        toast.error("Este código ya existe")
      }
    }
  }

  const handleClose = () => {
    setFormData({
      codigo: "",
      nombre: "",
      descripcion: "",
      categoria: "Sin Categoría",
      marca: "",
      stock: "",
      precioCosto: 0,
      proveedorId: "1",
      tieneCodigoBarras: false,
    })
    setShowBarcodePreview(false)
    onClose()
  }

  // Cálculos de precios
  const precioBruto = formData.precioCosto * (1 + defaultConfig.rentabilidad / 100)
  const precioVenta = precioBruto * (1 + defaultConfig.iva / 100)
  const ganancia = precioBruto - formData.precioCosto

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 bg-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{isEditing ? "Editar Producto" : "Nuevo Producto"}</h2>
                <p className="text-sm text-slate-300 mt-1">
                  {isEditing ? "Modifica la información del producto" : "Agrega un nuevo producto al inventario"}
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
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 200px)" }}>
              <div className="space-y-8">
                {/* Información Básica */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">
                    Información Básica
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="codigo" className="text-sm font-medium text-slate-700">
                        Código *
                      </Label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <Input
                            id="codigo"
                            value={formData.codigo}
                            onChange={(e) => handleChange("codigo", e.target.value)}
                            onBlur={handleCodeBlur}
                            placeholder="Ingresa un código"
                            className="h-11 bg-slate-50 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20 font-mono pr-8"
                            required
                            disabled={loading || generatingCode}
                          />
                          {validatingCode && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <LoadingSpinner size="sm" />
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGenerateCode}
                          className="h-11 px-3"
                          disabled={loading || generatingCode || validatingCode}
                          title="Generar código único"
                        >
                          {generatingCode ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-sm font-medium text-slate-700">
                        Nombre del Producto *
                      </Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => handleChange("nombre", e.target.value)}
                        placeholder="Nombre del producto"
                        className="h-11 bg-slate-50 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Toggle para código de barras */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-slate-700 flex items-center">
                          <Barcode className="w-4 h-4 mr-2" />
                          Generar Código de Barras
                        </Label>
                        <p className="text-xs text-slate-500">
                          Habilita esta opción para generar un código de barras. Si no hay código, se generará automáticamente.
                        </p>
                      </div>
                      <Switch
                        checked={formData.tieneCodigoBarras}
                        onCheckedChange={handleBarcodeToggle}
                        disabled={loading || generatingCode || validatingCode}
                      />
                    </div>

                    {/* Vista previa pequeña del código de barras */}
                    {formData.tieneCodigoBarras && formData.codigo && (
                      <div className="mt-4">
                        <Label className="text-xs text-slate-600 mb-2 block">Vista Previa (clic para ampliar):</Label>
                        <div
                          className="bg-white border border-slate-200 rounded p-2 cursor-pointer hover:border-slate-300 transition-colors max-w-[200px] hover:shadow-sm"
                          onClick={() => setShowBarcodePreview(true)}
                          title="Clic para ver en tamaño completo"
                        >
                          <BarcodeDisplay
                            code={formData.codigo}
                            productName=""
                            showControls={false}
                            size="small"
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="marca" className="text-sm font-medium text-slate-700">
                        Marca
                      </Label>
                      <Input
                        id="marca"
                        value={formData.marca}
                        onChange={(e) => handleChange("marca", e.target.value)}
                        placeholder="Marca del producto"
                        className="h-11 bg-slate-50 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoria" className="text-sm font-medium text-slate-700">
                        Categoría
                      </Label>
                      <Select
                        value={formData.categoria}
                        onValueChange={(value) => handleChange("categoria", value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="h-11 bg-slate-50 border-slate-300 focus:border-slate-500">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id || category.nombre} value={category.nombre}>
                              {category.id === 1 ? (
                                <span className="text-slate-500 italic">{category.nombre}</span>
                              ) : (
                                category.nombre
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proveedor" className="text-sm font-medium text-slate-700">
                        Proveedor
                      </Label>
                      <div className="flex space-x-2">
                        <Select
                          value={formData.proveedorId}
                          onValueChange={(value) => handleChange("proveedorId", value)}
                          disabled={loading || suppliersLoading}
                        >
                          <SelectTrigger className="h-11 bg-slate-50 border-slate-300 focus:border-slate-500 flex-1">
                            <SelectValue placeholder="Seleccionar proveedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                {supplier.id === 1 ? (
                                  <span className="text-slate-500 italic">{supplier.nombre}</span>
                                ) : (
                                  <>
                                    {supplier.nombre}
                                    {supplier.cuit && ` (${supplier.cuit})`}
                                  </>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleCreateSupplier}
                          className="h-11 w-11 border-slate-300 text-slate-700 hover:bg-slate-50 shrink-0"
                          title="Crear nuevo proveedor"
                          disabled={loading}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-sm font-medium text-slate-700">
                      Descripción
                    </Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => handleChange("descripcion", e.target.value)}
                      placeholder="Descripción detallada del producto"
                      rows={3}
                      className="bg-slate-50 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Stock y Precios */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">
                    {isEditing ? "Precios" : "Stock y Precios"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Solo mostrar stock si no estamos editando */}
                    {!isEditing && (
                      <div className="space-y-2">
                        <Label htmlFor="stock" className="text-sm font-medium text-slate-700">
                          Stock Inicial *
                        </Label>
                        <Input
                          id="stock"
                          type="text"
                          value={formData.stock}
                          onChange={handleStockChange}
                          onFocus={handleStockFocus}
                          placeholder="Cantidad"
                          className="h-11 bg-slate-50 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20"
                          required
                          disabled={loading}
                        />
                      </div>
                    )}

                    {/* Mostrar stock actual si estamos editando */}
                    {isEditing && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Stock Actual</Label>
                        <div className="flex items-center space-x-2 h-11 px-3 py-2 bg-slate-100 border border-slate-300 rounded-md">
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700">{product?.stock || 0} unidades</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Para modificar el stock, usa el botón "Stock" en la tabla de productos
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="precioCosto" className="text-sm font-medium text-slate-700">
                        Precio de Costo *
                      </Label>
                      <NumericFormat
                        id="precioCosto"
                        value={formData.precioCosto || ""}
                        onValueChange={(values) => {
                          const { floatValue } = values
                          handleChange("precioCosto", floatValue || 0)
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="$ "
                        decimalScale={2}
                        fixedDecimalScale={false}
                        allowNegative={false}
                        placeholder="$ 0"
                        className="flex h-11 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {formData.precioCosto > 0 && (
                    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                      <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Cálculo de Precios
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                          <div className="text-xs text-slate-500 mb-1">Precio de Venta</div>
                          <div className="text-lg font-bold text-green-600">{formatCurrency(precioVenta)}</div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                          <div className="text-xs text-slate-500 mb-1 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Ganancia
                          </div>
                          <div className="text-lg font-bold text-blue-600">{formatCurrency(ganancia)}</div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                          <div className="text-xs text-slate-500 mb-1 flex items-center">
                            <Percent className="w-3 h-3 mr-1" />
                            Rentabilidad
                          </div>
                          <div className="text-lg font-bold text-purple-600">{defaultConfig.rentabilidad}%</div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                          <div className="text-xs text-slate-500 mb-1">IVA Aplicado</div>
                          <div className="text-lg font-bold text-orange-600">{defaultConfig.iva}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-slate-800 hover:bg-slate-700" 
                disabled={loading || generatingCode || validatingCode}
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    {isEditing ? "Actualizando..." : "Guardando..."}
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? "Actualizar" : "Guardar"} Producto
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de vista previa del código de barras */}
      {showBarcodePreview && formData.tieneCodigoBarras && (
        <BarcodeModal
          isOpen={showBarcodePreview}
          onClose={() => setShowBarcodePreview(false)}
          product={{ codigo: formData.codigo, nombre: formData.nombre }}
        />
      )}
    </>
  )
}

export default ProductModal
