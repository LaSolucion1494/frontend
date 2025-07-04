// useDebounce.js
import { useState, useEffect } from 'react'

/**
 * Hook personalizado para implementar debounce en valores
 * Útil para optimizar búsquedas y evitar llamadas excesivas a APIs
 * 
 * @param {any} value - El valor que se quiere "debounce"
 * @param {number} delay - El tiempo de retraso en milisegundos (por defecto 500ms)
 * @returns {any} - El valor con debounce aplicado
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Crear un timer que actualice el valor después del delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpiar el timer si el valor cambia antes de que se complete el delay
    // Esto es lo que crea el efecto "debounce"
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook alternativo para debounce con callback
 * Útil cuando necesitas ejecutar una función específica después del debounce
 * 
 * @param {Function} callback - Función a ejecutar después del debounce
 * @param {number} delay - El tiempo de retraso en milisegundos
 * @param {Array} dependencies - Array de dependencias para el useEffect
 */
export const useDebounceCallback = (callback, delay = 500, dependencies = []) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      callback()
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [...dependencies, delay])
}

/**
 * Hook para debounce con estado de loading
 * Útil cuando quieres mostrar un indicador de carga durante el debounce
 * 
 * @param {any} value - El valor que se quiere "debounce"
 * @param {number} delay - El tiempo de retraso en milisegundos
 * @returns {Object} - Objeto con el valor debouncado y estado de loading
 */
export const useDebounceWithLoading = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const [isDebouncing, setIsDebouncing] = useState(false)

  useEffect(() => {
    setIsDebouncing(true)
    
    const timer = setTimeout(() => {
      setDebouncedValue(value)
      setIsDebouncing(false)
    }, delay)

    return () => {
      clearTimeout(timer)
      setIsDebouncing(false)
    }
  }, [value, delay])

  return {
    debouncedValue,
    isDebouncing
  }
}

export default useDebounce