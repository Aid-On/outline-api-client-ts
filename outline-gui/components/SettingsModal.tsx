'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (apiKey: string, apiUrl: string) => void
  currentApiKey: string
  currentApiUrl: string
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentApiKey, 
  currentApiUrl 
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey)
  const [apiUrl, setApiUrl] = useState(currentApiUrl)

  useEffect(() => {
    setApiKey(currentApiKey)
    setApiUrl(currentApiUrl)
  }, [currentApiKey, currentApiUrl, isOpen])

  const handleSave = () => {
    // Remove trailing /api if present to store just the base URL
    const cleanUrl = apiUrl.replace(/\/api\/?$/, '')
    onSave(apiKey, cleanUrl)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">API Settings</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <input
              type="password"
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your Outline API key"
            />
          </div>
          
          <div>
            <label htmlFor="api-url" className="block text-sm font-medium text-gray-700">
              API URL
            </label>
            <input
              type="text"
              id="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="https://app.getoutline.com"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}