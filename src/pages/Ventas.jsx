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
  CreditCard,
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
} from "lucide-react"
import ClientSelectionModal from "../components/sales/ClientSelectionModal"
import ProductSelectionModal from "../components/sales/ProductSelectionModal"
import PaymentModal from "../components/sales/PaymentModal"
import InvoicePrintModal from "../components/sales/InvoicePrintModal"
import ProductCard from "../components/sales/ProductCard"
import { useProducts } from "../hooks/useProducts"
import { useClients } from "../hooks/useClients"
import { useSales } from "../hooks/useSales"
import { useConfig } from "../hooks/useConfig"
import toast from "react-hot-toast"

const Ventas = () => {
  const [cartProducts, setCartProducts] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [formData, setFormData] = useState({
    subtotal: 0,
    interestDiscount: 0,
    interestDiscountType: "amount",
    isInterest: false,
    total: 0,
    notes: "",
    tipoFactura: "B",
  })

  const [showClientModal, setShowClientModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [completedSale, setCompletedSale] = useState(null)

  const { products, loading: loadingProducts, fetchProducts } = useProducts()
  const { clients, fetchClients } = useClients()
  const { loading: loadingSale, createSale, prepareSaleDataFromForm, getSaleById } = useSales()
  const { config, loading: loadingConfig } = useConfig()

  useEffect(() => {
    fetchProducts()
    fetchClients()
  }, [])

  // Seleccionar automáticamente el cliente "Consumidor Final" al cargar
  useEffect(() => {
    if (clients.length > 0 && !clienteSeleccionado) {
      const consumidorFinal = clients.find((client) => client.id === 1)
      if (consumidorFinal) {
        setClienteSeleccionado({
          id: 1,
          nombre: "Consumidor Final",
          tipo: "consumidor_final",
          tiene_cuenta_corriente: false,
        })
      }
    }
  }, [clients, clienteSeleccionado])

  useEffect(() => {
    calculateTotals()
  }, [cartProducts, formData.interestDiscount, formData.interestDiscountType, formData.isInterest])

  const calculateTotals = () => {
    // Cálculo simplificado - solo suma los precios finales de los productos
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

  // Función simplificada para agregar producto al carrito
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
    const consumidorFinal = clients.find((client) => client.id === 1)
    if (consumidorFinal) {
      setClienteSeleccionado({
        id: 1,
        nombre: "Consumidor Final",
        tipo: "consumidor_final",
        tiene_cuenta_corriente: false,
      })
    } else {
      setClienteSeleccionado(null)
    }
    setFormData({
      subtotal: 0,
      interestDiscount: 0,
      interestDiscountType: "amount",
      isInterest: false,
      total: 0,
      notes: "",
      tipoFactura: "B",
    })
  }

  const handlePaymentConfirm = async (payments) => {
    if (cartProducts.length === 0) {
      toast.error("Debe agregar al menos un producto")
      return
    }

    if (!payments || payments.length === 0) {
      toast.error("Debe agregar al menos un método de pago")
      return
    }

    try {
      const saleData = prepareSaleDataFromForm(formData, cartProducts, payments, clienteSeleccionado)
      saleData.tipoFactura = formData.tipoFactura

      const result = await createSale(saleData)

      if (result.success) {
        setShowPaymentModal(false)

        const saleId = result.data?.data?.id || result.data?.id

        if (saleId) {
          setTimeout(async () => {
            try {
              const saleDetails = await getSaleById(saleId)

              if (saleDetails.success) {
                setCompletedSale({
                  ...saleDetails.data,
                  tipoFactura: formData.tipoFactura,
                })
                setShowInvoiceModal(true)
              } else {
                console.error("Error al obtener detalles de venta:", saleDetails.message)
                toast.error("Venta creada pero no se pudo generar la factura")
              }
            } catch (error) {
              console.error("Error al obtener detalles de venta:", error)
              toast.error("Venta creada pero no se pudo generar la factura")
            }
          }, 500)
        } else {
          console.error("No se pudo obtener el ID de venta")
          toast.error("Venta creada pero no se pudo generar la factura")
        }

        clearCart()
        toast.success("Venta registrada exitosamente")
      } else {
        console.error("Error al crear venta:", result.message)
        toast.error(result.message || "Error al registrar la venta")
      }
    } catch (error) {
      console.error("Error al procesar la venta:", error)
      toast.error("Error inesperado al procesar la venta")
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

    if (formData.interestDiscountType === "percentage") {
      adjustment = (formData.subtotal * value) / 100
    } else {
      adjustment = value
    }

    if (!formData.isInterest) {
      adjustment = -adjustment
    }

    const total = Math.max(0, formData.subtotal + adjustment)
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

  const canProcessPayment = () => {
    return !!clienteSeleccionado && cartProducts.length > 0
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
                {clienteSeleccionado ? (
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
                        {clienteSeleccionado.tiene_cuenta_corriente ? (
                          <div className="flex items-center mt-2">
                            <Building2 className="w-4 h-4 mr-1 text-orange-600" />
                            <span className="text-sm text-orange-700 font-medium">Cuenta Corriente</span>
                            <Badge variant="outline" className="ml-2 text-xs text-white bg-slate-800">
                              Disponible:{" "}
                              {clienteSeleccionado.limite_credito === null
                                ? "Ilimitado"
                                : formatCurrency(
                                    clienteSeleccionado.limite_credito - clienteSeleccionado.saldo_cuenta_corriente,
                                  )}
                            </Badge>
                          </div>
                        ) : null}
                        {clienteSeleccionado.id === 1 && (
                          <Badge variant="outline" className="mt-2 text-xs bg-blue-100 text-blue-700 border-blue-300">
                            Venta rápida
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No hay cliente seleccionado</p>
                    <p className="text-sm text-gray-400 mt-1">Haga clic en "Seleccionar" para elegir un cliente</p>
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
                  {/* Tipo de Factura */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <FileText className="w-4 h-4 mr-1.5 text-gray-600" />
                        Tipo de Factura
                      </span>
                      <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                        <button
                          onClick={() => setFormData((prev) => ({ ...prev, tipoFactura: "B" }))}
                          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                            formData.tipoFactura === "B"
                              ? "bg-slate-800 text-white shadow-sm"
                              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                          }`}
                        >
                          Factura B
                        </button>
                        <button
                          onClick={() => setFormData((prev) => ({ ...prev, tipoFactura: "A" }))}
                          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                            formData.tipoFactura === "A"
                              ? "bg-slate-800 text-white shadow-sm"
                              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                          }`}
                        >
                          Factura A
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      {formData.tipoFactura === "A"
                        ? "Factura A: IVA discriminado (para responsables inscriptos)"
                        : "Factura B: IVA incluido (para consumidores finales)"}
                    </div>
                  </div>

                  <Separator />

                  {/* Subtotal */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900 text-lg">{formatCurrency(formData.subtotal)}</span>
                  </div>

                  {/* Ajustes adicionales (descuento/interés general) */}
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

                  {/* Total */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-gray-900">{formatCurrency(formData.total)}</span>
                    </div>
                  </div>

                  {/* Botón Principal */}
                  <Button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={!canProcessPayment()}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white h-12 text-base font-semibold rounded-lg disabled:opacity-50"
                    size="lg"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Procesar Pago
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
              {canProcessPayment() && (
                <Card className="border-0 shadow-sm bg-blue-50 border-blue-100 mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900 text-sm">Todo listo</h4>
                        <p className="text-blue-700 text-xs mt-1">
                          La venta está completa y lista para procesar el pago.
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
        />

        <ProductSelectionModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          onProductSelect={addProductToCart}
          products={products}
          loading={loadingProducts}
        />

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          total={formData.total}
          onConfirm={handlePaymentConfirm}
          selectedClient={clienteSeleccionado?.tipo !== "consumidor_final" ? clienteSeleccionado?.id : null}
          clients={clients}
          loading={loadingSale}
        />

        <InvoicePrintModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          saleData={completedSale}
          config={config}
          tipoFactura={completedSale?.tipoFactura || "B"}
        />
      </div>
    </Layout>
  )
}

export default Ventas
