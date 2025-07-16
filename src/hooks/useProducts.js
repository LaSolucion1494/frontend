"use client"

import { useState, useCallback, useEffect } from "react"
import { productsService } from "../services/productsService"
import toast from "react-hot-toast"

export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    categoria: "",
    stockStatus: "todos",
    activo: "true",
    minPrice: "",
    maxPrice: "",
    sortBy: "nombre",
    sortOrder: "asc",
    limit: 10,
    offset: 0,
    ...initialFilters,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })

  // Mantener compatibilidad con sortConfig
  const sortConfig = {
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  }

  const fetchProducts = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)
      try {
        const finalFilters = { ...filters, ...customFilters }
        console.log("Fetching products with filters:", finalFilters)
        const result = await productsService.getProducts(finalFilters)

        if (result.success) {
          console.log("Products loaded:", result.data.length)
          setProducts(result.data)
          if (result.pagination) {
            setPagination(result.pagination)
          }
          return { success: true, data: result.data }
        } else {
          console.error("Error from productsService:", result.message)
          setError(result.message)
          setProducts([])
          toast.error(result.message)
          return { success: false, message: result.message }
        }
      } catch (error) {
        console.error("Error in fetchProducts:", error)
        const message = "Error al cargar productos"
        setError(message)
        setProducts([])
        toast.error(message)
        return { success: false, message }
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  // NUEVA FUNCIÓN: Búsqueda específica para modales (similar a searchClients)
  const searchProducts = useCallback(async (term) => {
    if (!term || term.length < 2) {
      return { success: true, data: [] }
    }

    try {
      console.log("useProducts.searchProducts - Buscando:", term)
      const result = await productsService.search(term)

      console.log("useProducts.searchProducts - Resultado:", result)

      if (result.success) {
        const formattedResults = result.data.map((product) => ({
          ...product,
          stock: product.stock || 0,
          precio_venta: product.precio_venta || 0,
        }))
        return { success: true, data: formattedResults }
      } else {
        console.error("useProducts.searchProducts - Error:", result.message)
        return { success: false, message: result.message, data: [] }
      }
    } catch (error) {
      console.error("useProducts.searchProducts - Excepción:", error)

      let errorMessage = "Error al buscar productos"

      if (error.message?.includes("Network Error") || error.code === "ERR_NETWORK") {
        errorMessage = "Error de conexión. Verifique su conexión a internet."
      } else if (error.response?.status === 404) {
        errorMessage = "Servicio de búsqueda no disponible."
      } else if (error.response?.status >= 500) {
        errorMessage = "Error del servidor. Intente nuevamente."
      }

      return { success: false, message: errorMessage, data: [] }
    }
  }, [])

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const handlePageChange = useCallback(
    (page) => {
      const newOffset = (page - 1) * filters.limit
      updateFilters({ offset: newOffset })
    },
    [filters.limit, updateFilters],
  )

  useEffect(() => {
    fetchProducts()
  }, [filters, fetchProducts])

  const createProduct = async (productData) => {
    setLoading(true)
    try {
      const result = await productsService.createProduct(productData)
      if (result.success) {
        toast.success("Producto creado exitosamente")
        // Refrescar productos después de crear
        await fetchProducts({ offset: 0 })
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
        // Refrescar productos después de actualizar
        await fetchProducts({ offset: 0 })
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
        // Refrescar productos después de eliminar
        await fetchProducts({ offset: 0 })
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

  // Función de búsqueda avanzada (mantener compatibilidad)
  const searchProductsAdvanced = async (searchFilters = {}) => {
    try {
      const result = await productsService.searchProducts(searchFilters)
      if (result.success) {
        return { success: true, data: result.data, searchTerm: result.searchTerm, totalResults: result.totalResults }
      } else {
        return { success: false, message: result.message, data: [] }
      }
    } catch (error) {
      const message = "Error en la búsqueda de productos"
      console.error("Search products error:", error)
      return { success: false, message, data: [] }
    }
  }

  // Mantener compatibilidad con funciones existentes
  const updateSorting = useCallback(
    (sortBy, sortOrder) => {
      updateFilters({ sortBy, sortOrder, offset: 0 })
    },
    [updateFilters],
  )

  const resetSorting = useCallback(() => {
    updateFilters({ sortBy: "nombre", sortOrder: "asc", offset: 0 })
  }, [updateFilters])

  return {
    products,
    loading,
    error,
    pagination,
    sortConfig, // Mantener compatibilidad
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByCode,
    searchProducts, // NUEVA función para modales
    searchProductsAdvanced, // Función avanzada (renombrada para claridad)
    updateSorting, // Mantener compatibilidad
    resetSorting, // Mantener compatibilidad
    updateFilters,
    handlePageChange,
    refetch: fetchProducts,
  }
}

export default useProducts
