"use client"

import { useState } from "react"
import Layout from "../components/Layout"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Separator } from "../components/ui/separator"
import { Badge } from "../components/ui/badge"
import { Building2, DollarSign, Package, Save, X, Calculator, RefreshCw, AlertTriangle } from "lucide-react"
import { Loading } from "../components/ui/loading"
import { useConfig } from "../hooks/useConfig"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"

const Configuraciones = () => {
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState("empresa")
  const [isRecalculateDialogOpen, setIsRecalculateDialogOpen] = useState(false)
  const [tempConfig, setTempConfig] = useState({})

  const { config, loading, updateConfig, recalculateAllPrices, refreshConfig } = useConfig()

  // Configuración temporal que se actualiza en tiempo real
  const currentConfig = { ...config, ...tempConfig }

  const handleInputChange = (key, value) => {
    setTempConfig((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    // Verificar si hay cambios en configuraciones de precios
    const pricingKeys = ["rentabilidad", "iva", "ingresos_brutos", "otros_impuestos"]
    const pricingConfigChanged = pricingKeys.some((key) => tempConfig.hasOwnProperty(key))

    const result = await updateConfig(tempConfig, false)

    if (result.success) {
      setHasChanges(false)
      setTempConfig({})

      // Solo mostrar el diálogo si hay cambios de precios
      if (pricingConfigChanged) {
        setIsRecalculateDialogOpen(true)
      }
      // No mostrar toast aquí - el hook ya lo maneja
    }
  }

  const handleCancel = () => {
    setHasChanges(false)
    setTempConfig({})
    toast.success("Cambios descartados")
  }

  const handleRecalculateAllPrices = async () => {
    const result = await recalculateAllPrices()
    if (result.success) {
      setIsRecalculateDialogOpen(false)
      // No mostrar toast aquí - el hook ya lo maneja
    }
  }

  const handleRefresh = async () => {
    await refreshConfig()
    setTempConfig({})
    setHasChanges(false)
    // No mostrar toast aquí - el hook ya lo maneja
  }

  if (loading && Object.keys(config).length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <Loading text="Cargando configuración del sistema..." size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-[95rem]">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
                <p className="text-muted-foreground mt-2">
                  Administra los parámetros globales del sistema de ventas y configuraciones empresariales
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={!hasChanges}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!hasChanges || loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </div>
            {hasChanges && (
              <div className="mt-2 -mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">Tienes cambios sin guardar</p>
              </div>
            )}
          </div>

          {/* Configuration Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3">
              <TabsTrigger value="empresa" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Empresa</span>
              </TabsTrigger>
              <TabsTrigger value="precios" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Precios</span>
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Stock</span>
              </TabsTrigger>
            </TabsList>

            {/* Empresa Tab */}
            <TabsContent value="empresa" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Datos Fiscales</CardTitle>
                    <CardDescription>Información legal y tributaria de la empresa</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="empresa-nombre">Razón Social *</Label>
                      <Input
                        id="empresa-nombre"
                        placeholder="Ingrese la razón social"
                        value={currentConfig.empresa_nombre || ""}
                        onChange={(e) => handleInputChange("empresa_nombre", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empresa-cuit">CUIT *</Label>
                      <Input
                        id="empresa-cuit"
                        placeholder="20-12345678-9"
                        value={currentConfig.empresa_cuit || ""}
                        onChange={(e) => handleInputChange("empresa_cuit", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empresa-condicion-iva">Condición frente al IVA *</Label>
                      <Select
                        value={currentConfig.empresa_condicion_iva || ""}
                        onValueChange={(value) => handleInputChange("empresa_condicion_iva", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione condición IVA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RESPONSABLE INSCRIPTO">Responsable Inscripto</SelectItem>
                          <SelectItem value="MONOTRIBUTISTA">Monotributista</SelectItem>
                          <SelectItem value="EXENTO">Exento</SelectItem>
                          <SelectItem value="CONSUMIDOR FINAL">Consumidor Final</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empresa-inicio">Inicio de Actividades</Label>
                      <Input
                        id="empresa-inicio"
                        placeholder="DD/MM/AAAA"
                        value={currentConfig.empresa_inicio_actividades || ""}
                        onChange={(e) => handleInputChange("empresa_inicio_actividades", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                    <CardDescription>Datos de contacto y ubicación</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="empresa-telefono">Teléfono</Label>
                      <Input
                        id="empresa-telefono"
                        placeholder="+54 11 1234-5678"
                        value={currentConfig.empresa_telefono || ""}
                        onChange={(e) => handleInputChange("empresa_telefono", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empresa-email">Email Corporativo</Label>
                      <Input
                        id="empresa-email"
                        type="email"
                        placeholder="contacto@empresa.com"
                        value={currentConfig.empresa_email || ""}
                        onChange={(e) => handleInputChange("empresa_email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empresa-direccion">Domicilio Fiscal</Label>
                      <Input
                        id="empresa-direccion"
                        placeholder="Dirección completa"
                        value={currentConfig.empresa_direccion || ""}
                        onChange={(e) => handleInputChange("empresa_direccion", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Precios Tab */}
            <TabsContent value="precios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Parámetros de Cálculo</CardTitle>
                  <CardDescription>
                    Configuración de márgenes y tributos para el cálculo automático de precios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="rentabilidad">Rentabilidad (%) *</Label>
                      <div className="relative">
                        <Input
                          id="rentabilidad"
                          type="number"
                          placeholder="40"
                          value={currentConfig.rentabilidad || ""}
                          onChange={(e) => handleInputChange("rentabilidad", Number.parseFloat(e.target.value) || 0)}
                          min="0"
                          max="1000"
                          step="0.01"
                        />
                        <Badge className="absolute -top-2 -right-2 bg-green-100 text-green-800 text-xs">
                          Afecta Precios
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Margen de ganancia sobre el costo</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iva">IVA (%) *</Label>
                      <div className="relative">
                        <Input
                          id="iva"
                          type="number"
                          placeholder="21"
                          value={currentConfig.iva || ""}
                          onChange={(e) => handleInputChange("iva", Number.parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        <Badge className="absolute -top-2 -right-2 bg-green-100 text-green-800 text-xs">
                          Afecta Precios
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Impuesto al Valor Agregado</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ingresos-brutos">Ingresos Brutos (%)</Label>
                      <div className="relative">
                        <Input
                          id="ingresos-brutos"
                          type="number"
                          placeholder="0"
                          value={currentConfig.ingresos_brutos || ""}
                          onChange={(e) => handleInputChange("ingresos_brutos", Number.parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        <Badge className="absolute -top-2 -right-2 bg-green-100 text-green-800 text-xs">
                          Afecta Precios
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Impuesto provincial (opcional)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otros-impuestos">Otros Impuestos (%)</Label>
                      <div className="relative">
                        <Input
                          id="otros-impuestos"
                          type="number"
                          placeholder="0"
                          value={currentConfig.otros_impuestos || ""}
                          onChange={(e) => handleInputChange("otros_impuestos", Number.parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                        <Badge className="absolute -top-2 -right-2 bg-green-100 text-green-800 text-xs">
                          Afecta Precios
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Impuestos adicionales (opcional)</p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stock Tab */}
            <TabsContent value="stock" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Control de Inventario</CardTitle>
                  <CardDescription>Configuración para la gestión de stock y alertas de inventario</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="stock-minimo">Stock Mínimo por Defecto</Label>
                      <Input
                        id="stock-minimo"
                        type="number"
                        placeholder="5"
                        value={currentConfig.stock_minimo_default || ""}
                        onChange={(e) =>
                          handleInputChange("stock_minimo_default", Number.parseInt(e.target.value) || 0)
                        }
                        min="0"
                        max="1000"
                      />
                      <p className="text-sm text-muted-foreground">
                        Cantidad mínima que se asignará automáticamente a nuevos productos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Diálogo para recalcular precios */}
          <Dialog open={isRecalculateDialogOpen} onOpenChange={setIsRecalculateDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-green-600" />
                  Recalcular Lista de Precios
                </DialogTitle>
                <DialogDescription>
                  Has modificado parámetros que afectan el cálculo de precios. ¿Deseas aplicar los cambios a todos los
                  productos del sistema?
                </DialogDescription>
              </DialogHeader>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Atención</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Esta operación actualizará los precios de venta de todos los productos según los nuevos parámetros
                  configurados. Esta acción no se puede deshacer.
                </AlertDescription>
              </Alert>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsRecalculateDialogOpen(false)} className="flex-1">
                  No recalcular
                </Button>
                <Button
                  onClick={handleRecalculateAllPrices}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Calculator className="w-4 h-4 mr-2" />
                      Recalcular Precios
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  )
}

export default Configuraciones
