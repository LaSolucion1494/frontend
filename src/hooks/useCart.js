// useCart.js
"use client"

import { useState, useCallback } from "react"

export const useCart = () => {
  const [items, setItems] = useState([])
  const [client, setClient] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [paymentType, setPaymentType] = useState('efectivo')
  const [observations, setObservations] = useState('')

  // Agregar un producto al carrito
  const addItem = useCallback((product, quantity = 1) => {
    setItems(prevItems => {
      // Verificar si el producto ya está en el carrito
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id)
      
      if (existingItemIndex >= 0) {
        // Actualizar cantidad si ya existe
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
        return updatedItems
      } else {
        // Agregar nuevo item
        return [...prevItems, {
          id: product.id,
          code: product.codigo,
          name: product.nombre,
          brand: product.marca || '',
          price: product.precio_venta,
          quantity,
          subtotal: product.precio_venta * quantity
        }]
      }
    })
  }, [])

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity, subtotal: item.price * quantity } 
          : item
      )
    )
  }, [])

  // Eliminar un producto del carrito
  const removeItem = useCallback((productId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId))
  }, [])

  // Limpiar el carrito
  const clearCart = useCallback(() => {
    setItems([])
    setClient(null)
    setDiscount(0)
    setPaymentType('efectivo')
    setObservations('')
  }, [])

  // Calcular totales
  const calculateTotals = useCallback(() => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const total = subtotal - discount
    
    return {
      subtotal,
      discount,
      total,
      itemCount: items.length,
      productCount: items.reduce((sum, item) => sum + item.quantity, 0)
    }
  }, [items, discount])

  // Preparar datos para crear una venta
  const prepareSaleData = useCallback(() => {
    const { subtotal, total } = calculateTotals()
    
    return {
      clienteId: client?.id || 1, // 1 es el cliente por defecto (Consumidor Final)
      fechaVenta: new Date().toISOString().split('T')[0],
      tipoPago: paymentType,
      subtotal,
      descuento: discount,
      total,
      observaciones: observations,
      detalles: items.map(item => ({
        productoId: item.id,
        cantidad: item.quantity,
        precioUnitario: item.price
      }))
    }
  }, [items, client, discount, paymentType, observations, calculateTotals])

  return {
    items,
    client,
    discount,
    paymentType,
    observations,
    addItem,
    updateQuantity,
    removeItem,
    setClient,
    setDiscount,
    setPaymentType,
    setObservations,
    clearCart,
    calculateTotals,
    prepareSaleData,
    isEmpty: items.length === 0
  }
}

export default useCart