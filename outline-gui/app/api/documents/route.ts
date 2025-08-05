import { NextRequest, NextResponse } from 'next/server'
import { OutlineClient } from 'outline-api-client'

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  const apiUrl = request.headers.get('x-api-url') || 'https://app.getoutline.com/api'
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')
  const id = searchParams.get('id')
  const query = searchParams.get('query')
  const collectionId = searchParams.get('collectionId')
  const limit = searchParams.get('limit')
  
  // Ensure the API URL is properly formatted
  const formattedApiUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`
  
  console.log('Documents API - Using URL:', formattedApiUrl)
  console.log('Documents API - Action:', action)
  
  const client = new OutlineClient({ 
    apiKey, 
    apiUrl: formattedApiUrl,
    timeout: 60000 // 60秒のタイムアウト
  })
  
  try {
    switch (action) {
      case 'list':
        const parentDocumentId = searchParams.get('parentDocumentId')
        const offset = searchParams.get('offset')
        const listParams = {
          collectionId: collectionId || undefined,
          parentDocumentId: parentDocumentId || undefined,
          limit: limit ? parseInt(limit) : 10,
          offset: offset ? parseInt(offset) : undefined,
        }
        const listResponse = await client.documents.list(listParams)
        return NextResponse.json(listResponse)
        
      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query is required for search' }, { status: 400 })
        }
        const searchParams = {
          collectionId: collectionId || undefined,
          limit: limit ? parseInt(limit) : 10,
        }
        const searchResponse = await client.documents.search(query, searchParams)
        return NextResponse.json(searchResponse)
        
      case 'info':
        if (!id) {
          return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
        }
        const infoResponse = await client.documents.info(id)
        return NextResponse.json(infoResponse)
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 500 })
  }
}