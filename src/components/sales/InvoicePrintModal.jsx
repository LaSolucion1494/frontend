"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, FileText, X, Eye } from "lucide-react"
import InvoiceTemplate from "./InvoiceTemplate"
import { useReactToPrint } from "react-to-print"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import toast from "react-hot-toast"

const InvoicePrintModal = ({ isOpen, onClose, saleData, config, tipoFactura = "B" }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const invoiceRef = useRef()

  // Obtener el número de factura de manera consistente
  const getInvoiceNumber = () => {
    return saleData?.numero_factura || saleData?.numeroFactura || "SIN-NUMERO"
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  // Función para imprimir
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Factura-${getInvoiceNumber()}`,
    onBeforeGetContent: () => {
      setIsGenerating(true)
      return Promise.resolve()
    },
    onAfterPrint: () => {
      setIsGenerating(false)
      toast.success("Factura enviada a impresora")
    },
    onPrintError: () => {
      setIsGenerating(false)
      toast.error("Error al imprimir la factura")
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
      }
    `,
  })

  // Función para descargar como PDF
  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return

    setIsGenerating(true)
    try {
      // Crear canvas del elemento
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      // Crear PDF
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      // Agregar primera página
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Descargar PDF con el número de factura correcto
      const numeroFactura = getInvoiceNumber()
      const fileName = `Factura-${numeroFactura}.pdf`

      pdf.save(fileName)

      toast.success("Factura descargada exitosamente")
    } catch (error) {
      console.error("Error al generar PDF:", error)
      toast.error("Error al generar el PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isOpen || !saleData) return null

  // Obtener el número de factura para mostrar en la interfaz
  const invoiceNumber = getInvoiceNumber()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden bg-white flex flex-col p-0">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-800 rounded-md">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-800">
                  Factura {tipoFactura} - {invoiceNumber}
                </DialogTitle>
                <p className="text-sm text-slate-600">
                  {saleData.cliente_nombre} • {formatCurrency(saleData.total)}
                </p>
              </div>
            </div>

           
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Controles */}
          <div className="flex-shrink-0 p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
            
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handlePrint}
                  disabled={isGenerating}
                  className="h-8 bg-slate-800 hover:bg-slate-700 text-white"
                  size="sm"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  ) : (
                    <Printer className="w-4 h-4 mr-1" />
                  )}
                  Imprimir
                </Button>

                <Button
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  variant="outline"
                  className="h-8 border-slate-300 text-slate-700 hover:bg-slate-50"
                  size="sm"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin mr-1" />
                  ) : (
                    <Download className="w-4 h-4 mr-1" />
                  )}
                  PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Vista previa de la factura */}
          <div className="flex-1 overflow-auto bg-gray-100 p-4">
            <div className="max-w-4xl mx-auto">
              <InvoiceTemplate ref={invoiceRef} saleData={saleData} config={config} tipoFactura={tipoFactura} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Factura {tipoFactura}</span>
                <span>•</span>
                <span>{invoiceNumber}</span>
                <span>•</span>
                <span>{formatCurrency(saleData.total)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 h-9 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </Button>

              <Button
                onClick={handlePrint}
                disabled={isGenerating}
                className="px-6 h-9 bg-slate-800 hover:bg-slate-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir Factura {invoiceNumber}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InvoicePrintModal
