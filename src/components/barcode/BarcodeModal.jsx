"use client"
import { Button } from "../ui/button"
import { X, } from "lucide-react"
import BarcodeDisplay from "./BarcodeDisplay"

const BarcodeModal = ({ isOpen, onClose, product }) => {

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative z-[151]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Código de Barras</h2>
            <p className="text-sm text-slate-300 mt-1">
              {product.nombre} - {product.codigo}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <BarcodeDisplay code={product.codigo} productName={product.nombre} showControls={true} size="large" />
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BarcodeModal
