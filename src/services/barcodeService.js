import JsBarcode from "jsbarcode"
import { apiClient } from "../config/api"

export const barcodeService = {
  // Generar un código único y profesional para producto
  generateProductCode: () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2) // Últimos 2 dígitos del año
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const day = now.getDate().toString().padStart(2, "0")

    // Generar un número aleatorio de 4 dígitos
    const random = Math.floor(Math.random() * 9999) + 1
    const randomPadded = random.toString().padStart(4, "0")

    // Agregar timestamp en milisegundos para garantizar unicidad
    const timestamp = Date.now().toString().slice(-6) // Últimos 6 dígitos del timestamp

    // Formato: PRD-YYMMDD-XXXX-TTTTTT
    return `PRD-${year}${month}${day}-${randomPadded}-${timestamp}`
  },

  // Generar código alternativo más corto si se prefiere
  generateShortProductCode: () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const day = now.getDate().toString().padStart(2, "0")

    // Usar timestamp para garantizar unicidad
    const timestamp = Date.now().toString().slice(-5) // Últimos 5 dígitos

    // Formato: YYMMDDXXXXX (11 caracteres)
    return `${year}${month}${day}${timestamp}`
  },

  // Generar código con prefijo personalizable
  generateCustomProductCode: (prefix = "PRD") => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const day = now.getDate().toString().padStart(2, "0")

    // Combinar timestamp y random para máxima unicidad
    const timestamp = Date.now().toString().slice(-4)
    const random = Math.floor(Math.random() * 99) + 1
    const randomPadded = random.toString().padStart(2, "0")

    // Formato: PREFIX-YYMMDD-XXXXXX
    return `${prefix}-${year}${month}${day}-${timestamp}${randomPadded}`
  },

  // Validar que el código no existe en la base de datos
  validateUniqueCode: async (code, excludeId = null) => {
    try {
      const response = await apiClient.post("/products/validate-code", {
        code,
        excludeId,
      })

      return response.data.isUnique
    } catch (error) {
      console.error("Error validating code:", error)
      // En caso de error, asumir que no es único para ser conservadores
      return false
    }
  },

  // Generar código único garantizado (con validación en BD)
  generateUniqueProductCode: async (excludeId = null, maxAttempts = 10) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const code = barcodeService.generateProductCode()
      const isUnique = await barcodeService.validateUniqueCode(code, excludeId)

      if (isUnique) {
        return code
      }

      // Esperar un poco antes del siguiente intento para cambiar el timestamp
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    // Si después de varios intentos no se puede generar, usar timestamp completo
    const timestamp = Date.now().toString()
    return `PRD-${timestamp.slice(-12)}`
  },

  // Generar código de barras visual usando el código del producto
  generateBarcodeImage: (productCode, options = {}) => {
    const canvas = document.createElement("canvas")

    try {
      // Configuración optimizada para impresión térmica
      const defaultOptions = {
        format: "CODE128",
        width: options.width || 2,
        height: options.height || 60,
        displayValue: options.displayValue !== false,
        fontSize: options.fontSize || 12,
        textMargin: options.textMargin || 2,
        margin: options.margin || 5,
        background: options.background || "#ffffff",
        lineColor: options.lineColor || "#000000",
        textAlign: "center",
        textPosition: "bottom",
        font: "monospace",
        fontOptions: "bold",
      }

      JsBarcode(canvas, productCode, defaultOptions)

      return canvas.toDataURL("image/png", 1.0) // Máxima calidad para impresión
    } catch (error) {
      console.error("Error generating barcode:", error)
      return null
    }
  },

  // Generar código de barras específicamente optimizado para impresión térmica
  generateThermalBarcodeImage: (productCode, options = {}) => {
    const canvas = document.createElement("canvas")

    try {
      const thermalOptions = {
        format: "CODE128",
        width: 1.5, // Ancho optimizado para papel térmico
        height: 45, // Altura optimizada para papel 44mm
        displayValue: true,
        fontSize: 10,
        textMargin: 2,
        margin: 2,
        background: "#ffffff",
        lineColor: "#000000",
        textAlign: "center",
        textPosition: "bottom",
        font: "monospace",
        fontOptions: "bold",
        ...options,
      }

      JsBarcode(canvas, productCode, thermalOptions)

      return canvas.toDataURL("image/png", 1.0)
    } catch (error) {
      console.error("Error generating thermal barcode:", error)
      return null
    }
  },

  // Validar formato de código
  validateCode: (code) => {
    // Permitir diferentes formatos de código
    const patterns = [
      /^PRD-\d{6}-\d{4}-\d{6}$/, // Formato principal: PRD-YYMMDD-XXXX-TTTTTT
      /^[A-Za-z]{2,5}-\d{6}-\d{6}$/, // Formato con prefijo personalizado
      /^\d{11}$/, // Formato corto: YYMMDDXXXXX
      /^[A-Za-z0-9]{3,25}$/, // Formato general para códigos manuales
    ]

    return patterns.some((pattern) => pattern.test(code))
  },

  // Crear PDF optimizado para impresión térmica
  generateThermalPrintablePDF: async (products) => {
    const { jsPDF } = await import("jspdf")

    // Configurar PDF para papel térmico 55x44mm
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [55, 44],
    })

    products.forEach((product, index) => {
      if (index > 0) {
        doc.addPage()
      }

      // Generar código de barras optimizado para térmica
      const barcodeImage = barcodeService.generateThermalBarcodeImage(product.codigo, {
        width: 1.5,
        height: 20,
        fontSize: 8,
        margin: 1,
      })

      if (barcodeImage) {
        // Centrar el código de barras
        const barcodeWidth = 45
        const barcodeHeight = 12
        const x = (55 - barcodeWidth) / 2
        const y = 8

        // Agregar código de barras
        doc.addImage(barcodeImage, "PNG", x, y, barcodeWidth, barcodeHeight)

        // Agregar nombre del producto (máximo 25 caracteres)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        const productName = product.nombre.substring(0, 25).toUpperCase()
        const textWidth = doc.getTextWidth(productName)
        const textX = (55 - textWidth) / 2
        doc.text(productName, textX, y + barcodeHeight + 5)

        // Agregar código del producto
        doc.setFontSize(6)
        doc.setFont("courier", "normal")
        const codeWidth = doc.getTextWidth(product.codigo)
        const codeX = (55 - codeWidth) / 2
        doc.text(product.codigo, codeX, y + barcodeHeight + 10)

        // Agregar precio si está disponible
        if (product.precio_venta) {
          doc.setFontSize(7)
          doc.setFont("helvetica", "bold")
          const price = `$${product.precio_venta.toLocaleString("es-AR")}`
          const priceWidth = doc.getTextWidth(price)
          const priceX = (55 - priceWidth) / 2
          doc.text(price, priceX, y + barcodeHeight + 15)
        }
      }
    })

    return doc
  },

  // Crear PDF para impresión múltiple en hoja A4
  generateMultipleLabelsPDF: async (products, labelsPerPage = 12) => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10
    const labelWidth = 55 // mm
    const labelHeight = 44 // mm
    const cols = Math.floor((pageWidth - 2 * margin) / labelWidth)
    const rows = Math.floor((pageHeight - 2 * margin) / labelHeight)

    let currentRow = 0
    let currentCol = 0

    products.forEach((product, index) => {
      if (currentRow >= rows) {
        doc.addPage()
        currentRow = 0
        currentCol = 0
      }

      const x = margin + currentCol * labelWidth
      const y = margin + currentRow * labelHeight

      // Generar código de barras
      const barcodeImage = barcodeService.generateThermalBarcodeImage(product.codigo, {
        width: 1.2,
        height: 15,
        fontSize: 6,
        margin: 1,
      })

      if (barcodeImage) {
        // Agregar código de barras
        doc.addImage(barcodeImage, "PNG", x + 5, y + 8, 45, 10)

        // Agregar información del producto
        doc.setFontSize(6)
        doc.setFont("helvetica", "bold")
        const productName = product.nombre.substring(0, 20).toUpperCase()
        doc.text(productName, x + 5, y + 22)

        doc.setFontSize(5)
        doc.setFont("courier", "normal")
        doc.text(product.codigo, x + 5, y + 26)

        if (product.precio_venta) {
          doc.setFontSize(6)
          doc.setFont("helvetica", "bold")
          doc.text(`$${product.precio_venta.toLocaleString("es-AR")}`, x + 5, y + 30)
        }

        // Agregar borde para visualización
        doc.setDrawColor(200, 200, 200)
        doc.rect(x, y, labelWidth, labelHeight)
      }

      currentCol++
      if (currentCol >= cols) {
        currentCol = 0
        currentRow++
      }
    })

    return doc
  },
}

export default barcodeService
