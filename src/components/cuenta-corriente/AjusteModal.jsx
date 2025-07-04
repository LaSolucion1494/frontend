"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { X, Save, FileText, User, Search, AlertCircle, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { clientsService } from "../../services/clientsService"
import { Loading } from "../ui/loading"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

const AjusteModal = ({ isOpen, onClose, onSave, cliente = null, clientes = [] }) => {
  const [formData, setFormData] = useState({
    cliente_id: "",
    tipo: "credito", // credito o debito
    monto: "",
    fecha: new Date().toISOString().split("T")[0],
    concepto: "",
    notas: "",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [clienteData, setClienteData] = useState(null)
  const [clientSearch, setClientSearch] = useState("")
  const [filteredClients, setFilteredClients] = useState([])
  const [loadingClientData, setLoadingClientData] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (cliente) {
        setFormData((prev) => ({
          ...prev,
          cliente_id: cliente.cliente_id || cliente.id,
        }))
        loadClientData(cliente.cliente_id || cliente.id)
        setClientSearch(cliente.cliente_nombre || cliente.nombre || "")
      } else {
        resetForm()
      }
    }
  }, [isOpen, cliente])

  // Filtrar clientes basado en búsqueda
  useEffect(() => {
    if (clientSearch.trim() && !clienteData) {
      const filtered = clientes.filter(
        (client) =>
          client.nombre.toLowerCase().includes(clientSearch.toLowerCase()) ||
          (client.telefono && client.telefono.includes(clientSearch)) ||
          (client.email && client.email.toLowerCase().includes(clientSearch.toLowerCase())),
      )
      setFilteredClients(filtered.filter((c) => c.tiene_cuenta_corriente).slice(0, 10))
    } else {
      setFilteredClients([])
    }
  }, [clientSearch, clientes, clienteData])

  const loadClientData = async (clientId) => {
    setLoadingClientData(true)
    try {
      const clientResult = await clientsService.getById(clientId)
      if (clientResult.success) {
        setClienteData(clientResult.data)
      }
    } catch (error) {
      console.error("Error al cargar datos del cliente:", error)
    } finally {
      setLoadingClientData(false)
    }
  }

  const resetForm = () => {
    setFormData({
      cliente_id: "",
      tipo: "credito",
      monto: "",
      fecha: new Date().toISOString().split("T")[0],
      concepto: "",
      notas: "",
    })
    setErrors({})
    setClienteData(null)
    setClientSearch("")
    setFilteredClients([])
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.cliente_id) {
      newErrors.cliente_id = "Debe seleccionar un cliente"
    }

    if (!formData.monto || Number.parseFloat(formData.monto) <= 0) {
      newErrors.monto = "El monto debe ser mayor a 0"
    }

    if (!formData.fecha) {
      newErrors.fecha = "La fecha es obligatoria"
    }

    if (!formData.concepto) {
      newErrors.concepto = "El concepto es obligatorio"
    }

    // Validaciones específicas por tipo de ajuste
    if (clienteData && formData.tipo === "credito") {
      // Para crédito, validar que no sea mayor al saldo actual
      if (formData.monto && Number.parseFloat(formData.monto) > clienteData.saldo_cuenta_corriente + 0.01) {
        newErrors.monto = `El crédito no puede ser mayor al saldo actual ($${clienteData.saldo_cuenta_corriente.toFixed(2)})`
      }
    }

    if (clienteData && formData.tipo === "debito" && clienteData.limite_credito) {
      // Para débito, validar límite de crédito
      const nuevoSaldo = clienteData.saldo_cuenta_corriente + Number.parseFloat(formData.monto || 0)
      if (nuevoSaldo > clienteData.limite_credito) {
        const disponible = clienteData.limite_credito - clienteData.saldo_cuenta_corriente
        newErrors.monto = `El débito excede el límite de crédito. Disponible: $${disponible.toFixed(2)}`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const ajusteData = {
        cliente_id: Number.parseInt(formData.cliente_id),
        tipo: formData.tipo,
        monto: Number.parseFloat(formData.monto),
        concepto: formData.concepto,
        notas: formData.notas || null,
      }

      const result = await onSave(ajusteData)

      if (result.success) {
        resetForm()
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handleClientSelect = (client) => {
    setFormData((prev) => ({
      ...prev,
      cliente_id: client.id,
    }))
    loadClientData(client.id)
    setClientSearch(client.nombre)
    setFilteredClients([])
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 bg-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Crear Ajuste</h2>
              <p className="text-sm text-blue-100 mt-1">Registra un ajuste manual en la cuenta corriente</p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-blue-100 hover:text-white hover:bg-blue-600"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Selección de cliente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Cliente</h3>

                {!clienteData ? (
                  <div className="space-y-3">
                    <Label htmlFor="cliente_search" className="text-sm font-medium text-slate-700">
                      Buscar cliente
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="cliente_search"
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        placeholder="Nombre, teléfono o email del cliente..."
                        className="pl-10 h-11 border-slate-300"
                        disabled={loading}
                      />
                    </div>

                    {/* Lista de clientes filtrados */}
                    {filteredClients.length > 0 && (
                      <div className="max-h-40 overflow-y-auto border border-slate-200 rounded bg-white">
                        {filteredClients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => handleClientSelect(client)}
                            className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                          >
                            <div className="font-medium text-slate-900">{client.nombre}</div>
                            <div className="text-sm text-slate-600">
                              {client.telefono && <span>Tel: {client.telefono}</span>}
                              {client.email && <span className="ml-2">Email: {client.email}</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {clientSearch && filteredClients.length === 0 && (
                      <div className="text-center py-4 text-slate-600">
                        <User className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p>No se encontraron clientes con cuenta corriente</p>
                      </div>
                    )}

                    {errors.cliente_id && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{errors.cliente_id}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Cliente seleccionado */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900">{clienteData.nombre}</div>
                          <div className="text-sm text-slate-600">
                            {clienteData.telefono && <span>Tel: {clienteData.telefono}</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setClienteData(null)
                          setClientSearch("")
                          setFormData((prev) => ({ ...prev, cliente_id: "" }))
                        }}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50"
                        disabled={loading}
                      >
                        Cambiar
                      </Button>
                    </div>

                    {/* Información de cuenta corriente */}
                    {loadingClientData ? (
                      <div className="flex items-center justify-center py-4">
                        <Loading size="sm" text="Cargando información..." />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded border border-slate-200">
                          <div className="text-xs text-slate-600 mb-1">Saldo Actual</div>
                          <div
                            className={`font-semibold ${
                              (clienteData.saldo_cuenta_corriente || 0) > 0.01 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {formatCurrency(clienteData.saldo_cuenta_corriente)}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-slate-200">
                          <div className="text-xs text-slate-600 mb-1">Límite de Crédito</div>
                          <div className="font-semibold text-slate-900">
                            {clienteData.limite_credito ? formatCurrency(clienteData.limite_credito) : "Sin límite"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Información del ajuste */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Información del Ajuste
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Tipo de Ajuste</Label>
                    <RadioGroup
                      value={formData.tipo}
                      onValueChange={(value) => handleChange("tipo", value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="credito" id="credito" />
                        <Label htmlFor="credito" className="flex items-center space-x-2 cursor-pointer text-green-700">
                          <ArrowDownRight className="w-4 h-4" />
                          <span>Crédito (reduce saldo)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="debito" id="debito" />
                        <Label htmlFor="debito" className="flex items-center space-x-2 cursor-pointer text-red-700">
                          <ArrowUpRight className="w-4 h-4" />
                          <span>Débito (aumenta saldo)</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monto" className="text-sm font-medium text-slate-700">
                        Monto *
                      </Label>
                      <Input
                        id="monto"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formData.monto}
                        onChange={(e) => handleChange("monto", e.target.value)}
                        placeholder="0.00"
                        className={`h-11 ${errors.monto ? "border-red-500" : "border-slate-300"}`}
                        disabled={loading}
                      />
                      {errors.monto && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{errors.monto}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fecha" className="text-sm font-medium text-slate-700">
                        Fecha *
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="fecha"
                          type="date"
                          value={formData.fecha}
                          onChange={(e) => handleChange("fecha", e.target.value)}
                          className={`pl-10 h-11 ${errors.fecha ? "border-red-500" : "border-slate-300"}`}
                          disabled={loading}
                        />
                      </div>
                      {errors.fecha && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{errors.fecha}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concepto" className="text-sm font-medium text-slate-700">
                      Concepto *
                    </Label>
                    <Input
                      id="concepto"
                      value={formData.concepto}
                      onChange={(e) => handleChange("concepto", e.target.value)}
                      placeholder="Motivo del ajuste"
                      className={`h-11 ${errors.concepto ? "border-red-500" : "border-slate-300"}`}
                      disabled={loading}
                    />
                    {errors.concepto && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{errors.concepto}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notas" className="text-sm font-medium text-slate-700">
                      Notas (opcional)
                    </Label>
                    <Textarea
                      id="notas"
                      value={formData.notas}
                      onChange={(e) => handleChange("notas", e.target.value)}
                      placeholder="Notas adicionales sobre el ajuste..."
                      rows={3}
                      className="border-slate-300 resize-none"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registrando...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Crear Ajuste
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AjusteModal
