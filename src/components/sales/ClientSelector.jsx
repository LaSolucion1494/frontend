"use client"

import { useState, useEffect } from "react"
import { Input } from "../ui/input"
import { Card, CardContent } from "../ui/card"
import { Search, User, Phone, Mail } from "lucide-react"
import { useClients } from "../../hooks/useClients"
import { Loading } from "../ui/loading"

const ClientSelector = ({ onClientSelect }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const { clients, loading, updateFilters } = useClients()

  useEffect(() => {
    updateFilters({
      search: searchTerm,
      activo: "true", // Solo clientes activos
    })
  }, [searchTerm, updateFilters])

  const filteredClients = clients.filter(
    (client) =>
      client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.telefono && client.telefono.includes(searchTerm)) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <Loading text="Cargando clientes..." size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Seleccionar Cliente</h3>

        {/* Búsqueda */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar cliente por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-300"
              onClick={() => onClientSelect(client)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{client.nombre}</h4>

                    {client.telefono && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-slate-600">{client.telefono}</span>
                      </div>
                    )}

                    {client.email && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="text-sm text-slate-600 truncate">{client.email}</span>
                      </div>
                    )}

                    {client.cuit && (
                      <div className="mt-1">
                        <span className="text-xs text-slate-500 font-mono">{client.cuit}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-2">No se encontraron clientes</p>
            <p className="text-sm text-slate-500">
              {searchTerm ? "Intenta con otros términos de búsqueda" : "No hay clientes disponibles"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientSelector
