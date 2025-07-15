"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Search, Building, UserPlus, Phone, Mail, MapPin, FileText, X } from "lucide-react"
import { useDebounce } from "../../hooks/useDebounce"
import { useSuppliers } from "../../hooks/useSuppliers" // Importar el hook useSuppliers

const SupplierSelectionModal = ({ isOpen, onClose, onSupplierSelect, selectedSupplier }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([]) // Cambiado de filteredSuppliers
  const [isSearching, setIsSearching] = useState(false) // Nuevo estado para la carga de búsqueda
  const searchRef = useRef(null)
  const [searchError, setSearchError] = useState(null) // Nuevo estado para errores de búsqueda

  const { searchSuppliers } = useSuppliers() // Usar el hook para la búsqueda

  const debouncedSearchTerm = useDebounce(searchTerm, 500) // Ajustado a 500ms

  // Efecto para realizar la búsqueda cuando el término debounced cambia
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setSearchResults([])
        setSearchError(null)
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      setSearchError(null)

      try {
        console.log("Iniciando búsqueda de proveedor para:", debouncedSearchTerm)
        const result = await searchSuppliers(debouncedSearchTerm) // Llamar a la función del hook

        console.log("Resultado de búsqueda de proveedor:", result)

        if (result.success) {
          setSearchResults(result.data || [])
          setSearchError(null)
        } else {
          console.error("Error en búsqueda de proveedor:", result.message)
          setSearchResults([])
          setSearchError(result.message || "Error al buscar proveedores")
        }
      } catch (error) {
        console.error("Error en búsqueda de proveedores (excepción):", error)
        setSearchResults([])
        setSearchError(error.message || "Error al buscar proveedores. Intente nuevamente.")
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearchTerm, searchSuppliers]) // Añadir searchSuppliers a las dependencias

  // Seleccionar proveedor
  const handleSelectSupplier = (proveedor) => {
    onSupplierSelect({
      id: proveedor.id,
      nombre: proveedor.nombre,
      tipo: "proveedor_registrado",
      telefono: proveedor.telefono,
      email: proveedor.email,
      cuit: proveedor.cuit,
      direccion: proveedor.direccion,
      tiene_cuenta_corriente: proveedor.tiene_cuenta_corriente || false,
      saldo_cuenta_corriente: proveedor.saldo_cuenta_corriente || 0,
      limite_credito: proveedor.limite_credito || null,
    })
    handleClose()
  }

  // Seleccionar sin proveedor
  const handleSelectSinProveedor = () => {
    onSupplierSelect({
      id: 1,
      nombre: "Sin Proveedor",
      tipo: "sin_proveedor",
      tiene_cuenta_corriente: false,
    })
    handleClose()
  }

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  // Calcular saldo disponible (asumiendo que los proveedores también pueden tener cuenta corriente)
  const calcularSaldoDisponible = (proveedor) => {
    if (!proveedor.tiene_cuenta_corriente) return 0
    if (proveedor.limite_credito === null) return null
    return Math.max(0, proveedor.limite_credito - proveedor.saldo_cuenta_corriente)
  }

  const handleClose = () => {
    setSearchTerm("")
    setSearchResults([]) // Limpiar resultados al cerrar
    setSearchError(null) // Limpiar errores al cerrar
    setIsSearching(false) // Resetear estado de búsqueda
    onClose()
  }

  // Auto-focus en el input cuando se abre el modal
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => {
        searchRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
      <div className="bg-white shadow-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative z-[101]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <Building className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Seleccionar Proveedor</h2>
              <p className="text-sm text-slate-300 mt-1">Elija un proveedor para la compra</p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            disabled={isSearching} // Deshabilitar si está buscando
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(85vh - 140px)" }}>
          <div className="space-y-6">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                ref={searchRef} // Asignar la ref al input
                type="text"
                placeholder="Buscar proveedor por nombre, teléfono, CUIT o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 bg-slate-50 focus:border-slate-800 focus:ring-slate-800/20"
                disabled={isSearching} // Deshabilitar si está buscando
              />
              {isSearching && ( // Mostrar spinner de carga
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-800"></div>
                </div>
              )}
            </div>

            {/* Información de búsqueda */}
            {searchTerm && searchTerm.length < 2 && (
              <div className="text-center text-slate-500 text-sm">Escriba al menos 2 caracteres para buscar</div>
            )}

            {/* Botones rápidos */}
            <div className="flex gap-3">
              <Button
                onClick={handleSelectSinProveedor}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
                disabled={isSearching} // Deshabilitar si está buscando
              >
                <Building className="h-4 w-4 mr-2" />
                Sin Proveedor Específico
              </Button>
              <Button
                variant="outline"
                className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                disabled={isSearching} // Deshabilitar si está buscando
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </div>

            {/* Resultados de búsqueda */}
            <div className="border border-slate-200 bg-white rounded-lg shadow-sm min-h-[400px]">
              {isSearching ? ( // Mostrar estado de carga
                <div className="p-12 text-center text-slate-500">
                  <div className="inline-block h-8 w-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-4"></div>
                  <p className="font-medium">Buscando proveedores...</p>
                  <p className="text-sm text-slate-400 mt-1">Buscando en toda la base de datos</p>
                </div>
              ) : searchTerm && searchTerm.length >= 2 && searchResults.length > 0 ? ( // Mostrar resultados si hay término y resultados
                <div className="divide-y divide-slate-100">
                  {searchResults.map((proveedor) => (
                    <div
                      key={proveedor.id}
                      className={`p-6 hover:bg-slate-50 cursor-pointer transition-colors group ${
                        selectedSupplier?.id === proveedor.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                      }`}
                      onClick={() => handleSelectSupplier(proveedor)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-slate-900 text-lg group-hover:text-slate-800">
                                {proveedor.nombre}
                                {selectedSupplier?.id === proveedor.id && (
                                  <Badge className="ml-2 bg-blue-100 text-blue-800">Seleccionado</Badge>
                                )}
                              </h4>
                              {proveedor.cuit && (
                                <div className="flex items-center mt-1 text-sm text-slate-600">
                                  <FileText className="w-3 h-3 mr-1.5" />
                                  CUIT: {proveedor.cuit}
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              className="bg-slate-800 hover:bg-slate-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Seleccionar
                            </Button>
                          </div>

                          {/* Información de contacto */}
                          {(proveedor.telefono || proveedor.email) && (
                            <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-slate-600">
                              {proveedor.telefono && (
                                <div className="flex items-center">
                                  <Phone className="w-3 h-3 mr-1.5" />
                                  {proveedor.telefono}
                                </div>
                              )}
                              {proveedor.email && (
                                <div className="flex items-center">
                                  <Mail className="w-3 h-3 mr-1.5" />
                                  {proveedor.email}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Dirección */}
                          {proveedor.direccion && (
                            <div className="flex items-center mb-3 text-sm text-slate-600">
                              <MapPin className="w-3 h-3 mr-1.5" />
                              {proveedor.direccion}
                            </div>
                          )}

                          {/* Cuenta corriente (si aplica) */}
                          {proveedor.tiene_cuenta_corriente ? (
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Cuenta Corriente Activa</span>
                              </div>
                              <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
                                Disponible:{" "}
                                {calcularSaldoDisponible(proveedor) === null
                                  ? "Ilimitado"
                                  : formatCurrency(calcularSaldoDisponible(proveedor))}
                              </Badge>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm && searchTerm.length >= 2 && searchResults.length === 0 && !isSearching ? ( // Mostrar mensaje de no encontrados
                <div className="p-12 text-center text-slate-500">
                  <Building className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="font-medium text-lg mb-2">No se encontraron proveedores</h3>
                  <p className="text-sm text-slate-400 mb-2">No hay proveedores que coincidan con "{searchTerm}"</p>
                  <p className="text-xs text-slate-400">
                    Intente con otros términos de búsqueda o cree un nuevo proveedor
                  </p>
                </div> // Mensaje inicial
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <Search className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="font-medium text-lg mb-2">Busque un proveedor</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Use el campo de búsqueda para encontrar proveedores registrados
                  </p>
                  <p className="text-xs text-slate-400">
                    O seleccione "Sin Proveedor Específico" para una compra rápida
                  </p>
                </div>
              )}
            </div>
            {searchError && <div className="text-red-500 text-center mt-4">{searchError}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupplierSelectionModal
