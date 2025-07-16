"use client"

import { Badge } from "../ui/badge"
import { FileText, Calculator } from "lucide-react"

const SaleTypeToggle = ({ saleType, onSaleTypeChange, disabled = false }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Tipo de Operación</h3>
          <p className="text-sm text-gray-600">Seleccione el tipo de documento a generar</p>
        </div>
      </div>

      <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
        <button
          onClick={() => onSaleTypeChange("venta")}
          disabled={disabled}
          className={`px-4 py-2 text-sm font-medium rounded transition-all duration-200 flex items-center space-x-2 ${
            saleType === "venta"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-50"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Venta</span>
          {saleType === "venta" && (
            <Badge variant="secondary" className="bg-white/20 text-white text-xs ml-1">
              Factura
            </Badge>
          )}
        </button>

        <button
          onClick={() => onSaleTypeChange("presupuesto")}
          disabled={disabled}
          className={`px-4 py-2 text-sm font-medium rounded transition-all duration-200 flex items-center space-x-2 ${
            saleType === "presupuesto"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Presupuesto</span>
          {saleType === "presupuesto" && (
            <Badge variant="secondary" className="bg-white/20 text-white text-xs ml-1">
              Sin factura
            </Badge>
          )}
        </button>
      </div>
    </div>
  )
}

export default SaleTypeToggle
