'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Camera, Video, X, Upload } from 'lucide-react'
import Image from 'next/image'

interface MediaUploaderProps {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  acceptImages?: boolean
  acceptVideos?: boolean
}

export default function MediaUploader({
  onFilesChange,
  maxFiles = 5,
  acceptImages = true,
  acceptVideos = true
}: MediaUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
    setFiles(newFiles)
    onFilesChange(newFiles)

    // Create previews
    const newPreviews = acceptedFiles.map((file) => URL.createObjectURL(file))
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, maxFiles))
  }, [files, maxFiles, onFilesChange])

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesChange(newFiles)

    // Revoke preview URL
    URL.revokeObjectURL(previews[index])
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const accept: Record<string, string[]> = {}
  if (acceptImages) {
    accept['image/*'] = ['.jpeg', '.jpg', '.png', '.gif', '.webp']
  }
  if (acceptVideos) {
    accept['video/*'] = ['.mp4', '.webm', '.mov']
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles
  })

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
          ${isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400'}
          ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          <div className="flex space-x-4">
            {acceptImages && <Camera size={32} className="text-gray-400" />}
            {acceptVideos && <Video size={32} className="text-gray-400" />}
          </div>
          {isDragActive ? (
            <p className="text-red-600">Lepaskan file di sini...</p>
          ) : (
            <>
              <p className="text-gray-600">
                Drag & drop foto/video atau{' '}
                <span className="text-red-600 font-semibold">klik untuk memilih</span>
              </p>
              <p className="text-sm text-gray-400">
                Maksimal {maxFiles} file. Format: JPG, PNG, MP4, WebM
              </p>
            </>
          )}
          <Upload size={24} className="text-gray-400" />
        </div>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {file.type.startsWith('image/') ? (
                <Image
                  src={previews[index]}
                  alt={`Preview ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <video
                  src={previews[index]}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {file.type.startsWith('image/') ? 'Foto' : 'Video'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Camera Capture Buttons */}
      <div className="flex space-x-4">
        <label className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg cursor-pointer hover:bg-red-700 transition">
          <Camera size={20} />
          <span>Ambil Foto</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onDrop([e.target.files[0]])
              }
            }}
          />
        </label>
        <label className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition">
          <Video size={20} />
          <span>Rekam Video</span>
          <input
            type="file"
            accept="video/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onDrop([e.target.files[0]])
              }
            }}
          />
        </label>
      </div>
    </div>
  )
}
