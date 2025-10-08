import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { UserService } from '@/lib/models'
import { Address } from '@/lib/types'

// GET /api/users/addresses - Get user's addresses
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const userId = (request as any).user.userId
    const user = await UserService.findById(userId)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user.addresses || [],
    })
  } catch (error) {
    console.error('Error fetching user addresses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
})

// POST /api/users/addresses - Add new address
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const userId = (request as any).user.userId
    const addressData = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'phone', 'address', 'city', 'state', 'pincode']
    for (const field of requiredFields) {
      if (!addressData[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    const user = await UserService.findById(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Create new address with unique ID
    const newAddress: Address = {
      id: Date.now().toString(),
      name: addressData.name,
      phone: addressData.phone,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      isDefault: addressData.isDefault || false,
    }

    // If this is set as default, make all other addresses non-default
    let updatedAddresses = user.addresses || []
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }))
    }

    // Add new address
    updatedAddresses.push(newAddress)

    // Update user with new addresses
    await UserService.updateUser(userId, { addresses: updatedAddresses })

    return NextResponse.json({
      success: true,
      data: newAddress,
      message: 'Address added successfully',
    })
  } catch (error) {
    console.error('Error adding address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add address' },
      { status: 500 }
    )
  }
})