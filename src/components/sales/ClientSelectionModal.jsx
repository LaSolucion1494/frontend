"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, User, UserPlus, CreditCard, Phone, Mail, Building2 } from "lucide-react"
import { useDebounce } from "../../hooks/useDebounce"

const ClientSelectionModal = ({
    isOpen,
    onClose,
    onClientSelect,
    clientes = [],
    loading = false,
}) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredClients, setFilteredClients] = useState([])
    const searchRef = useRef(null)

    const debouncedSearchTerm = useDebounce(searchTerm, 300)

    // Filtrar clientes cuando cambia el término de búsqueda
    useEffect(() => {
        if (!debouncedSearchTerm) {
            setFilteredClients([])
            return
        }

        const normalizedSearch = debouncedSearchTerm
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")

        const filtered = clientes.filter((cliente) => {
            const normalizedName = cliente.nombre
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            const normalizedPhone = cliente.telefono ? cliente.telefono.toLowerCase() : ""

            return (
                normalizedName.includes(normalizedSearch) ||
                normalizedPhone.includes(normalizedSearch) ||
                (cliente.email && cliente.email.toLowerCase().includes(normalizedSearch))
            )
        })

        setFilteredClients(filtered)
    }, [debouncedSearchTerm, clientes])

    // Seleccionar cliente
    const handleSelectClient = (cliente) => {
        onClientSelect({
            id: cliente.id,
            nombre: cliente.nombre,
            tipo: "cliente_registrado",
            telefono: cliente.telefono,
            email: cliente.email,
            tiene_cuenta_corriente: cliente.tiene_cuenta_corriente || false,
            saldo_cuenta_corriente: cliente.saldo_cuenta_corriente || 0,
            limite_credito: cliente.limite_credito || null,
        })
        onClose()
    }

    // Seleccionar consumidor final
    const handleSelectConsumidorFinal = () => {
        onClientSelect({
            id: 1,
            nombre: "Consumidor Final",
            tipo: "consumidor_final",
            tiene_cuenta_corriente: false,
        })
        onClose()
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-xl">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Seleccionar Cliente
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Búsqueda */}
                    <div className="relative" ref={searchRef}>
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Buscar cliente por nombre, teléfono o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-gray-400 bg-slate-100"
                            disabled={loading}
                        />
                    </div>

                    {/* Botones rápidos */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleSelectConsumidorFinal}
                            className="flex-1 bg-slate-800 text-gray-100 hover:bg-slate-900 hover:text-white border border-slate-800"
                            variant="outline"
                        >
                            <User className="h-4 w-4 mr-2" />
                            Consumidor Final
                        </Button>
                        <Button variant="outline" className="bg-slate-800 text-gray-100 hover:bg-slate-900 hover:text-white border border-slate-800">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Nuevo Cliente
                        </Button>
                    </div>

                    {/* Resultados de búsqueda */}
                    <div className="max-h-96 overflow-y-auto border border-gray-400 bg-slate-100 rounded-lg">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="inline-block h-6 w-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                Buscando clientes...
                            </div>
                        ) : searchTerm && filteredClients.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {filteredClients.map((cliente) => (
                                    <div
                                        key={cliente.id}
                                        onClick={() => handleSelectClient(cliente)}
                                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{cliente.nombre}</h4>
                                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                                    {cliente.telefono && (
                                                        <div className="flex items-center">
                                                            <Phone className="w-3 h-3 mr-1" />
                                                            {cliente.telefono}
                                                        </div>
                                                    )}
                                                    {cliente.email && (
                                                        <div className="flex items-center">
                                                            <Mail className="w-3 h-3 mr-1" />
                                                            {cliente.email}
                                                        </div>
                                                    )}
                                                </div>
                                                {cliente.tiene_cuenta_corriente ? (
                                                    <div className="flex items-center mt-2">
                                                        <Building2 className="w-3 h-3 mr-1 text-orange-600" />
                                                        <span className="text-xs text-orange-700 font-medium">Cuenta Corriente</span>
                                                        <Badge variant="outline" className="ml-2 text-xs">
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
                        ) : searchTerm && filteredClients.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No se encontraron clientes</p>
                                <p className="text-sm text-gray-400 mt-1">Intente con otros términos de búsqueda</p>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Busque un cliente para comenzar</p>
                                <p className="text-sm text-gray-400 mt-1">O seleccione "Consumidor Final"</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ClientSelectionModal
