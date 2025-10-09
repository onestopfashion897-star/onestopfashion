"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { CartItem, CartContextType } from '@/lib/types'
import { useAuth } from './AuthContext'

const CartContext = createContext<CartContextType | undefined>(undefined)

// Default cart context value
const defaultCartContext: CartContextType = {
  items: [],
  addItem: () => {},
  removeItem: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  getTotal: () => 0,
  getItemCount: () => 0,
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const { user } = useAuth()

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error)
        localStorage.removeItem('cart')
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  // Sync cart with server when user logs in
  useEffect(() => {
    if (user && isLoaded) {
      syncCartWithServer()
    }
  }, [user, isLoaded])

  const syncCartWithServer = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const serverItems = data.data.items || []
          setItems(serverItems)
          localStorage.setItem('cart', JSON.stringify(serverItems))
        }
      }
    } catch (error) {
      console.error('Error syncing cart with server:', error)
    }
  }



  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        existing => {
          const productMatch = existing.productId === item.productId
          const sizeMatch = existing.size === item.size
          const variantMatch = item.variantId ? existing.variantId === item.variantId : !existing.variantId
          return productMatch && sizeMatch && variantMatch
        }
      )

      if (existingIndex >= 0) {
        const updatedItems = [...prevItems]
        updatedItems[existingIndex].quantity += item.quantity
        
        if (updatedItems[existingIndex].quantity > item.stock) {
          updatedItems[existingIndex].quantity = item.stock
        }
        
        return updatedItems
      } else {
        return [...prevItems, item]
      }
    })

    if (user) {
      syncItemToServer(item)
    }
  }

  const removeItem = async (productId: string, size: string, variantId?: string) => {
    if (user) {
      try {
        await removeItemFromServer(productId, size, variantId)
        await syncCartWithServer()
        return
      } catch (error) {
        console.error('Failed to remove from server:', error)
      }
    }
    
    setItems(prevItems => 
      prevItems.filter(item => !(item.productId === productId && 
                                 item.size === size &&
                                 item.variantId === variantId))
    )
  }

  const updateQuantity = async (productId: string, size: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      await removeItem(productId, size, variantId)
      return
    }

    if (user) {
      try {
        await updateItemOnServer(productId, size, quantity, variantId)
        await syncCartWithServer()
        return
      } catch (error) {
        console.error('Failed to update on server:', error)
      }
    }

    setItems(prevItems => 
      prevItems.map(item => 
        item.productId === productId && 
        item.size === size &&
        item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = async () => {
    if (user) {
      try {
        await clearCartOnServer()
        await syncCartWithServer()
        return
      } catch (error) {
        console.error('Failed to clear on server:', error)
      }
    }
    
    setItems([])
  }

  const getTotal = (): number => {
    return items.reduce((total, item) => {
      const price = item.offerPrice || item.price
      return total + (price * item.quantity)
    }, 0)
  }

  const getItemCount = (): number => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  // Server sync functions
  const syncItemToServer = async (item: CartItem) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      })
    } catch (error) {
      console.error('Error syncing item to server:', error)
    }
  }

  const removeItemFromServer = async (productId: string, size: string, variantId?: string) => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    const params = new URLSearchParams({ productId, size })
    if (variantId) {
      params.append('variantId', variantId)
    }

    const response = await fetch(`/api/cart?${params.toString()}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to remove item from server')
    }
  }

  const updateItemOnServer = async (productId: string, size: string, quantity: number, variantId?: string) => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    const requestBody: any = { productId, size, quantity }
    if (variantId) {
      requestBody.variantId = variantId
    }

    const response = await fetch('/api/cart', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error('Failed to update item on server')
    }
  }

  const clearCartOnServer = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return

    const response = await fetch('/api/cart/clear', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to clear cart on server')
    }
  }

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    console.warn('useCart must be used within a CartProvider, returning default context')
    return defaultCartContext
  }
  return context
}