"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Search, Building, UserPlus, Phone, Mail, MapPin, FileText, X } from "lucide-react"
import { useDebounce } from "../../hooks/useDebounce"

const SupplierSelectionModal = ({ isOpen, onClose, onSupplierSelect, proveedores = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSuppliers, setFilteredSuppliers] = useState([])
  const searchRef = useRef(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Filtrar proveedores cuando cambia el término de búsqueda
  useEffect(() => {
    if (!debouncedSearchTerm) {
      setFilteredSuppliers([])
      return
    }

    const normalizedSearch = debouncedSearchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    const filtered = proveedores.filter((proveedor) => {
      const normalizedName = proveedor.nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      const normalizedPhone = proveedor.telefono ? proveedor.telefono.toLowerCase() : ""
      const normalizedCuit = proveedor.cuit ? proveedor.cuit.toLowerCase() : ""

      return (
        normalizedName.includes(normalizedSearch) ||
        normalizedPhone.includes(normalizedSearch) ||
        normalizedCuit.includes(normalizedSearch) ||
        (proveedor.email && proveedor.email.toLowerCase().includes(normalizedSearch))
      )
    })

    setFilteredSuppliers(filtered)
  }, [debouncedSearchTerm, proveedores])

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

  // Calcular saldo disponible
  const calcularSaldoDisponible = (proveedor) => {
    if (!proveedor.tiene_cuenta_corriente) return 0
    if (proveedor.limite_credito === null) return null
    return Math.max(0, proveedor.limite_credito - proveedor.saldo_cuenta_corriente)
  }

  const handleClose = () => {
    setSearchTerm("")
    setFilteredSuppliers([])
    onClose()
  }

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
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(85vh - 140px)" }}>
          <div className="space-y-6">
            {/* Búsqueda */}
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar proveedor por nombre, teléfono, CUIT o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 bg-slate-50 focus:border-slate-800 focus:ring-slate-800/20"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Botones rápidos */}
            <div className="flex gap-3">
              <Button
                onClick={handleSelectSinProveedor}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
                disabled={loading}
              >
                <Building className="h-4 w-4 mr-2" />
                Sin Proveedor Específico
              </Button>
              <Button
                variant="outline"
                className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                disabled={loading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </div>

            {/* Resultados de búsqueda */}
            <div className="border border-slate-200 bg-white rounded-lg shadow-sm min-h-[400px]">
              {loading ? (
                <div className="p-12 text-center text-slate-500">
                  <div className="inline-block h-8 w-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-4"></div>
                  <p className="font-medium">Buscando proveedores...</p>
                </div>
              ) : searchTerm && filteredSuppliers.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredSuppliers.map((proveedor) => (
                    <div
                      key={proveedor.id}
                      className="p-6 hover:bg-slate-50 cursor-pointer transition-colors group"
                      onClick={() => handleSelectSupplier(proveedor)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-slate-900 text-lg group-hover:text-slate-800">
                                {proveedor.nombre}
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

                          {/* Cuenta corriente */}
                          {proveedor.tiene_cuenta_corriente && (
                            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-orange-600" />
                                <span className="text-sm font-medium text-orange-800">Cuenta Corriente Activa</span>
                              </div>
                              <Badge variant="outline" className="bg-white border-orange-300 text-orange-700">
                                Disponible:{" "}
                                {calcularSaldoDisponible(proveedor) === null
                                  ? "Ilimitado"
                                  : formatCurrency(calcularSaldoDisponible(proveedor))}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm && filteredSuppliers.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Building className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="font-medium text-lg mb-2">No se encontraron proveedores</h3>
                  <p className="text-sm text-slate-400">
                    Intente con otros términos de búsqueda o cree un nuevo proveedor
                  </p>
                </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupplierSelectionModal
