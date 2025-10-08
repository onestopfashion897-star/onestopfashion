import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { UserService } from '@/lib/models'

// PUT /api/users/addresses/[id] - Update address
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const userId = (request as any).user.userId
    const addressId = params.id
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

    let updatedAddresses = user.addresses || []
    const addressIndex = updatedAddresses.findIndex(addr => addr.id === addressId)

    if (addressIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      )
    }

    // If this is set as default, make all other addresses non-default
    if (addressData.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }))
    }

    // Update the address
    updatedAddresses[addressIndex] = {
      ...updatedAddresses[addressIndex],
      name: addressData.name,
      phone: addressData.phone,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      isDefault: addressData.isDefault || false,
    }

    // Update user with modified addresses
    await UserService.updateUser(userId, { addresses: updatedAddresses })

    return NextResponse.json({
      success: true,
      data: updatedAddresses[addressIndex],
      message: 'Address updated successfully',
    })
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update address' },
      { status: 500 }
    )
  }
})

// DELETE /api/users/addresses/[id] - Delete address
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const userId = (request as any).user.userId
    const addressId = params.id

    const user = await UserService.findById(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    let updatedAddresses = user.addresses || []
    const addressIndex = updatedAddresses.findIndex(addr => addr.id === addressId)

    if (addressIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      )
    }

    // Check if trying to delete default address
    const addressToDelete = updatedAddresses[addressIndex]
    if (addressToDelete.isDefault && updatedAddresses.length > 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete default address. Please set another address as default first.' },
        { status: 400 }
      )
    }

    // Remove the address
    updatedAddresses.splice(addressIndex, 1)

    // Update user with modified addresses
    await UserService.updateUser(userId, { addresses: updatedAddresses })

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete address' },
      { status: 500 }
    )
  }
})

// PATCH /api/users/addresses/[id]/default - Set address as default
export const PATCH = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const userId = (request as any).user.userId
    const addressId = params.id

    const user = await UserService.findById(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    let updatedAddresses = user.addresses || []
    const addressIndex = updatedAddresses.findIndex(addr => addr.id === addressId)

    if (addressIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      )
    }

    // Make all addresses non-default, then set the selected one as default
    updatedAddresses = updatedAddresses.map((addr, index) => ({
      ...addr,
      isDefault: index === addressIndex,
    }))

    // Update user with modified addresses
    await UserService.updateUser(userId, { addresses: updatedAddresses })

    return NextResponse.json({
      success: true,
      data: updatedAddresses[addressIndex],
      message: 'Default address updated successfully',
    })
  } catch (error) {
    console.error('Error setting default address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set default address' },
      { status: 500 }
    )
  }
})