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
      const response = await apiClient.post('/products/validate-code', {
        code,
        excludeId
      })
      
      return response.data.isUnique
    } catch (error) {
      console.error('Error validating code:', error)
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
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    // Si después de varios intentos no se puede generar, usar timestamp completo
    const timestamp = Date.now().toString()
    return `PRD-${timestamp.slice(-12)}`
  },

  // Generar código de barras visual usando el código del producto
  generateBarcodeImage: (productCode, options = {}) => {
    const canvas = document.createElement("canvas")

    try {
      JsBarcode(canvas, productCode, {
        format: "CODE128",
        width: options.width || 2,
        height: options.height || 100,
        displayValue: options.displayValue !== false,
        fontSize: options.fontSize || 20,
        textMargin: options.textMargin || 0,
        margin: options.margin || 10,
        background: options.background || "#ffffff",
        lineColor: options.lineColor || "#000000",
      })

      return canvas.toDataURL("image/png")
    } catch (error) {
      console.error("Error generating barcode:", error)
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
    
    return patterns.some(pattern => pattern.test(code))
  },

  // Crear PDF para impresión
  generatePrintablePDF: async (products) => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10
    const labelWidth = 60
    const labelHeight = 30
    const cols = Math.floor((pageWidth - 2 * margin) / labelWidth)
    const rows = Math.floor((pageHeight - 2 * margin) / labelHeight)

    let currentPage = 0
    let currentRow = 0
    let currentCol = 0

    products.forEach((product, index) => {
      if (currentRow >= rows) {
        doc.addPage()
        currentPage++
        currentRow = 0
        currentCol = 0
      }

      const x = margin + currentCol * labelWidth
      const y = margin + currentRow * labelHeight

      // Generar código de barras usando el código del producto
      const barcodeImage = barcodeService.generateBarcodeImage(product.codigo, {
        width: 1,
        height: 40,
        fontSize: 8,
        margin: 2,
      })

      if (barcodeImage) {
        // Agregar código de barras
        doc.addImage(barcodeImage, "PNG", x + 2, y + 2, labelWidth - 4, 15)

        // Agregar información del producto
        doc.setFontSize(8)
        doc.text(product.nombre.substring(0, 20), x + 2, y + 22)
        doc.text(`$${product.precioCosto}`, x + 2, y + 27)
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
