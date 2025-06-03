"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { X, ShoppingCart, User, CreditCard, Receipt } from "lucide-react"
import ClientSelector from "./ClientSelector"
import ProductSelector from "./ProductSelector"
import SaleCart from "./SaleCart"
import PaymentSection from "./PaymentSection"
import SaleConfirmation from "./SaleConfirmation"
import { useSales } from "../../hooks/useSales"
import { useConfig } from "../../hooks/useConfig"

const STEPS = {
  CLIENT: "client",
  PRODUCTS: "products",
  PAYMENT: "payment",
  CONFIRMATION: "confirmation",
}

const SaleModal = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(STEPS.CLIENT)
  const [selectedClient, setSelectedClient] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [paymentData, setPaymentData] = useState({
    tipoPago: "efectivo",
    descuento: 0,
    observaciones: "",
  })
  const [saleResult, setSaleResult] = useState(null)

  const { createSale, loading } = useSales()
  const { config } = useConfig()

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(STEPS.CLIENT)
      setSelectedClient(null)
      setCartItems([])
      setPaymentData({
        tipoPago: "efectivo",
        descuento: 0,
        observaciones: "",
      })
      setSaleResult(null)
    }
  }, [isOpen])

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  const handleClientSelect = (client) => {
    setSelectedClient(client)
    setCurrentStep(STEPS.PRODUCTS)
  }

  const handleAddToCart = (product, quantity) => {
    const existingItem = cartItems.find((item) => item.producto_id === product.id)
    const precio_venta = Number(product.precio_venta) || 0

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.producto_id === product.id
            ? {
                ...item,
                cantidad: item.cantidad + quantity,
                subtotal: (item.cantidad + quantity) * item.precio_unitario,
              }
            : item,
        ),
      )
    } else {
      setCartItems([
        ...cartItems,
        {
          producto_id: product.id,
          producto_codigo: product.codigo,
          producto_nombre: product.nombre,
          producto_marca: product.marca,
          cantidad: quantity,
          precio_unitario: precio_venta,
          subtotal: quantity * precio_venta,
          stock_disponible: product.stock,
        },
      ])
    }
  }

  const handleUpdateCartItem = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter((item) => item.producto_id !== productId))
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.producto_id === productId
            ? {
                ...item,
                cantidad: newQuantity,
                subtotal: newQuantity * item.precio_unitario,
              }
            : item,
        ),
      )
    }
  }

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.producto_id !== productId))
  }

  const handleProceedToPayment = () => {
    if (cartItems.length > 0) {
      setCurrentStep(STEPS.PAYMENT)
    }
  }

  const handleProcessSale = async () => {
    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
    const descuento = Number(paymentData.descuento || 0)
    const total = Math.max(0, subtotal - descuento)

    const saleData = {
      clienteId: selectedClient.id,
      fechaVenta: new Date().toISOString().split("T")[0],
      tipoPago: paymentData.tipoPago,
      descuento: descuento,
      observaciones: paymentData.observaciones || "",
      detalles: cartItems.map((item) => ({
        productoId: item.producto_id,
        cantidad: item.cantidad,
        precioUnitario: item.precio_unitario,
      })),
    }

    const result = await createSale(saleData)

    if (result.success) {
      setSaleResult(result.data)
      setCurrentStep(STEPS.CONFIRMATION)
    }
  }

  const handleFinish = () => {
    onComplete()
    handleClose()
  }

  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
  const total = Math.max(0, subtotal - Number(paymentData.descuento || 0))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Nueva Venta</h2>
              <p className="text-sm text-slate-300 mt-1">
                {currentStep === STEPS.CLIENT && "Selecciona un cliente"}
                {currentStep === STEPS.PRODUCTS && "Agrega productos al carrito"}
                {currentStep === STEPS.PAYMENT && "Configura el pago"}
                {currentStep === STEPS.CONFIRMATION && "Venta completada"}
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

        {/* Progress Steps */}
        <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { key: STEPS.CLIENT, label: "Cliente", icon: User },
              { key: STEPS.PRODUCTS, label: "Productos", icon: ShoppingCart },
              { key: STEPS.PAYMENT, label: "Pago", icon: CreditCard },
              { key: STEPS.CONFIRMATION, label: "Confirmación", icon: Receipt },
            ].map((step, index) => {
              const isActive = currentStep === step.key
              const isCompleted = Object.values(STEPS).indexOf(currentStep) > Object.values(STEPS).indexOf(step.key)

              return (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? "bg-green-600 border-green-600 text-white"
                        : isCompleted
                          ? "bg-green-100 border-green-600 text-green-600"
                          : "bg-white border-slate-300 text-slate-400"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      isActive || isCompleted ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < 3 && <div className={`w-12 h-0.5 mx-4 ${isCompleted ? "bg-green-600" : "bg-slate-300"}`} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {currentStep === STEPS.CLIENT && <ClientSelector onClientSelect={handleClientSelect} />}

          {currentStep === STEPS.PRODUCTS && (
            <div className="h-full flex">
              <div className="flex-1 p-6 overflow-y-auto">
                <ProductSelector onAddToCart={handleAddToCart} />
              </div>
              <div className="w-96 border-l border-slate-200 bg-slate-50">
                <SaleCart
                  items={cartItems}
                  onUpdateItem={handleUpdateCartItem}
                  onRemoveItem={handleRemoveFromCart}
                  subtotal={subtotal}
                  client={selectedClient}
                  onProceed={handleProceedToPayment}
                />
              </div>
            </div>
          )}

          {currentStep === STEPS.PAYMENT && (
            <PaymentSection
              cartItems={cartItems}
              client={selectedClient}
              subtotal={subtotal}
              paymentData={paymentData}
              onPaymentDataChange={setPaymentData}
              onProcessSale={handleProcessSale}
              onBack={() => setCurrentStep(STEPS.PRODUCTS)}
              loading={loading}
            />
          )}

          {currentStep === STEPS.CONFIRMATION && (
            <SaleConfirmation
              saleResult={saleResult}
              client={selectedClient}
              cartItems={cartItems}
              paymentData={paymentData}
              total={total}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default SaleModal
