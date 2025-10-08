"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { WishlistContextType } from '@/lib/types'
import { useAuth } from './AuthContext'

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

// Default wishlist context value
const defaultWishlistContext: WishlistContextType = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  isInWishlist: () => false,
  clearWishlist: () => {},
  getItemCount: () => 0,
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([])
  const { user } = useAuth()

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist))
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error)
        localStorage.removeItem('wishlist')
      }
    }
  }, [])

  // Save wishlist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items))
  }, [items])

  // Sync wishlist with server when user logs in
  useEffect(() => {
    if (user) {
      syncWishlistWithServer()
    }
  }, [user])

  const syncWishlistWithServer = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.length > 0) {
          // Merge server wishlist with local wishlist
          const serverItems = data.data.map((item: any) => item.productId)
          const mergedItems = [...new Set([...items, ...serverItems])]
          setItems(mergedItems)
        }
      }
    } catch (error) {
      console.error('Error syncing wishlist with server:', error)
    }
  }

  const addItem = (productId: string) => {
    setItems(prevItems => {
      if (!prevItems.includes(productId)) {
        return [...prevItems, productId]
      }
      return prevItems
    })

    // Sync with server if user is logged in
    if (user) {
      addItemToServer(productId)
    }
  }

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(id => id !== productId))

    // Sync with server if user is logged in
    if (user) {
      removeItemFromServer(productId)
    }
  }

  const isInWishlist = (productId: string): boolean => {
    return items.includes(productId)
  }

  const clearWishlist = () => {
    setItems([])
    localStorage.removeItem('wishlist')

    // Sync with server if user is logged in
    if (user) {
      clearWishlistOnServer()
    }
  }

  const getItemCount = (): number => {
    return items.length
  }

  // Server sync functions
  const addItemToServer = async (productId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })
    } catch (error) {
      console.error('Error adding item to server wishlist:', error)
    }
  }

  const removeItemFromServer = async (productId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error('Error removing item from server wishlist:', error)
    }
  }

  const clearWishlistOnServer = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      // Remove all items one by one
      for (const productId of items) {
        await fetch(`/api/wishlist?productId=${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.error('Error clearing wishlist on server:', error)
    }
  }

  const value: WishlistContextType = {
    items,
    addItem,
    removeItem,
    isInWishlist,
    clearWishlist,
    getItemCount,
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    console.warn('useWishlist must be used within a WishlistProvider, returning default context')
    return defaultWishlistContext
  }
  return context
} 