import { Download, File, Image, Music2, Video } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { BinaryApiPayload } from '@/services/api/api.types'

/**
 * Viewer for binary payloads (images, audio, video, generic files) returned
 * by stream endpoints. JSON responses render through the shared code system
 * (CodeBlock/JsonView) instead.
 */
export function BinaryResponseViewer({ file }: { file: BinaryApiPayload }) {
  const [objectUrl, setObjectUrl] = useState('')

  useEffect(() => {
    const url = URL.createObjectURL(file.blob)
    setObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file.blob])

  const type = file.contentType.toLowerCase()
  const isImage = type.startsWith('image/')
  const isVideo = type.startsWith('video/')
  const isAudio = type.startsWith('audio/')
  const Icon = isImage ? Image : isVideo ? Video : isAudio ? Music2 : File

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-navy-border bg-[#10182b] p-4">
      <div className="flex flex-wrap items-center gap-3 text-[#c8cfe4]">
        <Icon size={20} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs font-semibold">{file.filename}</p>
          <p className="mt-1 font-mono text-[11px] text-[#8b93ab]">
            {file.contentType} · {(file.blob.size / 1024).toFixed(2)} KB
          </p>
        </div>
        {objectUrl && (
          <a
            href={objectUrl}
            download={file.filename}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#34405a] px-3 font-body text-xs font-semibold text-white transition-colors hover:border-[#65718c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
          >
            <Download size={14} aria-hidden="true" /> Download
          </a>
        )}
      </div>
      {objectUrl && isImage && (
        <img src={objectUrl} alt={file.filename} className="max-h-[420px] max-w-full self-start rounded-lg object-contain" />
      )}
      {objectUrl && isAudio && <audio controls src={objectUrl} className="w-full" />}
      {objectUrl && isVideo && <video controls src={objectUrl} className="max-h-[420px] w-full rounded-lg" />}
      {!isImage && !isAudio && !isVideo && (
        <p className="font-mono text-xs text-[#8b93ab]">
          Binary response received successfully. Download the file to inspect it.
        </p>
      )}
    </div>
  )
}
