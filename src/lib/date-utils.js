/**
 * Utilidades para el manejo de fechas y horas - VERSIÓN CORREGIDA CON TIEMPO LOCAL
 */

/**
 * Formatea una fecha en formato local (DD/MM/YYYY) usando tiempo local
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return ""

  try {
    // Crear una fecha a partir del string
    const date = new Date(dateString)

    // Verificar que sea una fecha válida
    if (isNaN(date.getTime())) return "Fecha inválida"

    // Usar métodos locales en lugar de UTC
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()

    // Formatear como DD/MM/YYYY
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return "Error de formato"
  }
}

/**
 * Formatea una hora en formato de 24 horas (HH:MM) usando tiempo local
 * @param {string|Date} dateString - Fecha/hora a formatear
 * @returns {string} Hora formateada
 */
export const formatTime = (dateString) => {
  if (!dateString) return ""

  try {
    // Crear una fecha a partir del string
    const date = new Date(dateString)

    // Verificar que sea una fecha válida
    if (isNaN(date.getTime())) return "Hora inválida"

    // Usar métodos locales en lugar de UTC
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    // Formatear como HH:MM (formato 24 horas)
    return `${hours}:${minutes}`
  } catch (error) {
    console.error("Error al formatear hora:", error)
    return "Error de formato"
  }
}

/**
 * Formatea una fecha y hora completa (DD/MM/YYYY HH:MM) usando tiempo local
 * @param {string|Date} dateString - Fecha/hora a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return ""
  return `${formatDate(dateString)} ${formatTime(dateString)}`
}

/**
 * Formatea una fecha de creación en formato local (DD/MM/YYYY)
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatCreationDate = (dateString) => {
  return formatDate(dateString)
}

/**
 * Formatea una hora de creación en formato de 24 horas (HH:MM)
 * @param {string|Date} dateString - Fecha/hora a formatear
 * @returns {string} Hora formateada
 */
export const formatCreationTime = (dateString) => {
  return formatTime(dateString)
}

/**
 * Formatea una fecha y hora de creación completa (DD/MM/YYYY HH:MM)
 * @param {string|Date} dateString - Fecha/hora a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatCreationDateTime = (dateString) => {
  return formatDateTime(dateString)
}

/**
 * Extrae la fecha y hora exactas de un string de fecha de la base de datos usando tiempo local
 * @param {string} dbDateString - Fecha de la base de datos
 * @returns {Object} Objeto con la fecha y hora extraídas
 */
export const extractExactDateTime = (dbDateString) => {
  if (!dbDateString) return { date: "", time: "" }

  try {
    // Crear una fecha a partir del string
    const date = new Date(dbDateString)

    // Verificar que sea una fecha válida
    if (isNaN(date.getTime())) return { date: "Fecha inválida", time: "Hora inválida" }

    // Usar métodos locales en lugar de UTC
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`,
    }
  } catch (error) {
    console.error("Error al extraer fecha y hora:", error)
    return { date: "Error", time: "Error" }
  }
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para inputs de fecha
 * @returns {string} Fecha actual en formato YYYY-MM-DD
 */
export const getCurrentDateString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Obtiene una fecha X días atrás en formato YYYY-MM-DD
 * @param {number} days - Número de días hacia atrás
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const getDateDaysAgo = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Convierte una fecha local a formato ISO para enviar al backend
 * @param {string} localDateString - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha en formato ISO
 */
export const localDateToISO = (localDateString) => {
  if (!localDateString) return ""

  try {
    // Crear fecha local (sin conversión de zona horaria)
    const [year, month, day] = localDateString.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
    return date.toISOString().split("T")[0]
  } catch (error) {
    console.error("Error al convertir fecha local a ISO:", error)
    return localDateString
  }
}
