import { MongoClient } from 'mongodb'

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub'
  let dbName = 'stylehub'
  try {
    const u = new URL(uri)
    if (u.pathname && u.pathname !== '/') {
      dbName = u.pathname.replace(/^\//, '')
    }
  } catch {}

  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(dbName)

    const collections = ['admins', 'users', 'categories', 'brands', 'products', 'horizontal_banners'] as const
    const results: Record<string, number> = {}
    for (const name of collections) {
      results[name] = await db.collection(name).countDocuments({})
    }

    console.log('✅ Connected to DB:', db.databaseName)
    for (const [name, count] of Object.entries(results)) {
      console.log(`${name}: ${count}`)
    }
  } catch (err) {
    console.error('❌ Error checking DB:', (err as Error).message)
    process.exitCode = 1
  } finally {
    await client.close()
  }
}

main()