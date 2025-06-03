"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, Plus, Minus, Trash2, Package, ShoppingCart, AlertCircle, Check, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { NumericFormat } from "react-number-format"
import toast from "react-hot-toast"

import Layout from "../components/Layout"
import { useSuppliers } from "../hooks/useSuppliers"
import { useProducts } from "../hooks/useProducts"
import { usePurchases } from "../hooks/usePurchase"

// Componente para formatear precios argentinos
const PriceDisplay = ({ value, className = "" }) => {
  return (
    <span className={className}>
      {new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
      }).format(value || 0)}
    </span>
  )
}

// Componente para input de precio con formato argentino
const PriceInput = ({ value, onChange, placeholder = "0,00", className = "", ...props }) => {
  return (
    <NumericFormat
      value={value}
      onValueChange={(values) => {
        onChange(values.floatValue || 0)
      }}
      thousandSeparator="."
      decimalSeparator=","
      prefix="$ "
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      placeholder={placeholder}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

// Componente de búsqueda de productos mejorado
const ProductSearch = ({ onProductSelect, selectedProducts }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const { products, fetchProducts } = useProducts()
  const searchRef = useRef(null)
  const resultsRef = useRef(null)

  // Buscar productos en tiempo real
  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsSearching(true)
      try {
        await fetchProducts({ search: searchTerm.trim() })
      } catch (error) {
        console.error("Error searching products:", error)
      } finally {
        setIsSearching(false)
      }
    }

    const timeoutId = setTimeout(searchProducts, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, fetchProducts])

  // Actualizar resultados cuando cambien los productos
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const filteredProducts = products.filter(
        (product) => !selectedProducts.some((selected) => selected.id === product.id),
      )
      setSearchResults(filteredProducts)
      setShowResults(true)
    }
  }, [products, searchTerm, selectedProducts])

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleProductDoubleClick = (product) => {
    onProductSelect(product)
    setSearchTerm("")
    setShowResults(false)
  }

  return (
    <div className="relative">
      <div ref={searchRef} className="flex space-x-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Buscar producto por código o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.trim().length >= 2 && setShowResults(true)}
            className="pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {showResults && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {searchResults.length > 0 ? (
            <div className="p-2">
              <div className="text-xs text-gray-500 px-2 py-1 border-b">
                {searchResults.length} producto(s) encontrado(s) - Doble clic para agregar
              </div>
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  onDoubleClick={() => handleProductDoubleClick(product)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product.nombre}</div>
                      <div className="text-sm text-gray-500">
                        Código: {product.codigo} • {product.marca || "Sin marca"}
                      </div>
                      <div className="text-xs text-gray-400">Stock: {product.stock} unidades</div>
                    </div>
                    <div className="text-right">
                      <PriceDisplay value={product.precioCosto} className="font-medium text-green-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm.trim().length >= 2 && !isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <X className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No se encontraron productos</p>
              <p className="text-xs">Intente con otro término de búsqueda</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

// Modal para seleccionar cantidad
const QuantityModal = ({ isOpen, onClose, product, onConfirm }) => {
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState(0)

  useEffect(() => {
    if (product) {
      setQuantity(1)
      setPrice(product.precioCosto || 0)
    }
  }, [product])

  const handleConfirm = () => {
    if (quantity > 0 && price >= 0) {
      onConfirm({
        ...product,
        cantidad: quantity,
        precioUnitario: price,
      })
      onClose()
    } else {
      toast.error("La cantidad debe ser mayor a 0 y el precio válido")
    }
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Producto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium">{product.nombre}</div>
            <div className="text-sm text-gray-500">
              {product.codigo} • {product.marca || "Sin marca"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="text-center"
                />
                <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Precio Unitario</Label>
              <PriceInput value={price} onChange={setPrice} />
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal:</span>
              <PriceDisplay value={quantity * price} className="font-bold text-blue-600" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            <Check className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Componente principal
export default function Compras() {
  const { suppliers } = useSuppliers()
  const { createPurchase, loading } = usePurchases()

  // Estado del formulario principal
  const [formData, setFormData] = useState({
    proveedorId: "",
    fechaCompra: new Date().toISOString().split("T")[0],
    descuento: 0,
    observaciones: "",
  })

  // Estado para productos
  const [selectedProducts, setSelectedProducts] = useState([])
  const [quantityModalOpen, setQuantityModalOpen] = useState(false)
  const [selectedProductForModal, setSelectedProductForModal] = useState(null)

  // Calcular totales
  const subtotal = selectedProducts.reduce((sum, product) => sum + product.cantidad * product.precioUnitario, 0)
  const total = subtotal - (formData.descuento || 0)

  // Manejar selección de producto desde búsqueda
  const handleProductSelect = (product) => {
    setSelectedProductForModal(product)
    setQuantityModalOpen(true)
  }

  // Confirmar agregado de producto
  const handleConfirmProduct = (productWithQuantity) => {
    setSelectedProducts((prev) => [...prev, productWithQuantity])
    toast.success("Producto agregado a la compra")
  }

  // Actualizar cantidad de producto
  const updateProductQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return
    setSelectedProducts((prev) =>
      prev.map((product) => (product.id === productId ? { ...product, cantidad: newQuantity } : product)),
    )
  }

  // Actualizar precio de producto
  const updateProductPrice = (productId, newPrice) => {
    setSelectedProducts((prev) =>
      prev.map((product) => (product.id === productId ? { ...product, precioUnitario: newPrice } : product)),
    )
  }

  // Eliminar producto
  const removeProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((product) => product.id !== productId))
    toast.success("Producto eliminado")
  }

  // Limpiar formulario
  const clearForm = () => {
    setFormData({
      proveedorId: "",
      fechaCompra: new Date().toISOString().split("T")[0],
      descuento: 0,
      observaciones: "",
    })
    setSelectedProducts([])
  }

  // Guardar compra
  const handleSavePurchase = async () => {
    // Validaciones
    if (!formData.proveedorId) {
      toast.error("Seleccione un proveedor")
      return
    }

    if (!formData.fechaCompra) {
      toast.error("Seleccione una fecha de compra")
      return
    }

    if (selectedProducts.length === 0) {
      toast.error("Agregue al menos un producto a la compra")
      return
    }

    // Preparar datos para enviar
    const purchaseData = {
      proveedorId: Number.parseInt(formData.proveedorId),
      fechaCompra: formData.fechaCompra,
      descuento: formData.descuento || 0,
      observaciones: formData.observaciones,
      detalles: selectedProducts.map((product) => ({
        productoId: product.id,
        cantidad: product.cantidad,
        precioUnitario: product.precioUnitario,
      })),
    }

    const result = await createPurchase(purchaseData)

    if (result.success) {
      clearForm()
    }
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Compra</h1>
              <p className="text-gray-600">Registre una nueva compra de productos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span>Información de la Compra</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="proveedor" className="text-sm font-medium">
                      Proveedor *
                    </Label>
                    <Select
                      value={formData.proveedorId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, proveedorId: value }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaCompra" className="text-sm font-medium">
                      Fecha de Compra *
                    </Label>
                    <Input
                      id="fechaCompra"
                      type="date"
                      value={formData.fechaCompra}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fechaCompra: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones" className="text-sm font-medium">
                    Observaciones
                  </Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Observaciones adicionales sobre la compra..."
                    value={formData.observaciones}
                    onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Búsqueda de productos */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Search className="h-5 w-5 text-green-600" />
                  <span>Buscar Productos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductSearch onProductSelect={handleProductSelect} selectedProducts={selectedProducts} />
              </CardContent>
            </Card>

            {/* Lista de productos */}
            {selectedProducts.length > 0 && (
              <Card className="shadow-sm border-0 ring-1 ring-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Productos Agregados ({selectedProducts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedProducts.map((product) => (
                      <div key={product.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{product.nombre}</div>
                            <div className="text-sm text-gray-500">
                              {product.codigo} • {product.marca}
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            {/* Control de cantidad */}
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateProductQuantity(product.id, product.cantidad - 1)}
                                disabled={product.cantidad <= 1}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-medium">{product.cantidad}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateProductQuantity(product.id, product.cantidad + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Precio unitario */}
                            <div className="w-32">
                              <PriceInput
                                value={product.precioUnitario}
                                onChange={(value) => updateProductPrice(product.id, value)}
                                className="h-8 text-sm"
                              />
                            </div>

                            {/* Subtotal */}
                            <div className="w-24 text-right">
                              <PriceDisplay
                                value={product.cantidad * product.precioUnitario}
                                className="font-semibold text-green-600"
                              />
                            </div>

                            {/* Botón eliminar */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProduct(product.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel lateral - Resumen */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 ring-1 ring-gray-200 sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Resumen de Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Productos:</span>
                    <span className="font-medium">{selectedProducts.length}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <PriceDisplay value={subtotal} className="font-medium" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descuento" className="text-sm font-medium">
                      Descuento
                    </Label>
                    <PriceInput
                      value={formData.descuento}
                      onChange={(value) => setFormData((prev) => ({ ...prev, descuento: value }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-lg">Total:</span>
                    <PriceDisplay value={total} className="font-bold text-xl text-blue-600" />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleSavePurchase}
                    disabled={loading || selectedProducts.length === 0}
                    className="w-full h-12 text-base font-medium"
                    size="lg"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Guardando...</span>
                      </div>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Guardar Compra
                      </>
                    )}
                  </Button>

                  <Button variant="outline" onClick={clearForm} className="w-full h-10" disabled={loading}>
                    Limpiar Formulario
                  </Button>
                </div>

                {selectedProducts.length === 0 && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      Busque y agregue productos para continuar con la compra.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de cantidad */}
        <QuantityModal
          isOpen={quantityModalOpen}
          onClose={() => setQuantityModalOpen(false)}
          product={selectedProductForModal}
          onConfirm={handleConfirmProduct}
        />
      </div>
    </Layout>
  )
}
