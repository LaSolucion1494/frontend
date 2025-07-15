"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Search, User, UserPlus, Phone, Mail, Building2, CreditCard, X } from "lucide-react"
import { useDebounce } from "../../hooks/useDebounce"
import { useClients } from "../../hooks/useClients"

const ClientSelectionModal = ({ isOpen, onClose, onClientSelect, selectedClient }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef(null)

  // Usar el hook de clientes para la búsqueda
  const { searchClients } = useClients()

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Realizar búsqueda en el backend cuando cambia el término
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      try {
        const result = await searchClients(debouncedSearchTerm)
        if (result.success) {
          setSearchResults(result.data || [])
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error("Error en búsqueda de clientes:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearchTerm, searchClients])

  // Seleccionar cliente
  const handleSelectClient = (cliente) => {
    onClientSelect({
      id: cliente.id,
      nombre: cliente.nombre,
      tipo: "cliente_registrado",
      telefono: cliente.telefono,
      email: cliente.email,
      cuit: cliente.cuit,
      direccion: cliente.direccion,
      tiene_cuenta_corriente: cliente.tiene_cuenta_corriente || false,
      saldo_cuenta_corriente: cliente.saldo_cuenta_corriente || 0,
      limite_credito: cliente.limite_credito || null,
    })
    handleClose()
  }

  // Seleccionar consumidor final
  const handleSelectConsumidorFinal = () => {
    onClientSelect({
      id: 1,
      nombre: "Consumidor Final",
      tipo: "consumidor_final",
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

  // Calcular saldo disponible
  const calcularSaldoDisponible = (cliente) => {
    if (!cliente.tiene_cuenta_corriente) return 0
    if (cliente.limite_credito === null) return null
    return Math.max(0, cliente.limite_credito - cliente.saldo_cuenta_corriente)
  }

  const handleClose = () => {
    setSearchTerm("")
    setSearchResults([])
    setIsSearching(false)
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
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Seleccionar Cliente</h2>
              <p className="text-sm text-slate-300 mt-1">Elija un cliente para la venta</p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            disabled={isSearching}
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
                ref={searchRef}
                type="text"
                placeholder="Buscar cliente por nombre, teléfono, CUIT o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 bg-slate-50 focus:border-slate-800 focus:ring-slate-800/20"
                disabled={isSearching}
              />
              {isSearching && (
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
                onClick={handleSelectConsumidorFinal}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
                disabled={isSearching}
              >
                <User className="h-4 w-4 mr-2" />
                Consumidor Final
              </Button>
              <Button
                variant="outline"
                className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                disabled={isSearching}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </div>

            {/* Resultados de búsqueda */}
            <div className="border border-slate-200 bg-white rounded-lg shadow-sm min-h-[400px]">
              {isSearching ? (
                <div className="p-12 text-center text-slate-500">
                  <div className="inline-block h-8 w-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-4"></div>
                  <p className="font-medium">Buscando clientes...</p>
                  <p className="text-sm text-slate-400 mt-1">Buscando en toda la base de datos</p>
                </div>
              ) : searchTerm && searchTerm.length >= 2 && searchResults.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {searchResults.map((cliente) => (
                    <div
                      key={cliente.id}
                      className={`p-6 hover:bg-slate-50 cursor-pointer transition-colors group ${
                        selectedClient?.id === cliente.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                      }`}
                      onClick={() => handleSelectClient(cliente)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-slate-900 text-lg group-hover:text-slate-800">
                                {cliente.nombre}
                                {selectedClient?.id === cliente.id && (
                                  <Badge className="ml-2 bg-blue-100 text-blue-800">Seleccionado</Badge>
                                )}
                              </h4>
                              {cliente.cuit && (
                                <div className="flex items-center mt-1 text-sm text-slate-600">
                                  <CreditCard className="w-3 h-3 mr-1.5" />
                                  CUIT: {cliente.cuit}
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
                          {(cliente.telefono || cliente.email) && (
                            <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-slate-600">
                              {cliente.telefono && (
                                <div className="flex items-center">
                                  <Phone className="w-3 h-3 mr-1.5" />
                                  {cliente.telefono}
                                </div>
                              )}
                              {cliente.email && (
                                <div className="flex items-center">
                                  <Mail className="w-3 h-3 mr-1.5" />
                                  {cliente.email}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Dirección */}
                          {cliente.direccion && (
                            <div className="flex items-center mb-3 text-sm text-slate-600">
                              <Building2 className="w-3 h-3 mr-1.5" />
                              {cliente.direccion}
                            </div>
                          )}

                          {/* Cuenta corriente */}
                          {cliente.tiene_cuenta_corriente ? (
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center">
                                <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">Cuenta Corriente Activa</span>
                              </div>
                              <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
                                Disponible:{" "}
                                {calcularSaldoDisponible(cliente) === null
                                  ? "Ilimitado"
                                  : formatCurrency(calcularSaldoDisponible(cliente))}
                              </Badge>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm && searchTerm.length >= 2 && searchResults.length === 0 && !isSearching ? (
                <div className="p-12 text-center text-slate-500">
                  <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="font-medium text-lg mb-2">No se encontraron clientes</h3>
                  <p className="text-sm text-slate-400 mb-2">No hay clientes que coincidan con "{searchTerm}"</p>
                  <p className="text-xs text-slate-400">
                    Intente con otros términos de búsqueda o cree un nuevo cliente
                  </p>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <Search className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="font-medium text-lg mb-2">Busque un cliente</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Use el campo de búsqueda para encontrar clientes registrados
                  </p>
                  <p className="text-xs text-slate-400 mb-2">
                    La búsqueda se realiza en toda la base de datos, no solo en la página actual
                  </p>
                  <p className="text-xs text-slate-400">O seleccione "Consumidor Final" para una venta rápida</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientSelectionModal
