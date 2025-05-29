"use client"

import { useOktaAuth } from "./use-okta-auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

export function useApi() {
    const { authenticatedFetch, isAuthenticated, accessToken } = useOktaAuth()

    const apiCall = async (endpoint: string, options: RequestInit = {}) => {
        if (!isAuthenticated) {
            throw new Error("User not authenticated")
        }

        const url = `${API_BASE_URL}${endpoint}`

        try {
            const response = await authenticatedFetch(url, options)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error)
            throw error
        }
    }

    // Métodos de conveniencia
    const get = (endpoint: string) => apiCall(endpoint, { method: "GET" })

    const post = (endpoint: string, data: any) =>
        apiCall(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

    const put = (endpoint: string, data: any) =>
        apiCall(endpoint, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

    const del = (endpoint: string) => apiCall(endpoint, { method: "DELETE" })

    return {
        get,
        post,
        put,
        delete: del,
        apiCall,
        isAuthenticated,
        accessToken,
    }
}
