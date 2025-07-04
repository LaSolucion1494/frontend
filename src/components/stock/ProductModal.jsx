"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import {
  Package,
  Save,
  X,
  DollarSign,
  TrendingUp,
  Plus,
  Lock,
  RefreshCw,
  Barcode,
  Calculator,
  Receipt,
  AlertCircle,
  Building,
  PlusCircle,
  Settings,
  RotateCcw,
  Eye,
} from "lucide-react"
import { formatCurrency } from "../../lib/utils"
import { NumericFormat } from "react-number-format"
import { LoadingSpinner } from "../ui/loading"
import { useSuppliers } from "../../hooks/useSuppliers"
import { barcodeService } from "../../services/barcodeService"
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

  // Estado para configuración personalizada del producto
  const [customConfig, setCustomConfig] = useState({
    rentabilidad: 40,
    iva: 21,
    ingresos_brutos: 0,
    otros_impuestos: 0,
  })

  // Estado para controlar si se está usando configuración personalizada
  const [useCustomConfig, setUseCustomConfig] = useState(false)

  const [loading, setLoading] = useState(false)
  const [showBarcodePreview, setShowBarcodePreview] = useState(false)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [validatingCode, setValidatingCode] = useState(false)
  const [errors, setErrors] = useState({})

  // Configuración con valores por defecto para Argentina
  const defaultConfig = useRef({
    rentabilidad: 40,
    iva: 21,
    ingresos_brutos: 0,
    otros_impuestos: 0,
    ...config,
  })

  // Configuración activa (personalizada o por defecto)
  const activeConfig = useCustomConfig ? customConfig : defaultConfig.current

  useEffect(() => {
    if (isOpen) {
      // Inicializar configuración personalizada con valores por defecto
      setCustomConfig({ ...defaultConfig.current })
      setUseCustomConfig(false)

      if (product && isEditing) {
        setFormData({
          codigo: product.codigo || "",
          nombre: product.nombre || "",
          descripcion: product.descripcion === "Sin Descripción" ? "" : product.descripcion || "",
          categoria: product.categoria || "Sin Categoría",
          marca: product.marca === "Sin Marca" ? "" : product.marca || "",
          stock: product.stock > 0 ? product.stock.toString() : "",
          precioCosto: product.precio_costo || 0,
          proveedorId: product.proveedor_id ? product.proveedor_id.toString() : "1",
          tieneCodigoBarras: product.tieneCodigoBarras || false,
        })

        // Si el producto tiene configuración personalizada, cargarla
        if (product.custom_config) {
          setCustomConfig(product.custom_config)
          setUseCustomConfig(true)
        }
      } else {
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
      }
      setErrors({})
    }
  }, [product, isEditing, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.codigo.trim()) {
      newErrors.codigo = "El código es obligatorio"
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.precioCosto || formData.precioCosto <= 0) {
      newErrors.precioCosto = "El precio de costo debe ser mayor a 0"
    }

    if (!isEditing && (!formData.stock || Number(formData.stock) < 0)) {
      newErrors.stock = "El stock inicial debe ser mayor o igual a 0"
    }

    // Validar configuración personalizada si está activa
    if (useCustomConfig) {
      if (customConfig.rentabilidad < 0 || customConfig.rentabilidad > 1000) {
        newErrors.rentabilidad = "La rentabilidad debe estar entre 0% y 1000%"
      }
      if (customConfig.iva < 0 || customConfig.iva > 100) {
        newErrors.iva = "El IVA debe estar entre 0% y 100%"
      }
      if (customConfig.ingresos_brutos < 0 || customConfig.ingresos_brutos > 100) {
        newErrors.ingresos_brutos = "Los ingresos brutos deben estar entre 0% y 100%"
      }
      if (customConfig.otros_impuestos < 0 || customConfig.otros_impuestos > 100) {
        newErrors.otros_impuestos = "Los otros impuestos deben estar entre 0% y 100%"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateCodeUniqueness = async (code) => {
    if (!code || code.trim() === "") return true

    setValidatingCode(true)
    try {
      const isUnique = await barcodeService.validateUniqueCode(code.trim(), isEditing ? product.id : null)
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

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
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
        ...(isEditing ? {} : { stock: formData.stock === "" ? 0 : Number(formData.stock) }),
        proveedorId: Number(formData.proveedorId),
        descripcion: formData.descripcion.trim() || undefined,
        marca: formData.marca.trim() || null,
        categoria: formData.categoria === "Sin Categoría" ? undefined : formData.categoria,
        // Incluir configuración personalizada si está activa
        customConfig: useCustomConfig ? customConfig : null,
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

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleCustomConfigChange = (field, value) => {
    setCustomConfig((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleResetToDefault = () => {
    setCustomConfig({ ...defaultConfig.current })
    toast.success("Configuración restablecida a valores por defecto")
  }

  const handleStockChange = (e) => {
    const value = e.target.value
    if (value === "" || /^\d+$/.test(value)) {
      handleChange("stock", value)
    }
  }

  const handleStockFocus = (e) => {
    if (e.target.value === "0") {
      handleChange("stock", "")
    }
  }

  const handleCreateSupplier = () => {
    handleClose()
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
    setCustomConfig({ ...defaultConfig.current })
    setUseCustomConfig(false)
    setErrors({})
    setShowBarcodePreview(false)
    onClose()
  }

  // Cálculos de precios con configuración activa
  const calculatePriceBreakdown = () => {
    if (!formData.precioCosto || formData.precioCosto <= 0) {
      return {
        costo: 0,
        rentabilidad: 0,
        ingresosBrutos: 0,
        otrosImpuestos: 0,
        precioNeto: 0,
        iva: 0,
        precioFinal: 0,
      }
    }

    const costo = formData.precioCosto
    const rentabilidadMonto = costo * (activeConfig.rentabilidad / 100)
    const ingresosBrutosMonto = costo * (activeConfig.ingresos_brutos / 100)
    const otrosImpuestosMonto = costo * (activeConfig.otros_impuestos / 100)
    const precioNeto = costo + rentabilidadMonto + ingresosBrutosMonto + otrosImpuestosMonto
    const ivaMonto = precioNeto * (activeConfig.iva / 100)
    const precioFinal = precioNeto + ivaMonto

    return {
      costo: Math.round(costo * 100) / 100,
      rentabilidad: Math.round(rentabilidadMonto * 100) / 100,
      ingresosBrutos: Math.round(ingresosBrutosMonto * 100) / 100,
      otrosImpuestos: Math.round(otrosImpuestosMonto * 100) / 100,
      precioNeto: Math.round(precioNeto * 100) / 100,
      iva: Math.round(ivaMonto * 100) / 100,
      precioFinal: Math.round(precioFinal * 100) / 100,
    }
  }

  const priceBreakdown = calculatePriceBreakdown()

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
        <div className="bg-white shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden relative z-[101]">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
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
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 200px)" }}>
              <div className="space-y-6">
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Información Básica
                  </h3>

                  {/* Código y Código de Barras en la misma fila */}
                  <div className="space-y-2">
                    <Label htmlFor="codigo" className="text-sm font-medium text-slate-900">
                      Código del Producto <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex space-x-3">
                      {/* Input de código con botón generar */}
                      <div className="flex space-x-2 flex-1">
                        <div className="relative flex-1">
                          <Input
                            id="codigo"
                            value={formData.codigo}
                            onChange={(e) => handleChange("codigo", e.target.value)}
                            onBlur={handleCodeBlur}
                            placeholder="Ingresa un código"
                            className={`bg-slate-50 font-mono pr-8 ${
                              errors.codigo ? "border-red-500 focus:border-red-500" : "border-slate-800"
                            }`}
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
                          className="px-3 border-slate-800 bg-transparent"
                          disabled={loading || generatingCode || validatingCode}
                          title="Generar código único"
                        >
                          {generatingCode ? <LoadingSpinner size="sm" /> : <RefreshCw className="w-4 h-4" />}
                        </Button>
                      </div>

                      {/* Sección de código de barras integrada - TAMAÑO FIJO */}
                      <div className="flex items-center space-x-3 bg-slate-50 border border-slate-800 rounded-md px-4 py-2 h-10 min-w-[200px]">
                        <div className="flex items-center space-x-2">
                          <Barcode className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-700">Código de Barras</span>
                        </div>
                        <Switch
                          checked={formData.tieneCodigoBarras}
                          onCheckedChange={handleBarcodeToggle}
                          disabled={loading || generatingCode || validatingCode}
                        />
                        {formData.tieneCodigoBarras && formData.codigo && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowBarcodePreview(true)}
                            className="p-1 h-6 w-6 text-slate-600 hover:text-slate-800"
                            title="Ver código de barras"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {errors.codigo && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{errors.codigo}</span>
                      </div>
                    )}
                    {/* Mensaje de estado más compacto */}
                    {formData.tieneCodigoBarras && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Código de barras habilitado. 
                      </p>
                    )}
                  </div>

                  {/* Nombre del producto ahora va abajo */}
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-sm font-medium text-slate-900">
                      Nombre del Producto <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleChange("nombre", e.target.value)}
                      placeholder="Nombre del producto"
                      className={`bg-slate-50 ${
                        errors.nombre ? "border-red-500 focus:border-red-500" : "border-slate-800"
                      }`}
                      disabled={loading}
                    />
                    {errors.nombre && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{errors.nombre}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marca" className="text-sm font-medium text-slate-900">
                        Marca
                      </Label>
                      <Input
                        id="marca"
                        value={formData.marca}
                        onChange={(e) => handleChange("marca", e.target.value)}
                        placeholder="Marca del producto"
                        className="bg-slate-50 border-slate-800"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoria" className="text-sm font-medium text-slate-900">
                        Categoría
                      </Label>
                      <Select
                        value={formData.categoria}
                        onValueChange={(value) => handleChange("categoria", value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="bg-slate-50 border-slate-800">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent className="z-[200]" position="popper" sideOffset={4}>
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
                      <Label htmlFor="proveedor" className="text-sm font-medium text-slate-900">
                        Proveedor
                      </Label>
                      <div className="flex space-x-2">
                        <Select
                          value={formData.proveedorId}
                          onValueChange={(value) => handleChange("proveedorId", value)}
                          disabled={loading || suppliersLoading}
                        >
                          <SelectTrigger className="bg-slate-50 border-slate-800 flex-1">
                            <SelectValue placeholder="Seleccionar proveedor" />
                          </SelectTrigger>
                          <SelectContent className="z-[200]" position="popper" sideOffset={4}>
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
                          className="border-slate-800 text-slate-700 hover:bg-slate-50 shrink-0 bg-transparent"
                          title="Crear nuevo proveedor"
                          disabled={loading}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-sm font-medium text-slate-900">
                      Descripción
                    </Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => handleChange("descripcion", e.target.value)}
                      placeholder="Descripción detallada del producto"
                      rows={3}
                      className="bg-slate-50 border-slate-800"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Stock y Precios */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    {isEditing ? "Precios" : "Stock y Precios"}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!isEditing && (
                      <div className="space-y-2">
                        <Label htmlFor="stock" className="text-sm font-medium text-slate-900">
                          Stock Inicial <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="stock"
                          type="text"
                          value={formData.stock}
                          onChange={handleStockChange}
                          onFocus={handleStockFocus}
                          placeholder="Cantidad"
                          className={`bg-slate-50 ${
                            errors.stock ? "border-red-500 focus:border-red-500" : "border-slate-800"
                          }`}
                          disabled={loading}
                        />
                        {errors.stock && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{errors.stock}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {isEditing && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-900">Stock Actual</Label>
                        <div className="flex items-center space-x-2 px-3 py-2 bg-slate-100 border border-slate-300 rounded-md">
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700">{product?.stock || 0} unidades</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Para modificar el stock, usa el botón "Stock" en la tabla de productos
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="precioCosto" className="text-sm font-medium text-slate-900">
                        Precio de Costo <span className="text-red-500">*</span>
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
                        className={`flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-slate-50 ${
                          errors.precioCosto ? "border-red-500" : "border-slate-800"
                        }`}
                        disabled={loading}
                      />
                      {errors.precioCosto && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{errors.precioCosto}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Configuración de Precios Personalizada */}
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                        <Calculator className="w-4 h-4 mr-2" />
                        Configuración de Precios
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm text-slate-600">Personalizar para este producto:</Label>
                        <Switch
                          checked={useCustomConfig}
                          onCheckedChange={(checked) => {
                            setUseCustomConfig(checked)
                            if (checked) {
                              toast.success("Configuración personalizada activada")
                            } else {
                              toast.info("Usando configuración por defecto del sistema")
                            }
                          }}
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {useCustomConfig && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Settings className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Configuración Personalizada Activa
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResetToDefault}
                            className="text-blue-600 border-blue-300 hover:bg-blue-100 bg-transparent"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Restablecer
                          </Button>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          Los valores modificados se aplicarán solo a este producto
                        </p>
                      </div>
                    )}

                    {/* Inputs de configuración */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-700">Rentabilidad (%)</Label>
                        <NumericFormat
                          value={useCustomConfig ? customConfig.rentabilidad : defaultConfig.current.rentabilidad}
                          onValueChange={(values) => {
                            if (useCustomConfig) {
                              const { floatValue } = values
                              handleCustomConfigChange("rentabilidad", floatValue || 0)
                            }
                          }}
                          decimalScale={2}
                          fixedDecimalScale={false}
                          allowNegative={false}
                          suffix="%"
                          placeholder="40%"
                          className={`flex w-full rounded-md border px-3 py-2 text-sm bg-white ${
                            useCustomConfig ? "border-slate-300" : "border-slate-200 bg-slate-100"
                          } ${errors.rentabilidad ? "border-red-500" : ""}`}
                          disabled={loading || !useCustomConfig}
                        />
                        {errors.rentabilidad && <span className="text-xs text-red-600">{errors.rentabilidad}</span>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-700">IVA (%)</Label>
                        <NumericFormat
                          value={useCustomConfig ? customConfig.iva : defaultConfig.current.iva}
                          onValueChange={(values) => {
                            if (useCustomConfig) {
                              const { floatValue } = values
                              handleCustomConfigChange("iva", floatValue || 0)
                            }
                          }}
                          decimalScale={2}
                          fixedDecimalScale={false}
                          allowNegative={false}
                          suffix="%"
                          placeholder="21%"
                          className={`flex w-full rounded-md border px-3 py-2 text-sm bg-white ${
                            useCustomConfig ? "border-slate-300" : "border-slate-200 bg-slate-100"
                          } ${errors.iva ? "border-red-500" : ""}`}
                          disabled={loading || !useCustomConfig}
                        />
                        {errors.iva && <span className="text-xs text-red-600">{errors.iva}</span>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-700">Ingresos Brutos (%)</Label>
                        <NumericFormat
                          value={useCustomConfig ? customConfig.ingresos_brutos : defaultConfig.current.ingresos_brutos}
                          onValueChange={(values) => {
                            if (useCustomConfig) {
                              const { floatValue } = values
                              handleCustomConfigChange("ingresos_brutos", floatValue || 0)
                            }
                          }}
                          decimalScale={2}
                          fixedDecimalScale={false}
                          allowNegative={false}
                          suffix="%"
                          placeholder="0%"
                          className={`flex w-full rounded-md border px-3 py-2 text-sm bg-white ${
                            useCustomConfig ? "border-slate-300" : "border-slate-200 bg-slate-100"
                          } ${errors.ingresos_brutos ? "border-red-500" : ""}`}
                          disabled={loading || !useCustomConfig}
                        />
                        {errors.ingresos_brutos && (
                          <span className="text-xs text-red-600">{errors.ingresos_brutos}</span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-700">Otros Impuestos (%)</Label>
                        <NumericFormat
                          value={useCustomConfig ? customConfig.otros_impuestos : defaultConfig.current.otros_impuestos}
                          onValueChange={(values) => {
                            if (useCustomConfig) {
                              const { floatValue } = values
                              handleCustomConfigChange("otros_impuestos", floatValue || 0)
                            }
                          }}
                          decimalScale={2}
                          fixedDecimalScale={false}
                          allowNegative={false}
                          suffix="%"
                          placeholder="0%"
                          className={`flex w-full rounded-md border px-3 py-2 text-sm bg-white ${
                            useCustomConfig ? "border-slate-300" : "border-slate-200 bg-slate-100"
                          } ${errors.otros_impuestos ? "border-red-500" : ""}`}
                          disabled={loading || !useCustomConfig}
                        />
                        {errors.otros_impuestos && (
                          <span className="text-xs text-red-600">{errors.otros_impuestos}</span>
                        )}
                      </div>
                    </div>

                    {/* Mostrar cálculo de precios */}
                    {formData.precioCosto <= 0 ? (
                      <div className="text-center py-4">
                        <div className="text-slate-500 mb-2">
                          <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm">Ingrese un precio de costo para ver el cálculo automático</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Si el precio de costo es 0, el precio de venta también será 0
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Flujo horizontal del cálculo */}
                        <div className="overflow-x-auto pb-4">
                          <div className="flex items-center space-x-3 min-w-max px-2">
                            {/* Paso 1: Precio de Costo */}
                            <div className="flex-shrink-0 w-48">
                              <div className="bg-white rounded-lg p-4 border border-slate-800 shadow-sm h-32 flex flex-col justify-between">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                    1
                                  </div>
                                  <div className="text-xs font-medium text-slate-700">Precio de Costo</div>
                                </div>
                                <div className="text-center flex-1 flex flex-col justify-center">
                                  <div className="text-lg font-bold text-slate-800">
                                    {formatCurrency(priceBreakdown.costo)}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">Base de cálculo</div>
                                </div>
                              </div>
                            </div>

                            {/* Flecha */}
                            <div className="flex-shrink-0 text-slate-800">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>

                            {/* Paso 2: Ganancia Bruta */}
                            <div className="flex-shrink-0 w-48">
                              <div className="bg-white rounded-lg p-4 border border-slate-800 shadow-sm h-32 flex flex-col justify-between">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                    2
                                  </div>
                                  <div className="text-xs font-medium text-slate-700 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1 text-blue-600" />
                                    Ganancia ({activeConfig.rentabilidad}%)
                                  </div>
                                </div>
                                <div className="text-center flex-1 flex flex-col justify-center">
                                  <div className="text-lg font-bold text-blue-600">
                                    + {formatCurrency(priceBreakdown.rentabilidad)}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    = {formatCurrency(priceBreakdown.costo + priceBreakdown.rentabilidad)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Flecha */}
                            <div className="flex-shrink-0 text-slate-800">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>

                            {/* Paso 3: Ingresos Brutos (condicional) */}
                            {priceBreakdown.ingresosBrutos > 0 ? (
                              <>
                                <div className="flex-shrink-0 w-48">
                                  <div className="bg-white rounded-lg p-4 border border-slate-800 shadow-sm h-32 flex flex-col justify-between">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                        3
                                      </div>
                                      <div className="text-xs font-medium text-slate-700 flex items-center">
                                        <Building className="w-3 h-3 mr-1 text-blue-500" />
                                        Ing. Brutos ({activeConfig.ingresos_brutos}%)
                                      </div>
                                    </div>
                                    <div className="text-center flex-1 flex flex-col justify-center">
                                      <div className="text-lg font-bold text-blue-500">
                                        + {formatCurrency(priceBreakdown.ingresosBrutos)}
                                      </div>
                                      <div className="text-xs text-slate-500 mt-1">
                                        ={" "}
                                        {formatCurrency(
                                          priceBreakdown.costo +
                                            priceBreakdown.rentabilidad +
                                            priceBreakdown.ingresosBrutos,
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-shrink-0 text-slate-800">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </div>
                              </>
                            ) : null}

                            {/* Paso 4: Otros Impuestos (condicional) */}
                            {priceBreakdown.otrosImpuestos > 0 ? (
                              <>
                                <div className="flex-shrink-0 w-48">
                                  <div className="bg-white rounded-lg p-4 border border-slate-800 shadow-sm h-32 flex flex-col justify-between">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                        {priceBreakdown.ingresosBrutos > 0 ? "4" : "3"}
                                      </div>
                                      <div className="text-xs font-medium text-slate-700 flex items-center">
                                        <PlusCircle className="w-3 h-3 mr-1 text-indigo-600" />
                                        Otros Imp. ({activeConfig.otros_impuestos}%)
                                      </div>
                                    </div>
                                    <div className="text-center flex-1 flex flex-col justify-center">
                                      <div className="text-lg font-bold text-indigo-600">
                                        + {formatCurrency(priceBreakdown.otrosImpuestos)}
                                      </div>
                                      <div className="text-xs text-slate-500 mt-1">
                                        ={" "}
                                        {formatCurrency(
                                          priceBreakdown.costo +
                                            priceBreakdown.rentabilidad +
                                            priceBreakdown.ingresosBrutos +
                                            priceBreakdown.otrosImpuestos,
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-shrink-0 text-slate-800">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </div>
                              </>
                            ) : null}

                            {/* Paso 5: Precio Neto */}
                            <div className="flex-shrink-0 w-48">
                              <div className="bg-white rounded-lg p-4 border border-slate-800 shadow-md h-32 flex flex-col justify-between">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                    =
                                  </div>
                                  <div className="text-xs font-medium text-slate-700 flex items-center">
                                    <Receipt className="w-3 h-3 mr-1 text-slate-600" />
                                    Precio Neto
                                  </div>
                                </div>
                                <div className="text-center flex-1 flex flex-col justify-center">
                                  <div className="text-lg font-bold text-slate-700">
                                    {formatCurrency(priceBreakdown.precioNeto)}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">Sin IVA</div>
                                </div>
                              </div>
                            </div>

                            {/* Flecha */}
                            <div className="flex-shrink-0 text-slate-800">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>

                            {/* Paso 6: IVA */}
                            <div className="flex-shrink-0 w-48">
                              <div className="bg-white rounded-lg p-4 border border-slate-800 shadow-sm h-32 flex flex-col justify-between">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                    +
                                  </div>
                                  <div className="text-xs font-medium text-slate-700 flex items-center">
                                    <Receipt className="w-3 h-3 mr-1 text-orange-600" />
                                    IVA ({activeConfig.iva}%)
                                  </div>
                                </div>
                                <div className="text-center flex-1 flex flex-col justify-center">
                                  <div className="text-lg font-bold text-orange-600">
                                    + {formatCurrency(priceBreakdown.iva)}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">Sobre precio neto</div>
                                </div>
                              </div>
                            </div>

                            {/* Flecha final */}
                            <div className="flex-shrink-0 text-green-500">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>

                            {/* Paso 7: Precio Final */}
                            <div className="flex-shrink-0 w-56">
                              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-300 shadow-lg h-32 flex flex-col justify-between">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                    ✓
                                  </div>
                                  <div className="text-xs font-medium text-green-800">Precio Final</div>
                                </div>
                                <div className="text-center flex-1 flex flex-col justify-center">
                                  <div className="text-xl font-bold text-green-700">
                                    {formatCurrency(priceBreakdown.precioFinal)}
                                  </div>
                                  <div className="text-xs text-green-600 mt-1">Precio al público</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Indicador de configuración activa */}
                        <div className="text-center">
                          <p className="text-xs text-slate-400">
                            {useCustomConfig ? (
                              <span className="text-blue-600 font-medium">
                                ⚙️ Usando configuración personalizada para este producto
                              </span>
                            ) : (
                              "💡 Usando configuración por defecto del sistema"
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex justify-end space-x-3 p-5 border-t border-slate-300 bg-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="border-slate-800 bg-transparent"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-slate-800 hover:bg-slate-700"
                disabled={loading || generatingCode || validatingCode}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
