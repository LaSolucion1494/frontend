"use client"

import { useState, useCallback } from "react"
import { productsService } from "../services/productsService"
import toast from "react-hot-toast"

export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sortConfig, setSortConfig] = useState({
    sortBy: "nombre",
    sortOrder: "asc",
    ...initialFilters,
  })

  const fetchProducts = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)
      try {
        const finalFilters = { ...sortConfig, ...customFilters }
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
    [sortConfig],
  )

  const createProduct = async (productData) => {
    setLoading(true)
    try {
      const result = await productsService.createProduct(productData)
      if (result.success) {
        toast.success("Producto creado exitosamente")
        return { success: true, data: result.data }
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
        return { success: true, data: result.data }
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
        // No mostrar toast de error aquí, puede ser un flujo normal (ej: código no existe)
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

  const updateSorting = useCallback((sortBy, sortOrder) => {
    setSortConfig({ sortBy, sortOrder })
  }, [])

  return {
    products,
    loading,
    error,
    sortConfig,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByCode,
    updateSorting,
    refetch: fetchProducts,
  }
}

export default useProducts
