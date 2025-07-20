"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { X, Printer, Download } from "lucide-react"

const CotizacionPrintModal = ({ isOpen, onClose, cotizacionData, config }) => {
  const [isPrinting, setIsPrinting] = useState(false)

  if (!isOpen || !cotizacionData) return null

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      // Crear una nueva ventana para imprimir
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        throw new Error("No se pudo abrir la ventana de impresión")
      }

      // Generar el HTML para imprimir
      const printHTML = generatePrintHTML()

      printWindow.document.write(printHTML)
      printWindow.document.close()

      // Esperar a que se cargue y luego imprimir
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
    } catch (error) {
      console.error("Error al imprimir:", error)
    } finally {
      setIsPrinting(false)
    }
  }

  const handleDownload = () => {
    const printHTML = generatePrintHTML()
    const blob = new Blob([printHTML], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Cotizacion_${cotizacionData.numero_cotizacion}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generatePrintHTML = () => {
    const empresaDatos = cotizacionData.empresa_datos || {}

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cotización ${cotizacionData.numero_cotizacion}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #333;
                background: white;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
                border-bottom: 2px solid #8B5CF6;
                padding-bottom: 20px;
            }
            
            .company-info {
                flex: 1;
            }
            
            .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #8B5CF6;
                margin-bottom: 5px;
            }
            
            .company-details {
                font-size: 11px;
                color: #666;
                line-height: 1.3;
            }
            
            .cotizacion-info {
                text-align: right;
                background: #F3F4F6;
                padding: 15px;
                border-radius: 8px;
                min-width: 250px;
            }
            
            .cotizacion-title {
                font-size: 18px;
                font-weight: bold;
                color: #8B5CF6;
                margin-bottom: 10px;
            }
            
            .cotizacion-number {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .client-section {
                margin-bottom: 25px;
            }
            
            .section-title {
                font-size: 14px;
                font-weight: bold;
                color: #374151;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid #E5E7EB;
            }
            
            .client-info {
                background: #F9FAFB;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #8B5CF6;
            }
            
            .client-name {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 8px;
            }
            
            .client-details {
                font-size: 11px;
                color: #6B7280;
                line-height: 1.4;
            }
            
            .products-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 25px;
                font-size: 11px;
            }
            
            .products-table th {
                background: #8B5CF6;
                color: white;
                padding: 12px 8px;
                text-align: left;
                font-weight: bold;
                font-size: 11px;
            }
            
            .products-table td {
                padding: 10px 8px;
                border-bottom: 1px solid #E5E7EB;
                vertical-align: top;
            }
            
            .products-table tr:nth-child(even) {
                background: #F9FAFB;
            }
            
            .product-code {
                font-family: 'Courier New', monospace;
                font-size: 10px;
                color: #6B7280;
            }
            
            .product-name {
                font-weight: bold;
                margin-bottom: 2px;
            }
            
            .product-description {
                font-size: 10px;
                color: #6B7280;
                font-style: italic;
            }
            
            .text-right {
                text-align: right;
            }
            
            .text-center {
                text-align: center;
            }
            
            .totals-section {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 25px;
            }
            
            .totals-table {
                width: 300px;
                border-collapse: collapse;
                font-size: 12px;
            }
            
            .totals-table td {
                padding: 8px 12px;
                border-bottom: 1px solid #E5E7EB;
            }
            
            .totals-table .total-row {
                background: #8B5CF6;
                color: white;
                font-weight: bold;
                font-size: 14px;
            }
            
            .conditions-section {
                margin-bottom: 25px;
            }
            
            .conditions-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .condition-item {
                background: #F9FAFB;
                padding: 12px;
                border-radius: 6px;
                border-left: 3px solid #8B5CF6;
            }
            
            .condition-label {
                font-weight: bold;
                font-size: 11px;
                color: #374151;
                margin-bottom: 4px;
            }
            
            .condition-value {
                font-size: 12px;
                color: #6B7280;
            }
            
            .notes-section {
                background: #FEF3C7;
                border: 1px solid #F59E0B;
                border-radius: 6px;
                padding: 15px;
                margin-bottom: 20px;
            }
            
            .notes-title {
                font-weight: bold;
                color: #92400E;
                margin-bottom: 8px;
                font-size: 12px;
            }
            
            .notes-content {
                color: #92400E;
                font-size: 11px;
                line-height: 1.4;
            }
            
            .footer {
                text-align: center;
                font-size: 10px;
                color: #6B7280;
                border-top: 1px solid #E5E7EB;
                padding-top: 15px;
                margin-top: 30px;
            }
            
            .status-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .status-activa {
                background: #DBEAFE;
                color: #1E40AF;
            }
            
            .status-vencida {
                background: #FED7AA;
                color: #9CA3AF;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="company-info">
                    <div class="company-name">${empresaDatos.nombre}</div>
                    <div class="company-details">
                        <div><Building2 size={14} /> ${empresaDatos.direccion}</div>
                        <div><Phone size={14} /> ${empresaDatos.telefono}</div>
                        <div><Mail size={14} /> ${empresaDatos.email}</div>
                    </div>
                </div>
                <div class="cotizacion-info">
                    <div class="cotizacion-title">Cotización</div>
                    <div class="cotizacion-number">${cotizacionData.numero_cotizacion}</div>
                    <div><Calendar size={14} /> ${cotizacionData.fecha}</div>
                    <div><Clock size={14} /> ${cotizacionData.hora}</div>
                    <div class="status-badge ${cotizacionData.estado === "activa" ? "status-activa" : "status-vencida"}">${cotizacionData.estado}</div>
                </div>
            </div>
            <div class="client-section">
                <div class="section-title">Información del Cliente</div>
                <div class="client-info">
                    <div class="client-name">${cotizacionData.cliente.nombre}</div>
                    <div class="client-details">
                        <div><Building2 size={14} /> ${cotizacionData.cliente.direccion}</div>
                        <div><Phone size={14} /> ${cotizacionData.cliente.telefono}</div>
                        <div><Mail size={14} /> ${cotizacionData.cliente.email}</div>
                    </div>
                </div>
            </div>
            <div class="products-section">
                <div class="section-title">Productos</div>
                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cotizacionData.productos
                          .map(
                            (producto) => `
                        <tr>
                            <td class="product-code">${producto.codigo}</td>
                            <td class="product-name">${producto.nombre}</td>
                            <td class="product-description">${producto.descripcion}</td>
                            <td class="text-right">${producto.cantidad}</td>
                            <td class="text-right">${producto.precio_unitario}</td>
                            <td class="text-right">${producto.total}</td>
                        </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
            <div class="totals-section">
                <table class="totals-table">
                    <tbody>
                        <tr>
                            <td>Subtotal</td>
                            <td class="text-right">${cotizacionData.subtotal}</td>
                        </tr>
                        <tr>
                            <td>IVA</td>
                            <td class="text-right">${cotizacionData.iva}</td>
                        </tr>
                        <tr class="total-row">
                            <td>Total</td>
                            <td class="text-right">${cotizacionData.total}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="conditions-section">
                <div class="section-title">Condiciones</div>
                <div class="conditions-grid">
                    ${cotizacionData.condiciones
                      .map(
                        (condicion) => `
                    <div class="condition-item">
                        <div class="condition-label">${condicion.label}</div>
                        <div class="condition-value">${condicion.value}</div>
                    </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
            <div class="notes-section">
                <div class="notes-title">Notas</div>
                <div class="notes-content">${cotizacionData.notas}</div>
            </div>
            <div class="footer">
                <p>Gracias por su preferencia.</p>
            </div>
        </div>
    </body>
    </html>
    `
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold">Imprimir Cotización</div>
          <Button variant="ghost" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <Separator />
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={handlePrint} disabled={isPrinting}>
            <Printer size={16} className="mr-2" />
            Imprimir
          </Button>
          <Button onClick={handleDownload}>
            <Download size={16} className="mr-2" />
            Descargar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CotizacionPrintModal
