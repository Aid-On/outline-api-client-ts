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
  const includePrivate = searchParams.get('includePrivate')
  
  // Ensure the API URL is properly formatted
  const formattedApiUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`
  
  console.log('Collections API - Using URL:', formattedApiUrl)
  console.log('Collections API - Action:', action)
  
  const client = new OutlineClient({ 
    apiKey, 
    apiUrl: formattedApiUrl,
    timeout: 60000 // 60秒のタイムアウト
  })
  
  try {
    switch (action) {
      case 'list':
        // Pass empty options for now, as the API doesn't support includePrivate parameter
        const listResponse = await client.collections.list({})
        console.log('Collections list response:', JSON.stringify(listResponse, null, 2))
        
        // Check if response has the expected structure
        if (listResponse && typeof listResponse === 'object') {
          return NextResponse.json(listResponse)
        } else {
          console.error('Unexpected response format:', listResponse)
          return NextResponse.json({ error: 'Invalid response format from API' }, { status: 500 })
        }
        
      case 'info':
        if (!id) {
          return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 })
        }
        const infoResponse = await client.collections.info(id)
        return NextResponse.json(infoResponse)
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Collections API error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response,
      data: error.data
    })
    return NextResponse.json({ 
      error: error.message || 'An error occurred',
      details: error.response?.data || error.data || {}
    }, { status: 500 })
  }
}