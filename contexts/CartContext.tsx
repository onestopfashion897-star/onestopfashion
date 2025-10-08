"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { CartItem, CartContextType } from '@/lib/types'
import { useAuth } from './AuthContext'

const CartContext = createContext<CartContextType | undefined>(undefined)

// Default cart context value
const defaultCartContext: CartContextType = {
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getTotal: () => 0,
  getItemCount: () => 0,
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
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
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  // Sync cart with server when user logs in
  useEffect(() => {
    if (user) {
      syncCartWithServer()
    }
  }, [user])

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
          // Always sync with server cart (whether empty or not)
          const serverItems = data.data.items || []
          setItems(serverItems)
        }
      }
    } catch (error) {
      console.error('Error syncing cart with server:', error)
    }
  }



  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        existing => existing.productId === item.productId && 
                   existing.size === item.size &&
                   existing.variantId === item.variantId
      )

      if (existingIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...prevItems]
        updatedItems[existingIndex].quantity += item.quantity
        
        // Ensure quantity doesn't exceed stock
        if (updatedItems[existingIndex].quantity > item.stock) {
          updatedItems[existingIndex].quantity = item.stock
        }
        
        return updatedItems
      } else {
        // Add new item
        return [...prevItems, item]
      }
    })

    // Sync with server if user is logged in
    if (user) {
      syncItemToServer(item)
    }
  }

  const removeItem = (productId: string, size: string, variantId?: string) => {
    setItems(prevItems => 
      prevItems.filter(item => !(item.productId === productId && 
                                 item.size === size &&
                                 item.variantId === variantId))
    )

    // Sync with server if user is logged in
    if (user) {
      removeItemFromServer(productId, size, variantId)
    }
  }

  const updateQuantity = (productId: string, size: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, size, variantId)
      return
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

    // Sync with server if user is logged in
    if (user) {
      updateItemOnServer(productId, size, quantity, variantId)
    }
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('cart')

    // Sync with server if user is logged in
    if (user) {
      clearCartOnServer()
    }
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
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const params = new URLSearchParams({ productId, size })
      if (variantId) {
        params.append('variantId', variantId)
      }

      await fetch(`/api/cart?${params.toString()}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error('Error removing item from server:', error)
    }
  }

  const updateItemOnServer = async (productId: string, size: string, quantity: number, variantId?: string) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      const requestBody: any = { productId, size, quantity }
      if (variantId) {
        requestBody.variantId = variantId
      }

      await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
    } catch (error) {
      console.error('Error updating item on server:', error)
    }
  }

  const clearCartOnServer = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      await fetch('/api/cart/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error('Error clearing cart on server:', error)
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