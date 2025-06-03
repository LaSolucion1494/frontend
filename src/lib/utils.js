import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date) {
  if (!date) return ""
  return new Date(date).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export function formatDateTime(date) {
  if (!date) return ""
  return new Date(date).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Función para calcular precio de venta
export function calculateSalePrice(costPrice, profitMargin, iva = 21, ingresosBrutos = 0) {
  const basePrice = costPrice * (1 + profitMargin / 100)
  const withIva = basePrice * (1 + iva / 100)
  const finalPrice = withIva * (1 + ingresosBrutos / 100)
  return finalPrice
}

// Función para formatear porcentaje
export function formatPercentage(value) {
  return `${value.toFixed(2)}%`
}

// Función para generar número de factura
export function generateInvoiceNumber() {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, "0")
  const day = now.getDate().toString().padStart(2, "0")
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${year}${month}${day}-${random}`
}

export function formatNumber(number) {
  return new Intl.NumberFormat("es-AR").format(number)
}

export function parseNumber(value) {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ""))
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export function capitalizeFirst(str) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function truncateText(text, maxLength = 50) {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + "..."
}