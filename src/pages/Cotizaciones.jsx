"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Separator } from "../components/ui/separator"
import { Badge } from "../components/ui/badge"
import { NumericFormat } from "react-number-format"
import {
  RefreshCw,
  Check,
  Package,
  User,
  Plus,
  TrendingUp,
  TrendingDown,
  Calculator,
  Phone,
  Mail,
  Building2,
  Search,
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
} from "lucide-react"
import ClientSelectionModal from "../components/sales/ClientSelectionModal"
import ProductSelectionModal from "../components/sales/ProductSelectionModal"
import CotizacionPrintModal from "../components/cotizaciones/CotizacionPrintModal"
import ProductCard from "../components/sales/ProductCard"
import { useProducts } from "../hooks/useProducts"
import { useClients } from "../hooks/useClients"
import { useCotizaciones } from "../hooks/useCotizaciones"
import { useConfig } from "../hooks/useConfig"
import toast from "react-hot-toast"

const Cotizaciones = () => {
  const [cartProducts, setCartProducts] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [formData, setFormData] = useState({
    subtotal: 0,
    interestDiscount: 0,
    interestDiscountType: "amount",
    isInterest: false,
    total: 0,
    notes: "",
    condicionesComerciales: "",
    tiempoEntrega: "",
    validezDias: 30,
  })

  const [showClientModal, setShowClientModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCotizacionModal, setShowCotizacionModal] = useState(false)
  const [completedCotizacion, setCompletedCotizacion] = useState(null)

  const { loading: loadingProducts } = useProducts()
  const { clients, loading: loadingClients, fetchClients } = useClients()
  const {
    loading: loadingCotizacion,
    createCotizacion,
    prepareCotizacionDataFromForm,
    getCotizacionById,
  } = useCotizaciones()
  const { config, loading: loadingConfig } = useConfig()

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [cartProducts, formData.interestDiscount, formData.interestDiscountType, formData.isInterest])

  const calculateTotals = () => {
    const subtotal = cartProducts.reduce((sum, product) => sum + product.quantity * product.precio_venta, 0)

    let adjustment = 0
    const value = Number.parseFloat(formData.interestDiscount) || 0

    if (formData.interestDiscountType === "percentage") {
      adjustment = (subtotal * value) / 100
    } else {
      adjustment = value
    }

    if (!formData.isInterest) {
      adjustment = -adjustment
    }

    const total = Math.max(0, subtotal + adjustment)
    setFormData((prev) => ({ ...prev, subtotal, total }))
  }

  const addProductToCart = (product, quantity = 1) => {
    const existingProduct = cartProducts.find((p) => p.id === product.id)
    if (existingProduct) {
      updateProductQuantity(product.id, existingProduct.quantity + quantity)
    } else {
      const productWithDefaults = {
        ...product,
        quantity: quantity,
        discount_active: false,
        discount_percentage: 0,
      }
      setCartProducts((prev) => [...prev, productWithDefaults])
    }
    toast.success(`${product.nombre} agregado al carrito (${quantity} unidades)`)
  }

  const updateProductQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeProductFromCart(productId)
      return
    }
    setCartProducts((prev) =>
      prev.map((product) => (product.id === productId ? { ...product, quantity: newQuantity } : product)),
    )
  }

  const updateProductPrice = (productId, newPriceData) => {
    setCartProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            ...newPriceData,
            discount_active:
              newPriceData.discount_active !== undefined
                ? newPriceData.discount_active
                : product.discount_active || false,
            discount_percentage:
              newPriceData.discount_percentage !== undefined
                ? newPriceData.discount_percentage
                : product.discount_percentage || 0,
          }
        }
        return product
      }),
    )
  }

  const removeProductFromCart = (productId) => {
    setCartProducts((prev) => prev.filter((product) => product.id !== productId))
  }

  const clearCart = () => {
    setCartProducts([])
    setClienteSeleccionado(null)
    setFormData({
      subtotal: 0,
      interestDiscount: 0,
      interestDiscountType: "amount",
      isInterest: false,
      total: 0,
      notes: "",
      condicionesComerciales: "",
      tiempoEntrega: "",
      validezDias: 30,
    })
  }

  const handleCotizacionConfirm = async () => {
    if (cartProducts.length === 0) {
      toast.error("Debe agregar al menos un producto")
      return
    }

    if (!clienteSeleccionado || clienteSeleccionado.id === 1) {
      toast.error("Debe seleccionar un cliente registrado para la cotización")
      return
    }

    try {
      const cotizacionData = prepareCotizacionDataFromForm(formData, cartProducts, clienteSeleccionado)

      const result = await createCotizacion(cotizacionData)

      if (result.success) {
        const cotizacionId = result.data?.data?.id || result.data?.id

        if (cotizacionId) {
          setTimeout(async () => {
            try {
              const cotizacionDetails = await getCotizacionById(cotizacionId)

              if (cotizacionDetails.success) {
                setCompletedCotizacion(cotizacionDetails.data)
                setShowCotizacionModal(true)
              } else {
                console.error("Error al obtener detalles de cotización:", cotizacionDetails.message)
                toast.error("Cotización creada pero no se pudo generar el documento")
              }
            } catch (error) {
              console.error("Error al obtener detalles de cotización:", error)
              toast.error("Cotización creada pero no se pudo generar el documento")
            }
          }, 500)
        } else {
          console.error("No se pudo obtener el ID de cotización")
          toast.error("Cotización creada pero no se pudo generar el documento")
        }

        clearCart()
      } else {
        console.error("Error al crear cotización:", result.message)
      }
    } catch (error) {
      console.error("Error al procesar la cotización:", error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const handleInterestDiscountChange = (values) => {
    const value = Number.parseFloat(values.value) || 0
    let adjustment = 0
    const subtotal = cartProducts.reduce((sum, product) => sum + product.quantity * product.precio_venta, 0)

    if (formData.interestDiscountType === "percentage") {
      adjustment = (subtotal * value) / 100
    } else {
      adjustment = value
    }

    if (!formData.isInterest) {
      adjustment = -adjustment
    }

    const total = Math.max(0, subtotal + adjustment)
    setFormData((prev) => ({
      ...prev,
      interestDiscount: values.value,
      total,
    }))
  }

  const getAdjustmentAmount = () => {
    const value = Number.parseFloat(formData.interestDiscount) || 0
    if (formData.interestDiscountType === "percentage") {
      return (formData.subtotal * value) / 100
    }
    return value
  }

  const canOpenProductModal = () => {
    return !!clienteSeleccionado
  }

  const canProcessCotizacion = () => {
    return !!clienteSeleccionado && clienteSeleccionado.id !== 1 && cartProducts.length > 0
  }

  if (loadingConfig) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando configuración...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-[95rem] mx-auto px-4 py-6 min-h-screen">
        {/* Header */}
        <div className="mb-8">

          {/* Indicador de estado cuando hay productos */}
          {cartProducts.length > 0 && (
            <div className="mt-4 p-3 rounded-lg border-l-4 bg-purple-50 border-purple-400 text-purple-800">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span className="text-sm font-medium">Cotización en progreso</span>
                <span className="text-xs opacity-75">
                  • {cartProducts.length} producto{cartProducts.length !== 1 ? "s" : ""} en carrito
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cliente */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4 bg-slate-800">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center text-white">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    Cliente
                  </div>
                  <Button
                    onClick={() => setShowClientModal(true)}
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Search className="w-4 h-4 mr-1" />
                    {clienteSeleccionado && clienteSeleccionado.id !== 1 ? "Cambiar" : "Seleccionar"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {clienteSeleccionado && clienteSeleccionado.id !== 1 ? (
                  <div className="bg-gray-200 rounded-lg p-4 -mt-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{clienteSeleccionado.nombre}</h3>
                        {clienteSeleccionado.telefono || clienteSeleccionado.email ? (
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            {clienteSeleccionado.telefono && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {clienteSeleccionado.telefono}
                              </div>
                            )}
                            {clienteSeleccionado.email && (
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {clienteSeleccionado.email}
                              </div>
                            )}
                          </div>
                        ) : null}
                        {clienteSeleccionado.direccion && (
                          <div className="flex items-center mt-2">
                            <Building2 className="w-4 h-4 mr-1 text-gray-600" />
                            <span className="text-sm text-gray-700">{clienteSeleccionado.direccion}</span>
                          </div>
                        )}
                        <Badge
                          variant="outline"
                          className="mt-2 text-xs bg-purple-100 text-purple-700 border-purple-300"
                        >
                          Cliente para cotización
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No hay cliente seleccionado</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Debe seleccionar un cliente registrado para crear la cotización
                    </p>
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center justify-center text-amber-700">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Las cotizaciones requieren un cliente registrado</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Productos */}
            <Card className="border-0 shadow-sm mb-">
              <CardHeader className="pb-4 bg-slate-800">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center text-white">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    Productos
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setShowProductModal(true)}
                      disabled={!canOpenProductModal()}
                      variant="outline"
                      size="sm"
                      className="border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {cartProducts.length > 0 ? (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {cartProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onUpdateQuantity={updateProductQuantity}
                        onRemove={removeProductFromCart}
                        onUpdatePrice={updateProductPrice}
                        formatCurrency={formatCurrency}
                        config={config}
                        showStockWarning={false} // Las cotizaciones no afectan stock
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No hay productos en el carrito</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {canOpenProductModal()
                        ? "Haga clic en 'Agregar' para buscar productos"
                        : "Primero seleccione un cliente"}
                    </p>
                    {canOpenProductModal() && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-center text-blue-700">
                          <FileText className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Las cotizaciones no afectan el stock de productos</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Cálculos y Acciones */}
          <div className="space-y-6">
            <div className="sticky top-32 z-10">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4 bg-slate-800">
                  <CardTitle className="text-lg font-semibold text-white flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <Calculator className="w-4 h-4 text-orange-600" />
                    </div>
                    Totales
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-6 -mt-4">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900 text-lg">{formatCurrency(formData.subtotal)}</span>
                  </div>

                  {/* Ajustes adicionales */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Ajustes Adicionales</span>
                      <div className="flex rounded-lg border border-gray-200 p-1">
                        <button
                          onClick={() => setFormData((prev) => ({ ...prev, isInterest: false }))}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            !formData.isInterest ? "bg-green-100 text-green-700" : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <TrendingDown className="w-3 h-3 mr-1 inline" />
                          Descuento
                        </button>
                        <button
                          onClick={() => setFormData((prev) => ({ ...prev, isInterest: true }))}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            formData.isInterest ? "bg-red-100 text-red-700" : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <TrendingUp className="w-3 h-3 mr-1 inline" />
                          Interés
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        {formData.interestDiscountType === "amount" ? (
                          <NumericFormat
                            value={formData.interestDiscount}
                            onValueChange={handleInterestDiscountChange}
                            thousandSeparator="."
                            decimalSeparator=","
                            decimalScale={2}
                            fixedDecimalScale={true}
                            allowNegative={false}
                            placeholder="0,00"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.interestDiscount}
                            onChange={(e) => {
                              const value = e.target.value
                              setFormData((prev) => ({ ...prev, interestDiscount: value }))
                              handleInterestDiscountChange({ value })
                            }}
                            placeholder="0.00"
                            className="text-sm border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        )}
                      </div>
                      <select
                        value={formData.interestDiscountType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, interestDiscountType: e.target.value }))}
                        className="px-2 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="amount">ARS</option>
                        <option value="percentage">%</option>
                      </select>
                    </div>

                    {formData.interestDiscount > 0 && (
                      <div className="flex justify-between items-center text-sm py-1">
                        <span className="text-gray-600">
                          {formData.isInterest ? "Interés aplicado" : "Descuento aplicado"}
                        </span>
                        <span className={`font-medium ${formData.isInterest ? "text-red-600" : "text-green-600"}`}>
                          {formData.isInterest ? "+" : "-"}
                          {formatCurrency(getAdjustmentAmount())}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Configuraciones de cotización */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5 text-gray-600" />
                        Validez (días)
                      </span>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={formData.validezDias}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, validezDias: Number.parseInt(e.target.value) || 30 }))
                        }
                        className="w-20 text-sm text-center"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Clock className="w-4 h-4 mr-1.5 text-gray-600" />
                        Tiempo de entrega
                      </label>
                      <Input
                        placeholder="ej: 7-10 días hábiles"
                        value={formData.tiempoEntrega}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tiempoEntrega: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-gray-900">{formatCurrency(formData.total)}</span>
                    </div>
                  </div>

                  {/* Botón Principal */}
                  <Button
                    onClick={handleCotizacionConfirm}
                    disabled={!canProcessCotizacion()}
                    className="w-full h-12 text-base font-semibold rounded-lg disabled:opacity-50 bg-purple-600 hover:bg-purple-700 text-white"
                    size="lg"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Crear Cotización
                  </Button>

                  {/* Acciones Secundarias */}
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      onClick={clearCart}
                      variant="outline"
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-transparent"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Limpiar Todo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Información Adicional */}
              {canProcessCotizacion() && (
                <Card className="border-0 shadow-sm mt-4 bg-purple-50 border-purple-100">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100">
                        <Check className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-purple-900">Todo listo</h4>
                        <p className="text-xs mt-1 text-purple-700">
                          La cotización está completa y lista para ser creada.
                        </p>
                        <p className="text-xs mt-1 text-purple-600 font-medium">
                          ⚠️ Las cotizaciones no afectan el stock de productos
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Modales */}
        <ClientSelectionModal
          isOpen={showClientModal}
          onClose={() => setShowClientModal(false)}
          onClientSelect={setClienteSeleccionado}
          selectedClient={clienteSeleccionado}
          excludeConsumidorFinal={true} // Excluir "Consumidor Final" para cotizaciones
        />

        <ProductSelectionModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          onProductSelect={addProductToCart}
          loading={loadingProducts}
        />

        <CotizacionPrintModal
          isOpen={showCotizacionModal}
          onClose={() => setShowCotizacionModal(false)}
          cotizacionData={completedCotizacion}
          config={config}
        />
      </div>
    </Layout>
  )
}

export default Cotizaciones
