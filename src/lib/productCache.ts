import { getProducts, getProductVersion } from '@/app/actions'

export interface CachedProduct {
  id: number
  name: string
  default_rate: number
  active: boolean
}

interface CacheData {
  version: number
  products: CachedProduct[]
  cached_at: number
}

const CACHE_KEY = 'billing_product_cache'

export async function getProductsCached(): Promise<CachedProduct[]> {
  try {
    // 1. Read local cache
    const cachedRaw = localStorage.getItem(CACHE_KEY)
    const cacheData: CacheData | null = cachedRaw ? JSON.parse(cachedRaw) : null

    // 2. Fetch server version
    let serverVersion: number
    try {
      serverVersion = await getProductVersion()
    } catch (networkError) {
      console.warn("Network error checking product version. Using local cache if available.")
      if (cacheData && cacheData.products) {
        return cacheData.products
      }
      throw new Error("Network error and no local cache available.")
    }

    // 3. Compare versions
    if (cacheData && cacheData.version === serverVersion) {
      console.log(`Using cached products (version ${serverVersion})`)
      return cacheData.products
    }

    // 4. Cache miss or version mismatch: Fetch fresh data
    console.log(`Fetching fresh products (cache version: ${cacheData?.version}, server version: ${serverVersion})`)
    const freshProducts = await getProducts()
    
    // 5. Store in cache
    const newCacheData: CacheData = {
      version: serverVersion,
      products: freshProducts,
      cached_at: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(newCacheData))
    
    return freshProducts
  } catch (error) {
    console.error("Failed to load products", error)
    return []
  }
}
