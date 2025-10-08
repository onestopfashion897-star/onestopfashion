"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

export default function DebugAuthPage() {
  const { user, loading } = useAuth()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check localStorage token
    const storedToken = localStorage.getItem('authToken')
    setToken(storedToken)
    console.log('Debug page: Token from localStorage:', storedToken ? storedToken.substring(0, 20) + '...' : 'null')
    console.log('Debug page: User state:', user)
    console.log('Debug page: Loading state:', loading)
  }, [user, loading])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Loading State:</h2>
          <p>{loading ? 'Loading...' : 'Not loading'}</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">User State:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {user ? JSON.stringify(user, null, 2) : 'No user'}
          </pre>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">LocalStorage Token:</h2>
          <p className="break-all text-sm">
            {token ? `${token.substring(0, 50)}...` : 'No token'}
          </p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Test Actions:</h2>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Refresh Page
          </button>
          <button 
            onClick={async () => {
              const token = localStorage.getItem('authToken')
              if (token) {
                console.log('Manual test: Calling /api/auth/me with token:', token.substring(0, 20) + '...')
                try {
                  const response = await fetch('/api/auth/me', {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  })
                  console.log('Manual test: Response status:', response.status)
                  const data = await response.json()
                  console.log('Manual test: Response data:', data)
                } catch (error) {
                  console.error('Manual test: Error:', error)
                }
              } else {
                console.log('Manual test: No token found')
              }
            }} 
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Test Auth API
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('authToken')
              window.location.reload()
            }} 
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Clear Token & Refresh
          </button>
        </div>
      </div>
    </div>
  )
}