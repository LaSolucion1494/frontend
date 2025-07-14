"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Plus, ShoppingCart, Package, AlertCircle, Calculator } from "lucide-react"
import { NumericFormat } from "react-number-format"
import toast from "react-hot-toast"

import PurchaseProductSelectionModal from "./PurchaseProductSelectionModal"
import PurchaseProductCard from "./PurchaseProductCard"
import PurchaseSupplierSelector from "./PurchaseSupplierSelector"
import PurchasePaymentModal from "./PurchasePaymentModal"

import { productsService } from "../../services/productsService"
import { purchasesService } from "../../services/purchasesService"
import pricingService from "../../services/pricingService"

const PurchaseForm = ({ onPurchaseSuccess }) => {
  // Estados principales
  const [products, setProducts] = useState([])
  const [cartProducts, setCartProducts] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [pricingConfig, setPricingConfig] = useState({})
  const [loading, setLoading] = useState(false)

  // Estados de modales
  const [showProductModal, setShowProductModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Estados del formulario
  const [formData, setFormData] = useState({
    notes: "",
    fechaCompra: new Date().toISOString().split("T")[0],
    interestDiscount: 0,
    interestDiscountType: "fixed", // 'fixed' o 'percentage'
    isInterest: false, // true para interés, false para descuento
  })

  // Estados calculados
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    interest: 0,
    total: 0,
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  // Recalcular totales cuando cambia el carrito o descuentos/intereses
  useEffect(() => {
    calculateTotals()
  }, [cartProducts, formData.interestDiscount, formData.interestDiscountType, formData.isInterest])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [productsResult, configResult] = await Promise.all([
        productsService.getProducts({ activo: "true" }),
        pricingService.getPricingConfig(),
      ])

      if (productsResult.success) {
        setProducts(productsResult.data)
      }

      setPricingConfig(configResult)
    } catch (error) {
      console.error("Error cargando datos iniciales:", error)
      toast.error("Error al cargar datos iniciales")
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = () => {
    const subtotal = cartProducts.reduce((sum, product) => sum + product.quantity * product.precio_costo, 0)

    let discount = 0
    let interest = 0

    if (formData.interestDiscount > 0) {
      const amount =
        formData.interestDiscountType === "percentage"
          ? (subtotal * Number.parseFloat(formData.interestDiscount)) / 100
          : Number.parseFloat(formData.interestDiscount)

      if (formData.isInterest) {
        interest = amount
      } else {
        discount = amount
      }
    }

    const total = Math.max(0, subtotal - discount + interest)

    setTotals({
      subtotal: Number.parseFloat(subtotal.toFixed(2)),
      discount: Number.parseFloat(discount.toFixed(2)),
      interest: Number.parseFloat(interest.toFixed(2)),
      total: Number.parseFloat(total.toFixed(2)),
    })
  }

  // MODIFICADO: Manejar actualización de precios en el carrito (no en BD)
  const handleUpdateProductPrice = (productId, priceData) => {
    setCartProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            precio_costo: priceData.precio_costo,
            precio_costo_original: product.precio_costo_original || product.precio_costo,
          }
        }
        return product
      }),
    )
  }

  const handleAddProduct = (product, quantity = 1) => {
    const existingProduct = cartProducts.find((p) => p.id === product.id)

    if (existingProduct) {
      setCartProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p)))
    } else {
      setCartProducts((prev) => [
        ...prev,
        {
          ...product,
          quantity: quantity,
          precio_costo_original: product.precio_costo,
        },
      ])
    }
    toast.success(`${product.nombre} agregado al carrito (${quantity} unidades)`)
  }

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveProduct(productId)
      return
    }

    setCartProducts((prev) =>
      prev.map((product) => (product.id === productId ? { ...product, quantity: newQuantity } : product)),
    )
  }

  const handleRemoveProduct = (productId) => {
    const product = cartProducts.find((p) => p.id === productId)
    setCartProducts((prev) => prev.filter((p) => p.id !== productId))
    if (product) {
      toast.success(`${product.nombre} eliminado del carrito`)
    }
  }

  const handleFormSubmit = () => {
    if (cartProducts.length === 0) {
      toast.error("Debe agregar al menos un producto")
      return
    }

    if (!selectedSupplier) {
      toast.error("Debe seleccionar un proveedor")
      return
    }

    setShowPaymentModal(true)
  }

  // MODIFICADO: Incluir precios modificados en los datos de compra
  const handlePaymentSubmit = async (payments) => {
    try {
      setLoading(true)

      // Preparar productos con precios modificados
      const productosConPrecios = cartProducts.map((product) => ({
        productoId: product.id,
        cantidad: product.quantity,
        precioUnitario: product.precio_costo,
        // NUEVO: Incluir información de precios modificados
        precio_costo_nuevo: product.precio_costo,
        precio_costo_original: product.precio_costo_original || product.precio_costo,
        precio_modificado: product.precio_costo !== (product.precio_costo_original || product.precio_costo),
      }))

      const purchaseData = purchasesService.preparePurchaseDataFromForm(
        {
          ...formData,
          subtotal: totals.subtotal,
          total: totals.total,
          interestDiscount: formData.interestDiscount,
          isInterest: formData.isInterest,
          interestDiscountType: formData.interestDiscountType,
        },
        productosConPrecios, // Productos con información de precios
        payments,
        selectedSupplier,
        true, // Recibir inmediatamente
      )

      const result = await purchasesService.createPurchase(purchaseData)

      if (result.success) {
        toast.success("Compra registrada exitosamente")

        // Limpiar formulario
        setCartProducts([])
        setSelectedSupplier(null)
        setFormData({
          notes: "",
          fechaCompra: new Date().toISOString().split("T")[0],
          interestDiscount: 0,
          interestDiscountType: "fixed",
          isInterest: false,
        })
        setShowPaymentModal(false)

        // Recargar productos para reflejar cambios de precio
        loadInitialData()

        if (onPurchaseSuccess) {
          onPurchaseSuccess(result.data)
        }
      } else {
        toast.error(result.message || "Error al registrar compra")
      }
    } catch (error) {
      console.error("Error al procesar compra:", error)
      toast.error("Error al procesar compra")
    } finally {
      setLoading(false)
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

  // Verificar si hay precios modificados
  const hasModifiedPrices = cartProducts.some(
    (product) => product.precio_costo !== (product.precio_costo_original || product.precio_costo),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nueva Compra</h1>
          <p className="text-slate-600 mt-1">Registre una nueva compra de productos</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <ShoppingCart className="w-4 h-4 mr-1" />
          {cartProducts.length} productos
        </Badge>
      </div>

      {/* Selector de proveedor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Proveedor</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseSupplierSelector
            selectedSupplier={selectedSupplier}
            onSupplierSelect={setSelectedSupplier}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Productos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Productos</CardTitle>
            <Button
              onClick={() => setShowProductModal(true)}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {cartProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="font-medium text-lg mb-2">No hay productos agregados</h3>
              <p className="text-sm">Haga clic en "Agregar Producto" para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Alerta de precios modificados */}
              {hasModifiedPrices && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-amber-800">Precios modificados</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Algunos productos tienen precios de costo modificados. Los precios se actualizarán en el stock
                        al confirmar la compra.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {cartProducts.map((product) => (
                <PurchaseProductCard
                  key={product.id}
                  product={product}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveProduct}
                  onUpdatePrice={handleUpdateProductPrice}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totales y formulario */}
      {cartProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen de Compra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Descuentos/Intereses */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="discount"
                    name="interestDiscountType"
                    checked={!formData.isInterest}
                    onChange={() => setFormData((prev) => ({ ...prev, isInterest: false }))}
                    className="text-slate-800 focus:ring-slate-800"
                  />
                  <label htmlFor="discount" className="text-sm font-medium text-slate-700">
                    Descuento
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="interest"
                    name="interestDiscountType"
                    checked={formData.isInterest}
                    onChange={() => setFormData((prev) => ({ ...prev, isInterest: true }))}
                    className="text-slate-800 focus:ring-slate-800"
                  />
                  <label htmlFor="interest" className="text-sm font-medium text-slate-700">
                    Interés
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <NumericFormat
                  value={formData.interestDiscount}
                  onValueChange={(values) =>
                    setFormData((prev) => ({ ...prev, interestDiscount: Number.parseFloat(values.value) || 0 }))
                  }
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  fixedDecimalScale={true}
                  allowNegative={false}
                  className="flex-1 h-10 border border-slate-300 rounded-md px-3 focus:border-slate-800 focus:ring-1 focus:ring-slate-800/20"
                  placeholder="0,00"
                />
                <select
                  value={formData.interestDiscountType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, interestDiscountType: e.target.value }))}
                  className="h-10 border border-slate-300 rounded-md px-3 focus:border-slate-800 focus:ring-1 focus:ring-slate-800/20"
                >
                  <option value="fixed">Monto fijo</option>
                  <option value="percentage">Porcentaje</option>
                </select>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full h-20 border border-slate-300 rounded-md px-3 py-2 focus:border-slate-800 focus:ring-1 focus:ring-slate-800/20"
                placeholder="Observaciones adicionales..."
              />
            </div>

            <Separator />

            {/* Totales */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
              </div>

              {totals.discount > 0 && (
                <div className="flex items-center justify-between text-sm text-green-600">
                  <span>Descuento:</span>
                  <span>-{formatCurrency(totals.discount)}</span>
                </div>
              )}

              {totals.interest > 0 && (
                <div className="flex items-center justify-between text-sm text-red-600">
                  <span>Interés:</span>
                  <span>+{formatCurrency(totals.interest)}</span>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-slate-900">{formatCurrency(totals.total)}</span>
              </div>
            </div>

            {/* Botón de continuar */}
            <Button
              onClick={handleFormSubmit}
              disabled={loading || cartProducts.length === 0 || !selectedSupplier}
              className="w-full bg-slate-800 hover:bg-slate-700 h-12"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Procesando...
                </div>
              ) : (
                <div className="flex items-center">
                  <Calculator className="w-4 h-4 mr-2" />
                  Continuar con el Pago
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modales */}
      <PurchaseProductSelectionModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onProductSelect={handleAddProduct}
        products={products}
        loading={loading}
      />

      <PurchasePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handlePaymentSubmit}
        total={totals.total}
        loading={loading}
      />
    </div>
  )
}

export default PurchaseForm
