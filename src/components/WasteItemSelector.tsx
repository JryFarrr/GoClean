'use client'

import { useState } from 'react'
import { Plus, Minus, Trash2 } from 'lucide-react'

const WASTE_TYPES = [
  { value: 'ORGANIC', label: 'Organik', icon: '🥬', color: 'bg-green-100 text-green-800' },
  { value: 'PLASTIC', label: 'Plastik', icon: '♻️', color: 'bg-blue-100 text-blue-800' },
  { value: 'PAPER', label: 'Kertas', icon: '📄', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'METAL', label: 'Logam', icon: '🔧', color: 'bg-gray-100 text-gray-800' },
  { value: 'GLASS', label: 'Kaca', icon: '🪟', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'ELECTRONIC', label: 'Elektronik', icon: '📱', color: 'bg-purple-100 text-purple-800' },
  { value: 'OTHER', label: 'Lainnya', icon: '📦', color: 'bg-orange-100 text-orange-800' }
]

interface WasteItem {
  wasteType: string
  estimatedWeight: number
}

interface WasteItemSelectorProps {
  items: WasteItem[]
  onChange: (items: WasteItem[]) => void
}

export default function WasteItemSelector({ items, onChange }: WasteItemSelectorProps) {
  const [selectedType, setSelectedType] = useState('')

  const addItem = () => {
    if (!selectedType) return
    
    // Check if type already exists
    const existingIndex = items.findIndex((item) => item.wasteType === selectedType)
    if (existingIndex >= 0) {
      // Increment weight
      const newItems = [...items]
      newItems[existingIndex].estimatedWeight += 1
      onChange(newItems)
    } else {
      onChange([...items, { wasteType: selectedType, estimatedWeight: 1 }])
    }
    setSelectedType('')
  }

  const updateWeight = (index: number, delta: number) => {
    const newItems = [...items]
    newItems[index].estimatedWeight = Math.max(0.5, newItems[index].estimatedWeight + delta)
    onChange(newItems)
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const getWasteTypeInfo = (type: string) => {
    return WASTE_TYPES.find((wt) => wt.value === type)
  }

  return (
    <div className="space-y-4">
      {/* Add New Item */}
      <div className="flex space-x-2">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Pilih Jenis Sampah</option>
          {WASTE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addItem}
          disabled={!selectedType}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Selected Items */}
      {items.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">Jenis sampah yang dipilih:</p>
          {items.map((item, index) => {
            const typeInfo = getWasteTypeInfo(item.wasteType)
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${typeInfo?.color || 'bg-gray-100'}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{typeInfo?.icon}</span>
                  <div>
                    <p className="font-medium">{typeInfo?.label}</p>
                    <p className="text-sm opacity-75">Perkiraan berat</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => updateWeight(index, -0.5)}
                    className="p-1 bg-white rounded-full hover:bg-gray-200 transition"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-16 text-center font-semibold">
                    {item.estimatedWeight} kg
                  </span>
                  <button
                    type="button"
                    onClick={() => updateWeight(index, 0.5)}
                    className="p-1 bg-white rounded-full hover:bg-gray-200 transition"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded-full transition ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
          
          {/* Total Weight */}
          <div className="flex justify-between items-center p-3 bg-green-600 text-white rounded-lg">
            <span className="font-medium">Total Perkiraan Berat:</span>
            <span className="text-xl font-bold">
              {items.reduce((sum, item) => sum + item.estimatedWeight, 0)} kg
            </span>
          </div>
        </div>
      )}

      {/* Quick Select Grid */}
      <div>
        <p className="text-sm text-gray-600 mb-2">Pilih cepat:</p>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {WASTE_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                setSelectedType(type.value)
                // Auto add
                const existingIndex = items.findIndex((item) => item.wasteType === type.value)
                if (existingIndex >= 0) {
                  const newItems = [...items]
                  newItems[existingIndex].estimatedWeight += 1
                  onChange(newItems)
                } else {
                  onChange([...items, { wasteType: type.value, estimatedWeight: 1 }])
                }
              }}
              className={`p-3 rounded-lg border-2 hover:border-green-500 transition flex flex-col items-center
                ${items.some((item) => item.wasteType === type.value) ? 'border-green-500 bg-green-50' : 'border-gray-200'}
              `}
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="text-xs mt-1">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
