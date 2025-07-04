/**
 * Utilidades para el manejo de fechas y horas
 */

/**
 * Formatea una fecha en formato local (DD/MM/YYYY)
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

    // Extraer día, mes y año directamente de la fecha
    const day = String(date.getUTCDate()).padStart(2, "0")
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const year = date.getUTCFullYear()

    // Formatear como DD/MM/YYYY
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return "Error de formato"
  }
}

/**
 * Formatea una hora en formato de 24 horas (HH:MM)
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

    // Extraer horas y minutos directamente de la fecha
    const hours = String(date.getUTCHours()).padStart(2, "0")
    const minutes = String(date.getUTCMinutes()).padStart(2, "0")

    // Formatear como HH:MM (formato 24 horas)
    return `${hours}:${minutes}`
  } catch (error) {
    console.error("Error al formatear hora:", error)
    return "Error de formato"
  }
}

/**
 * Formatea una fecha y hora completa (DD/MM/YYYY HH:MM)
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
 * Extrae la fecha y hora exactas de un string de fecha de la base de datos
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

    // Extraer componentes directamente
    const day = String(date.getUTCDate()).padStart(2, "0")
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const year = date.getUTCFullYear()
    const hours = String(date.getUTCHours()).padStart(2, "0")
    const minutes = String(date.getUTCMinutes()).padStart(2, "0")

    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`,
    }
  } catch (error) {
    console.error("Error al extraer fecha y hora:", error)
    return { date: "Error", time: "Error" }
  }
}
