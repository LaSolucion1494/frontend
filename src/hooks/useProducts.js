"use client"

import { useState, useEffect, useCallback } from "react"
import { productsService } from "../services/productsService"
import toast from "react-hot-toast"

export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)

  const fetchProducts = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await productsService.getProducts(finalFilters)

        if (result.success) {
          setProducts(result.data)
        } else {
          setError(result.message)
          toast.error(result.message)
        }
      } catch (error) {
        const message = "Error al cargar productos"
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  const createProduct = async (productData) => {
    setLoading(true)
    try {
      const result = await productsService.createProduct(productData)

      if (result.success) {
        toast.success("Producto creado exitosamente")
        await fetchProducts() // Recargar la lista
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al crear producto"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const updateProduct = async (id, productData) => {
    setLoading(true)
    try {
      const result = await productsService.updateProduct(id, productData)

      if (result.success) {
        toast.success("Producto actualizado exitosamente")
        await fetchProducts() // Recargar la lista
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al actualizar producto"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id) => {
    setLoading(true)
    try {
      const result = await productsService.deleteProduct(id)

      if (result.success) {
        toast.success("Producto eliminado exitosamente")
        await fetchProducts() // Recargar la lista
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al eliminar producto"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const getProductByCode = async (code) => {
    setLoading(true)
    try {
      const result = await productsService.getProductByCode(code)

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al buscar producto por código"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    filters,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByCode,
    updateFilters,
    clearFilters,
    refetch: fetchProducts,
  }
}

export default useProducts
