"use client"

import { useState, useMemo } from "react"
import Layout from "../components/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Settings, Edit, RefreshCw, Building, Percent, DollarSign, Package } from "lucide-react"
import ConfigModal from "../components/config/ConfigModal"
import { Loading } from "../components/ui/loading"
import { useConfig } from "../hooks/useConfig"
import toast from "react-hot-toast"

const Configuraciones = () => {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [selectedConfigs, setSelectedConfigs] = useState([])
  const [editingCategory, setEditingCategory] = useState(null)

  const { config, loading, updateConfig, fetchConfig } = useConfig()

  // Configuraciones organizadas por categorías
  const configCategories = useMemo(() => {
    return [
      {
        id: "empresa",
        title: "Datos de la Empresa",
        icon: Building,
        description: "Información básica de tu negocio",
        color: "bg-blue-500",
        configs: [
          {
            key: "empresa_nombre",
            label: "Nombre de la Empresa",
            value: config.empresa_nombre || "La Solución Repuestos",
            type: "texto",
            description: "Nombre comercial de tu empresa",
          },
          {
            key: "empresa_telefono",
            label: "Teléfono",
            value: config.empresa_telefono || "",
            type: "texto",
            description: "Número de teléfono principal",
          },
          {
            key: "empresa_direccion",
            label: "Dirección",
            value: config.empresa_direccion || "",
            type: "texto",
            description: "Dirección física del negocio",
          },
        ],
      },
      {
        id: "precios",
        title: "Configuración de Precios",
        icon: DollarSign,
        description: "Parámetros para el cálculo de precios de venta",
        color: "bg-green-500",
        configs: [
          {
            key: "rentabilidad",
            label: "Rentabilidad (%)",
            value: config.rentabilidad || 40,
            type: "numero",
            description: "Porcentaje de ganancia sobre el precio de costo",
          },
          {
            key: "iva",
            label: "IVA (%)",
            value: config.iva || 21,
            type: "numero",
            description: "Porcentaje de IVA aplicado",
          },
          {
            key: "ingresos_brutos",
            label: "Ingresos Brutos (%)",
            value: config.ingresos_brutos || 0,
            type: "numero",
            description: "Porcentaje de ingresos brutos",
          },
        ],
      },
      {
        id: "stock",
        title: "Gestión de Stock",
        icon: Package,
        description: "Configuraciones relacionadas con el inventario",
        color: "bg-orange-500",
        configs: [
          {
            key: "stock_minimo_default",
            label: "Stock Mínimo por Defecto",
            value: config.stock_minimo_default || 5,
            type: "numero",
            description: "Cantidad mínima de stock para nuevos productos",
          },
        ],
      },
    ]
  }, [config])

  const handleEditCategory = (category) => {
    setSelectedConfigs(category.configs)
    setEditingCategory(category)
    setIsConfigModalOpen(true)
  }

  const handleSaveConfigs = async (updatedConfigs) => {
    // Convertir a formato esperado por el backend
    const configsToUpdate = updatedConfigs.map((config) => ({
      clave: config.key,
      valor: config.value.toString(),
    }))

    const result = await updateConfig(
      configsToUpdate.reduce((acc, item) => {
        acc[item.clave] = item.valor
        return acc
      }, {}),
    )

    if (result.success) {
      setIsConfigModalOpen(false)
      setEditingCategory(null)
    }
  }

  const handleRefresh = () => {
    fetchConfig()
    toast.success("Configuración actualizada")
  }

  if (loading && Object.keys(config).length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading text="Cargando configuración..." size="lg" />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Ajustes Generales del Sistema</h1>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleRefresh} variant="outline" disabled={loading} className="flex items-center">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Categorías de configuración */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {configCategories.map((category) => {
            const IconComponent = category.icon

            return (
              <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lista de configuraciones */}
                  <div className="space-y-3">
                    {category.configs.map((configItem) => (
                      <div
                        key={configItem.key}
                        className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{configItem.label}</p>
                          <p className="text-sm text-slate-600">{configItem.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            {(configItem.type === "numero" && configItem.key.includes("rentabilidad")) ||
                            configItem.key.includes("iva") ||
                            configItem.key.includes("ingresos")
                              ? `${configItem.value}%`
                              : configItem.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botón de editar */}
                  <div className="pt-2 border-t border-slate-200">
                    <Button
                      onClick={() => handleEditCategory(category)}
                      className="w-full bg-slate-800 hover:bg-slate-700"
                      disabled={loading}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar {category.title}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

       

        {/* Modal de configuración */}
        <ConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => {
            setIsConfigModalOpen(false)
            setEditingCategory(null)
          }}
          onSave={handleSaveConfigs}
          configs={selectedConfigs}
          category={editingCategory}
          loading={loading}
        />
      </div>
    </Layout>
  )
}

export default Configuraciones
