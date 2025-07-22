"use client"
import { Button } from "../ui/button"
import { X, Download, FileText } from "lucide-react"
import BarcodeDisplay from "./BarcodeDisplay"
import { barcodeService } from "../../services/barcodeService"
import toast from "react-hot-toast"

const BarcodeModal = ({ isOpen, onClose, product }) => {
  const handleDownloadThermalPDF = async () => {
    try {
      if (!product) return

      const pdf = await barcodeService.generateThermalPrintablePDF([product])
      const pdfBlob = pdf.output("blob")
      const url = URL.createObjectURL(pdfBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `etiqueta-termica-${product.codigo}.pdf`
      link.click()

      URL.revokeObjectURL(url)
      toast.success("PDF térmico descargado correctamente")
    } catch (error) {
      console.error("Error generating thermal PDF:", error)
      toast.error("Error al generar PDF térmico")
    }
  }

  const handleDownloadMultiplePDF = async () => {
    try {
      if (!product) return

      // Crear múltiples copias del mismo producto para impresión en lote
      const multipleProducts = Array(6).fill(product) // 6 etiquetas del mismo producto

      const pdf = await barcodeService.generateMultipleLabelsPDF(multipleProducts)
      const pdfBlob = pdf.output("blob")
      const url = URL.createObjectURL(pdfBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `etiquetas-multiples-${product.codigo}.pdf`
      link.click()

      URL.revokeObjectURL(url)
      toast.success("PDF múltiple descargado correctamente")
    } catch (error) {
      console.error("Error generating multiple PDF:", error)
      toast.error("Error al generar PDF múltiple")
    }
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative z-[151]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Código de Barras - Impresión Térmica</h2>
            <p className="text-sm text-slate-300 mt-1">
              {product.nombre} - {product.codigo}
            </p>
            <p className="text-xs text-slate-400 mt-1">Optimizado para papel térmico 55mm x 44mm</p>
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
          {/* Vista previa del código de barras */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Vista Previa - Tamaño Térmico</h3>
            <BarcodeDisplay
              code={product.codigo}
              productName={product.nombre}
              showControls={true}
              size="thermal"
              className="max-w-sm mx-auto"
            />
          </div>

          {/* Información del producto */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-600">Producto:</span>
              <p className="text-slate-800">{product.nombre}</p>
            </div>
            <div>
              <span className="font-medium text-slate-600">Código:</span>
              <p className="font-mono text-slate-800">{product.codigo}</p>
            </div>
            {product.precio_venta && (
              <div>
                <span className="font-medium text-slate-600">Precio:</span>
                <p className="text-slate-800">${product.precio_venta.toLocaleString("es-AR")}</p>
              </div>
            )}
            {product.categoria_nombre && (
              <div>
                <span className="font-medium text-slate-600">Categoría:</span>
                <p className="text-slate-800">{product.categoria_nombre}</p>
              </div>
            )}
          </div>

          {/* Opciones de descarga PDF */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-3">Opciones de Impresión PDF</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleDownloadThermalPDF}
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-100 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF Térmico Individual
              </Button>
              <Button
                onClick={handleDownloadMultiplePDF}
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-100 bg-transparent"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF Múltiple (6 etiquetas)
              </Button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 El PDF térmico está optimizado para impresoras térmicas de 55mm x 44mm
            </p>
          </div>
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
