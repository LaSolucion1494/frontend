"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Copy, Download, Printer } from "lucide-react"
import { barcodeService } from "../../services/barcodeService"
import toast from "react-hot-toast"

const BarcodeDisplay = ({ code, productName = "", showControls = true, size = "medium", className = "" }) => {
  const [barcodeImage, setBarcodeImage] = useState(null)

  const sizeConfig = {
    small: { width: 1, height: 60, fontSize: 12 },
    medium: { width: 2, height: 80, fontSize: 16 },
    large: { width: 3, height: 100, fontSize: 20 },
  }

  useEffect(() => {
    if (code) {
      try {
        const config = sizeConfig[size]
        const imageData = barcodeService.generateBarcodeImage(code, config)
        setBarcodeImage(imageData)
      } catch (error) {
        console.error("Error generating barcode:", error)
        setBarcodeImage(null)
      }
    }
  }, [code, size])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success("Código copiado al portapapeles")
    } catch (error) {
      toast.error("Error al copiar código")
    }
  }

  const handleDownload = () => {
    if (barcodeImage) {
      const link = document.createElement("a")
      link.download = `barcode-${code}.png`
      link.href = barcodeImage
      link.click()
      toast.success("Código de barras descargado")
    }
  }

  const handlePrint = () => {
    if (barcodeImage) {
      const printWindow = window.open("", "_blank")
      printWindow.document.write(`
        <html>
          <head>
            <title>Código de Barras - ${productName}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif;
                text-align: center;
              }
              .barcode-container {
                display: inline-block;
                border: 1px solid #ccc;
                padding: 20px;
                margin: 10px;
              }
              .product-info {
                margin-top: 10px;
                font-size: 14px;
              }
              @media print {
                body { margin: 0; padding: 10px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              <img src="${barcodeImage}" alt="Código de barras ${code}" />
              <div class="product-info">
                <strong>${productName}</strong><br>
                Código: ${code}
              </div>
            </div>
            <div class="no-print" style="margin-top: 20px;">
              <button onclick="window.print()">Imprimir</button>
              <button onclick="window.close()">Cerrar</button>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
    }
  }

  if (!code) {
    return (
      <Card className={`bg-slate-50 border-dashed ${className}`}>
        <CardContent className="p-6 text-center">
          <p className="text-slate-500">No hay código disponible</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-white ${className}`}>
      <CardContent className="p-4">
        <div className="text-center space-y-3">
          {barcodeImage ? (
            <div className="bg-white p-2 rounded border inline-block">
              <img
                src={barcodeImage || "/placeholder.svg"}
                alt={`Código de barras ${code}`}
                className="max-w-full h-auto"
              />
            </div>
          ) : (
            <div className="bg-slate-100 p-8 rounded border">
              <p className="text-slate-500">Error al generar código de barras</p>
            </div>
          )}

          {productName && <p className="text-sm font-medium text-slate-700">{productName}</p>}

          <p className="text-xs text-slate-500 font-mono">{code}</p>

          {showControls && (
            <div className="flex justify-center space-x-2 pt-2">
              <Button size="sm" variant="outline" onClick={handleCopyCode} className="text-xs">
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload} className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Descargar
              </Button>
              <Button size="sm" variant="outline" onClick={handlePrint} className="text-xs">
                <Printer className="w-3 h-3 mr-1" />
                Imprimir
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default BarcodeDisplay
