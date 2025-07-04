"use client"

import { Button } from "../ui/button"
import { X, Trash2, AlertTriangle } from "lucide-react"

const DeleteCategoryModal = ({ isOpen, onClose, onConfirm, category = null, loading = false }) => {
  if (!isOpen || !category) return null

  const handleConfirm = () => {
    onConfirm(category.id, category.nombre)
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-red-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Confirmar Eliminación</h2>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-red-100 hover:text-white hover:bg-red-500"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Warning Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Message */}
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-slate-900">¿Estás seguro de eliminar esta categoría?</h3>
              <p className="text-sm text-slate-600">Se eliminará permanentemente la categoría:</p>
            </div>

            {/* Category Info */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Nombre:</span>
                  <span className="text-sm text-slate-900 font-semibold">{category.nombre}</span>
                </div>

                {category.descripcion && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-slate-700">Descripción:</span>
                    <span className="text-sm text-slate-900 text-right max-w-xs">{category.descripcion}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Advertencia:</p>
                  <p>
                    Esta acción eliminará permanentemente la categoría del sistema. Asegúrate de que no tenga productos
                    asociados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-300 bg-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="border-slate-800 text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Eliminando...
              </div>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Categoría
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteCategoryModal
