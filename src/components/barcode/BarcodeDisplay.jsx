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
    small: { width: 1, height: 40, fontSize: 10 },
    medium: { width: 2, height: 60, fontSize: 14 },
    large: { width: 2, height: 80, fontSize: 16 },
    thermal: { width: 5, height: 45, fontSize: 22, textMargin: 6, margin: 1 }, // OPTIMIZADO para térmica
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
      // Generar código de barras optimizado para impresión térmica - MEJORADO
      const thermalBarcodeImage = barcodeService.generateBarcodeImage(code, {
        width: 5, // Aumentado de 4 a 5 para barras MÁS GRUESAS
        height: 45, // Reducido de 60 a 45 para ser más compacto
        fontSize: 22, // Ajustado de 26 a 22 para balance
        margin: 1, // Reducido de 3 a 1 para maximizar espacio
        textMargin: 6, // Reducido de 10 a 6
        displayValue: true,
        background: "#ffffff",
        lineColor: "#000000",
      })

      const printWindow = window.open("", "_blank")
      printWindow.document.write(`
      <html>
        <head>
          <title>Código de Barras - ${code}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              font-family: 'Courier New', monospace;
              background: white;
            }
            
            .thermal-label {
              width: 55mm;
              height: 44mm;
              padding: 2mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              border: none;
              background: white;
              page-break-after: always;
            }
            
            .barcode-container {
              width: 100%;
              max-width: 50mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            
            .barcode-image {
              width: 100%;
              height: auto;
              max-height: 32mm; /* Aumentado de 30mm a 32mm para el código más grande */
              object-fit: contain;
            }
            
            .product-code {
              font-size: 16px; /* Reducido de 18px a 16px para balance */
              font-family: 'Courier New', monospace;
              font-weight: bold;
              margin-top: 2mm; /* Reducido de 3mm a 2mm */
              letter-spacing: 1.2px; /* Reducido de 1.5px a 1.2px */
              line-height: 1.1;
            }
            
            .no-print { 
              display: none; 
            }
            
            @page {
              size: 55mm 44mm;
              margin: 0;
              padding: 0;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
                background: white !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              
              .thermal-label {
                width: 55mm;
                height: 44mm;
                padding: 2mm;
                margin: 0;
                border: none;
                box-shadow: none;
                background: white !important;
              }
              
              .product-code {
                font-size: 16px !important; /* Forzar tamaño en impresión */
                font-weight: bold !important;
                letter-spacing: 1.2px !important;
              }
              
              .no-print { 
                display: none !important; 
              }
              
              .barcode-image {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
            }
            
            /* Estilos para vista previa */
            @media screen {
              body {
                padding: 10mm;
                background: #f0f0f0;
              }
              
              .thermal-label {
                border: 1px dashed #ccc;
                background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin-bottom: 10mm;
              }
              
              .no-print {
                display: block;
                margin-top: 10mm;
                text-align: center;
              }
              
              .print-button {
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                margin: 0 5px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              }
              
              .print-button:hover {
                background: #0056b3;
              }
              
              .close-button {
                background: #6c757d;
                color: white;
                border: none;
                padding: 8px 16px;
                margin: 0 5px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              }
              
              .close-button:hover {
                background: #545b62;
              }
            }
          </style>
        </head>
        <body>
          <div class="thermal-label">
            <div class="barcode-container">
              <img src="${thermalBarcodeImage}" alt="Código de barras ${code}" class="barcode-image" />
              <div class="product-code">${code}</div>
            </div>
          </div>
          
          <div class="no-print">
            <button onclick="window.print()" class="print-button">🖨️ Imprimir</button>
            <button onclick="window.close()" class="close-button">❌ Cerrar</button>
            <div style="margin-top: 10px; font-size: 11px; color: #666;">
              Tamaño: 55mm x 44mm | Impresora Térmica | Texto Optimizado
            </div>
          </div>
        </body>
      </html>
    `)
      printWindow.document.close()
      printWindow.focus()

      // Auto-imprimir después de un breve delay para asegurar que la página se cargue
      setTimeout(() => {
        printWindow.print()
      }, 500)
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
              <Button size="sm" variant="outline" onClick={handleCopyCode} className="text-xs bg-transparent">
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload} className="text-xs bg-transparent">
                <Download className="w-3 h-3 mr-1" />
                Descargar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrint}
                className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Printer className="w-3 h-3 mr-1" />
                Imprimir Térmico
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default BarcodeDisplay
