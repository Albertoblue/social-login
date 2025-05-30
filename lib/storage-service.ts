/**
 * Servicio para manejar almacenamiento persistente con múltiples fallbacks
 */
export const StorageService = {
    /**
     * Guarda un valor con múltiples estrategias de persistencia
     */
    setItem: (key: string, value: string): void => {
        try {
            // Intentar sessionStorage primero (preferido para datos de sesión)
            sessionStorage.setItem(key, value)

            // Guardar también en localStorage como fallback
            localStorage.setItem(`temp_${key}`, value)

            // Guardar timestamp para expiración
            localStorage.setItem(`temp_${key}_timestamp`, Date.now().toString())

            // Usar cookies como último recurso (funcionan entre redirecciones)
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=3600; SameSite=Lax`

            console.log(`✅ Valor guardado con éxito: ${key}`)
        } catch (error) {
            console.error(`❌ Error guardando valor: ${key}`, error)
        }
    },

    /**
     * Recupera un valor usando múltiples estrategias
     */
    getItem: (key: string): string | null => {
        try {
            // Intentar sessionStorage primero
            let value = sessionStorage.getItem(key)

            // Si no está en sessionStorage, intentar localStorage
            if (!value) {
                value = localStorage.getItem(`temp_${key}`)

                // Verificar si el valor temporal ha expirado (1 hora)
                const timestamp = localStorage.getItem(`temp_${key}_timestamp`)
                if (timestamp && Date.now() - Number.parseInt(timestamp) > 3600000) {
                    // Expirado, limpiar
                    localStorage.removeItem(`temp_${key}`)
                    localStorage.removeItem(`temp_${key}_timestamp`)
                    value = null
                }
            }

            // Si aún no hay valor, intentar cookies
            if (!value) {
                const cookies = document.cookie.split(";")
                for (const cookie of cookies) {
                    const [cookieName, cookieValue] = cookie.trim().split("=")
                    if (cookieName === key && cookieValue) {
                        value = decodeURIComponent(cookieValue)
                        break
                    }
                }
            }

            return value
        } catch (error) {
            console.error(`❌ Error recuperando valor: ${key}`, error)
            return null
        }
    },

    /**
     * Elimina un valor de todos los almacenamientos
     */
    removeItem: (key: string): void => {
        try {
            // Limpiar de todos los almacenamientos
            sessionStorage.removeItem(key)
            localStorage.removeItem(`temp_${key}`)
            localStorage.removeItem(`temp_${key}_timestamp`)
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        } catch (error) {
            console.error(`❌ Error eliminando valor: ${key}`, error)
        }
    },
}
