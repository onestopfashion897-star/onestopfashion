import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing MongoDB connection...')
    console.log('MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub')
    
    const client = await clientPromise
    const db = client.db('stylehub')
    
    // Test the connection by listing collections
    const collections = await db.listCollections().toArray()
    
    console.log('Connected to MongoDB successfully')
    console.log('Available collections:', collections.map(c => c.name))
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      collections: collections.map(c => c.name),
      database: 'stylehub'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ 
      success: true, 
      message: 'POST request received',
      data: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to parse request body',
      timestamp: new Date().toISOString()
    }, { status: 400 })
  }
} 