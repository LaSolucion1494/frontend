"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Eye,
  Package,
  Filter,
  Download,
  Printer,
  RefreshCw,
  Calendar,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react"

import Layout from "../components/Layout"
import { useSuppliers } from "../hooks/useSuppliers"
import { usePurchases } from "../hooks/usePurchase"
import CompraDetailModal from "@/components/purchases/ComprasDetailsModal"
import ReceiveProductsModal from "@/components/purchases/ReceiveProductsModal"
import StatusUpdateModal from "@/components/purchases/StatusUpdateModal"

// Componente para formatear precios
const PriceDisplay = ({ value, className = "" }) => {
  return (
    <span className={className}>
      {new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
      }).format(value || 0)}
    </span>
  )
}

// Componente de estadísticas
const ComprasStats = ({ purchases }) => {
  const stats = {
    total: purchases.length,
    pendientes: purchases.filter((p) => p.estado === "pendiente").length,
    recibidas: purchases.filter((p) => p.estado === "recibida").length,
    parciales: purchases.filter((p) => p.estado === "parcial").length,
    canceladas: purchases.filter((p) => p.estado === "cancelada").length,
    montoTotal: purchases.reduce((sum, p) => sum + Number.parseFloat(p.total || 0), 0),
    montoMesActual: purchases
      .filter((p) => {
        const fecha = new Date(p.fecha_compra)
        const hoy = new Date()
        return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
      })
      .reduce((sum, p) => sum + Number.parseFloat(p.total || 0), 0),
  }

  const statCards = [
    {
      title: "Total Compras",
      value: stats.total,
      icon: ShoppingCart,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Pendientes",
      value: stats.pendientes,
      icon: Clock,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
    {
      title: "Recibidas",
      value: stats.recibidas,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Monto Total",
      value: <PriceDisplay value={stats.montoTotal} />,
      icon: TrendingUp,
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="shadow-sm border-0 ring-1 ring-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Componente de filtros
const ComprasFilters = ({ filters, onFiltersChange, suppliers, onClearFilters }) => {
  return (
    <Card className="shadow-sm border-0 ring-1 ring-gray-200 mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <span>Filtros</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Proveedor</Label>
            <Select value={filters.proveedor} onValueChange={(value) => onFiltersChange({ proveedor: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los proveedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proveedores</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.nombre}>
                    {supplier.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={filters.estado} onValueChange={(value) => onFiltersChange({ estado: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
                <SelectItem value="recibida">Recibida</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha Desde</Label>
            <Input
              type="date"
              value={filters.fechaInicio}
              onChange={(e) => onFiltersChange({ fechaInicio: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha Hasta</Label>
            <Input
              type="date"
              value={filters.fechaFin}
              onChange={(e) => onFiltersChange({ fechaFin: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <Button variant="outline" onClick={onClearFilters}>
            Limpiar Filtros
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente principal
export default function ReporteCompras() {
  const { suppliers } = useSuppliers()
  const { purchases, loading, fetchPurchases, updatePurchaseStatus, receivePurchaseItems } = usePurchases()

  // Estados para filtros
  const [filters, setFilters] = useState({
    proveedor: "",
    estado: "",
    fechaInicio: "",
    fechaFin: "",
  })

  // Estados para modales
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState(null)

  // Cargar compras al montar y cuando cambien los filtros
  useEffect(() => {
    fetchPurchases(filters)
  }, [filters, fetchPurchases])

  // Manejar cambios en filtros
  const handleFiltersChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      proveedor: "",
      estado: "",
      fechaInicio: "",
      fechaFin: "",
    })
  }

  // Abrir modal de detalle
  const handleViewDetail = (purchase) => {
    setSelectedPurchase(purchase)
    setDetailModalOpen(true)
  }

  // Abrir modal de recepción
  const handleReceiveProducts = (purchase) => {
    setSelectedPurchase(purchase)
    setReceiveModalOpen(true)
  }

  // Abrir modal de cambio de estado
  const handleChangeStatus = (purchase) => {
    setSelectedPurchase(purchase)
    setStatusModalOpen(true)
  }

  // Obtener badge de estado
  const getStatusBadge = (estado) => {
    const statusConfig = {
      pendiente: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
      parcial: { variant: "secondary", icon: AlertTriangle, color: "text-orange-600" },
      recibida: { variant: "secondary", icon: CheckCircle, color: "text-green-600" },
      cancelada: { variant: "secondary", icon: XCircle, color: "text-red-600" },
    }

    const config = statusConfig[estado] || statusConfig.pendiente
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        <span className="capitalize">{estado}</span>
      </Badge>
    )
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reporte de Compras</h1>
              <p className="text-gray-600">Gestione y analice todas las compras realizadas</p>
            </div>
          </div>
          <Button onClick={() => fetchPurchases(filters)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {/* Estadísticas */}
        <ComprasStats purchases={purchases} />

        {/* Filtros */}
        <ComprasFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          suppliers={suppliers}
          onClearFilters={handleClearFilters}
        />

        {/* Tabla de compras */}
        <Card className="shadow-sm border-0 ring-1 ring-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Compras ({purchases.length})</span>
              {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((purchase) => (
                      <TableRow key={purchase.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{purchase.numero_compra}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(purchase.fecha_compra).toLocaleDateString("es-AR")}</span>
                          </div>
                        </TableCell>
                        <TableCell>{purchase.proveedor_nombre}</TableCell>
                        <TableCell>{getStatusBadge(purchase.estado)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{purchase.total_items} items</Badge>
                        </TableCell>
                        <TableCell>
                          <PriceDisplay value={purchase.total} className="font-semibold text-green-600" />
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{purchase.usuario_nombre}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetail(purchase)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {(purchase.estado === "pendiente" || purchase.estado === "parcial") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReceiveProducts(purchase)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay compras</h3>
                <p className="text-gray-500">No se encontraron compras con los filtros aplicados.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modales */}
        <CompraDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          purchase={selectedPurchase}
          onStatusChange={handleChangeStatus}
        />

        <ReceiveProductsModal
          isOpen={receiveModalOpen}
          onClose={() => setReceiveModalOpen(false)}
          purchase={selectedPurchase}
          onReceive={receivePurchaseItems}
        />

        <StatusUpdateModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          purchase={selectedPurchase}
          onUpdate={updatePurchaseStatus}
        />
      </div>
    </Layout>
  )
}
