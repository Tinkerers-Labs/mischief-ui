"use client"

import * as React from "react"
import { Check, File, RefreshCw, Trash2, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type FileUploadStatus = "queued" | "uploading" | "complete" | "error"

export type FileUploadEntry<TResult = unknown> = {
  id: string
  file: File
  status: FileUploadStatus
  progress: number
  error?: string
  result?: TResult
}

export type FileUploadRejectionCode = "type" | "size" | "duplicate" | "count"

export type FileUploadRejection = {
  file: File
  code: FileUploadRejectionCode
  message: string
}

export type FileUploadAdapter<TResult = unknown> = (
  file: File,
  options: {
    signal: AbortSignal
    onProgress: (progress: number) => void
  }
) => Promise<TResult>

export type FileUploadProps<TResult = unknown> = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  name?: string
  title?: string
  description?: React.ReactNode
  browseLabel?: string
  dropLabel?: string
  uploadFile?: FileUploadAdapter<TResult>
  autoUpload?: boolean
  value?: FileUploadEntry<TResult>[]
  defaultValue?: FileUploadEntry<TResult>[]
  onFilesAccepted?: (files: File[]) => void
  onFilesRejected?: (rejections: FileUploadRejection[]) => void
  onFilesChange?: (files: FileUploadEntry<TResult>[]) => void
  onValueChange?: (files: FileUploadEntry<TResult>[]) => void
  onUploadComplete?: (entry: FileUploadEntry<TResult>, result: TResult) => void
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"

  const units = ["B", "KB", "MB", "GB"]
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  )

  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true

  return accept.split(",").some((rawToken) => {
    const token = rawToken.trim().toLowerCase()
    const fileName = file.name.toLowerCase()
    const fileType = file.type.toLowerCase()

    if (!token) return false
    if (token.startsWith(".")) return fileName.endsWith(token)
    if (token.endsWith("/*")) return fileType.startsWith(token.slice(0, -1))
    return fileType === token
  })
}

function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

function createId(file: File) {
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${fileKey(file)}:${suffix}`
}

function clampProgress(progress: number) {
  return Math.min(100, Math.max(0, Math.round(progress)))
}

function FileUploadInner<TResult = unknown>(
  {
    accept,
    multiple = true,
    maxFiles = 5,
    maxSize = DEFAULT_MAX_SIZE,
    disabled = false,
    name,
    title = "Drop files here",
    description,
    browseLabel = "Choose files",
    dropLabel = "Let go to add them",
    uploadFile,
    autoUpload = true,
    value,
    defaultValue = [],
    onFilesAccepted,
    onFilesRejected,
    onFilesChange,
    onValueChange,
    onUploadComplete,
    className,
    ...rootProps
  }: FileUploadProps<TResult>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>
) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dragDepthRef = React.useRef(0)
  const controllersRef = React.useRef(new Map<string, AbortController>())
  const [isDragging, setIsDragging] = React.useState(false)
  const [uncontrolledFiles, setUncontrolledFiles] =
    React.useState<FileUploadEntry<TResult>[]>(defaultValue)
  const [notice, setNotice] = React.useState("")
  const [rejectionMessage, setRejectionMessage] = React.useState<string | null>(
    null
  )

  const files = value ?? uncontrolledFiles
  const filesRef = React.useRef(files)

  React.useEffect(() => {
    filesRef.current = files
  }, [files])

  const updateFiles = React.useCallback(
    (
      update:
        | FileUploadEntry<TResult>[]
        | ((current: FileUploadEntry<TResult>[]) => FileUploadEntry<TResult>[])
    ) => {
      const nextFiles =
        typeof update === "function" ? update(filesRef.current) : update
      filesRef.current = nextFiles
      if (value === undefined) setUncontrolledFiles(nextFiles)
      onValueChange?.(nextFiles)
      onFilesChange?.(nextFiles)
    },
    [onFilesChange, onValueChange, value]
  )

  React.useEffect(() => {
    const controllers = controllersRef.current
    return () => {
      controllers.forEach((controller) => controller.abort())
      controllers.clear()
    }
  }, [])

  const startUpload = React.useCallback(
    async (entry: FileUploadEntry<TResult>) => {
      if (!uploadFile || disabled) return

      controllersRef.current.get(entry.id)?.abort()
      const controller = new AbortController()
      controllersRef.current.set(entry.id, controller)

      updateFiles((current) =>
        current.map((item) =>
          item.id === entry.id
            ? { ...item, status: "uploading", progress: 0, error: undefined }
            : item
        )
      )

      try {
        const result = await uploadFile(entry.file, {
          signal: controller.signal,
          onProgress: (progress) => {
            if (controller.signal.aborted) return
            updateFiles((current) =>
              current.map((item) =>
                item.id === entry.id
                  ? { ...item, progress: clampProgress(progress) }
                  : item
              )
            )
          },
        })

        if (controller.signal.aborted) return
        const completedEntry: FileUploadEntry<TResult> = {
          ...entry,
          status: "complete",
          progress: 100,
          error: undefined,
          result,
        }
        updateFiles((current) =>
          current.map((item) => (item.id === entry.id ? completedEntry : item))
        )
        onUploadComplete?.(completedEntry, result)
        setNotice(`${entry.file.name} uploaded.`)
      } catch (error) {
        if (controller.signal.aborted) return
        const message =
          error instanceof Error ? error.message : "The upload did not finish."
        updateFiles((current) =>
          current.map((item) =>
            item.id === entry.id
              ? { ...item, status: "error", error: message }
              : item
          )
        )
        setNotice(`${entry.file.name} needs another try.`)
      } finally {
        if (controllersRef.current.get(entry.id) === controller) {
          controllersRef.current.delete(entry.id)
        }
      }
    },
    [disabled, onUploadComplete, updateFiles, uploadFile]
  )

  const addFiles = React.useCallback(
    (nextFiles: FileList | File[]) => {
      if (disabled) return

      const candidates = Array.from(nextFiles)
      const currentFiles = filesRef.current
      const existingKeys = new Set(
        currentFiles.map(({ file }) => fileKey(file))
      )
      const accepted: File[] = []
      const rejections: FileUploadRejection[] = []
      const remaining = Math.max(0, maxFiles - currentFiles.length)

      candidates.forEach((file) => {
        if (
          accepted.length >= remaining ||
          (!multiple && accepted.length > 0)
        ) {
          rejections.push({
            file,
            code: "count",
            message: `You can add up to ${multiple ? maxFiles : 1} file${multiple && maxFiles !== 1 ? "s" : ""}.`,
          })
        } else if (!matchesAccept(file, accept)) {
          rejections.push({
            file,
            code: "type",
            message: `${file.name} is not an accepted file type.`,
          })
        } else if (file.size > maxSize) {
          rejections.push({
            file,
            code: "size",
            message: `${file.name} is larger than ${formatBytes(maxSize)}.`,
          })
        } else if (existingKeys.has(fileKey(file))) {
          rejections.push({
            file,
            code: "duplicate",
            message: `${file.name} is already in the list.`,
          })
        } else {
          accepted.push(file)
          existingKeys.add(fileKey(file))
        }
      })

      const entries = accepted.map<FileUploadEntry<TResult>>((file) => ({
        id: createId(file),
        file,
        status: "queued",
        progress: 0,
      }))

      if (entries.length > 0) {
        updateFiles((current) =>
          multiple ? [...current, ...entries] : entries
        )
        onFilesAccepted?.(accepted)
        setRejectionMessage(null)
        setNotice(
          `${entries.length} file${entries.length === 1 ? "" : "s"} added.`
        )
        if (uploadFile && autoUpload) {
          entries.forEach((entry) => void startUpload(entry))
        }
      }

      if (rejections.length > 0) {
        onFilesRejected?.(rejections)
        const message =
          rejections[0]?.message ?? "One or more files were not added."
        setRejectionMessage(message)
        setNotice(message)
      }
    },
    [
      accept,
      autoUpload,
      disabled,
      maxFiles,
      maxSize,
      multiple,
      onFilesAccepted,
      onFilesRejected,
      startUpload,
      updateFiles,
      uploadFile,
    ]
  )

  const removeFile = React.useCallback(
    (id: string) => {
      controllersRef.current.get(id)?.abort()
      controllersRef.current.delete(id)
      updateFiles((current) => current.filter((item) => item.id !== id))
    },
    [updateFiles]
  )

  const cancelUpload = React.useCallback(
    (id: string) => {
      controllersRef.current.get(id)?.abort()
      controllersRef.current.delete(id)
      updateFiles((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "queued",
                progress: 0,
                error: undefined,
                result: undefined,
              }
            : item
        )
      )
    },
    [updateFiles]
  )

  const helpText =
    description ??
    `${accept ? accept.split(",").join(", ") : "Any file type"} · Up to ${formatBytes(maxSize)}`

  return (
    <div
      className={cn("w-full space-y-3", className)}
      data-slot="file-upload"
      ref={forwardedRef}
      {...rootProps}
    >
      <div
        data-slot="file-upload-dropzone"
        className={cn(
          "border-border bg-background relative flex min-h-56 flex-col items-center justify-center overflow-hidden rounded-[var(--radius)] border border-dashed px-6 py-8 text-center transition-[border-color,background-color] duration-200",
          "motion-reduce:transition-none",
          isDragging && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-55"
        )}
        data-dragging={isDragging || undefined}
        onDragEnter={(event) => {
          event.preventDefault()
          if (disabled) return
          dragDepthRef.current += 1
          setIsDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
          if (dragDepthRef.current === 0) setIsDragging(false)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          dragDepthRef.current = 0
          setIsDragging(false)
          if (event.dataTransfer.files.length > 0) {
            addFiles(event.dataTransfer.files)
          }
        }}
      >
        <div
          data-slot="file-upload-illustration"
          aria-hidden="true"
          className="text-foreground relative mb-5 h-14 w-24"
        >
          <span
            className={cn(
              "border-border bg-background absolute top-2 left-1/2 h-11 w-9 -translate-x-[88%] -rotate-6 rounded-md border transition-transform duration-200",
              isDragging && "-translate-x-[105%] -translate-y-1 -rotate-12"
            )}
          />
          <span
            className={cn(
              "border-border bg-background absolute top-2 left-1/2 z-10 grid h-11 w-9 -translate-x-1/2 place-items-center rounded-md border transition-transform duration-200",
              isDragging && "-translate-y-2 scale-105"
            )}
          >
            <File size={17} strokeWidth={1.8} />
          </span>
          <span
            className={cn(
              "border-border bg-background absolute top-2 left-1/2 h-11 w-9 -translate-x-[12%] rotate-6 rounded-md border transition-transform duration-200",
              isDragging && "translate-x-[5%] -translate-y-1 rotate-12"
            )}
          />
        </div>

        <p data-slot="file-upload-title" className="font-medium">
          {isDragging ? dropLabel : title}
        </p>
        <div
          data-slot="file-upload-description"
          className="text-muted-foreground mt-1 max-w-md text-sm"
        >
          {helpText}
        </div>
        {rejectionMessage ? (
          <p
            data-slot="file-upload-error"
            className="text-destructive mt-2 max-w-md text-sm"
          >
            {rejectionMessage}
          </p>
        ) : null}

        <button
          data-slot="file-upload-browse"
          className="bg-foreground text-background focus-visible:ring-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none"
          disabled={disabled}
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          <Upload aria-hidden="true" size={16} />
          {browseLabel}
        </button>
        <input
          data-slot="file-upload-input"
          ref={inputRef}
          className="hidden"
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          tabIndex={-1}
          onChange={(event) => {
            if (event.currentTarget.files) addFiles(event.currentTarget.files)
            event.currentTarget.value = ""
          }}
        />
      </div>

      {files.length > 0 ? (
        <ul
          data-slot="file-upload-list"
          className="border-border bg-background divide-border divide-y rounded-[var(--radius)] border"
        >
          {files.map((entry) => (
            <li
              data-slot="file-upload-item"
              className="flex min-w-0 items-center gap-3 p-3"
              key={entry.id}
            >
              <span className="bg-muted text-muted-foreground grid size-10 shrink-0 place-items-center rounded-lg">
                <File aria-hidden="true" size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">
                    {entry.file.name}
                  </p>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatBytes(entry.file.size)}
                  </span>
                </div>
                {entry.status === "uploading" ? (
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      data-slot="file-upload-progress"
                      aria-label={`${entry.file.name} upload progress`}
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={entry.progress}
                      className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full"
                      role="progressbar"
                    >
                      <span
                        className="bg-primary block h-full rounded-full transition-[width] duration-150 motion-reduce:transition-none"
                        style={{ width: `${entry.progress}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground w-8 text-right text-xs tabular-nums">
                      {entry.progress}%
                    </span>
                  </div>
                ) : (
                  <p
                    className={cn(
                      "text-muted-foreground mt-0.5 truncate text-xs",
                      entry.status === "error" && "text-destructive"
                    )}
                  >
                    {entry.status === "complete"
                      ? "Uploaded"
                      : entry.status === "error"
                        ? entry.error
                        : uploadFile
                          ? "Ready to upload"
                          : "Ready"}
                  </p>
                )}
              </div>

              <div
                data-slot="file-upload-actions"
                className="flex shrink-0 items-center"
              >
                {entry.status === "complete" ? (
                  <span
                    aria-label="Upload complete"
                    className="text-primary grid size-11 place-items-center"
                    role="img"
                  >
                    <Check aria-hidden="true" size={18} />
                  </span>
                ) : null}
                {uploadFile && entry.status === "queued" ? (
                  <button
                    aria-label={`Upload ${entry.file.name}`}
                    className="hover:bg-muted focus-visible:ring-ring grid size-11 place-items-center rounded-full outline-none focus-visible:ring-2"
                    type="button"
                    onClick={() => void startUpload(entry)}
                  >
                    <Upload aria-hidden="true" size={17} />
                  </button>
                ) : null}
                {entry.status === "uploading" ? (
                  <button
                    aria-label={`Cancel ${entry.file.name}`}
                    className="hover:bg-muted focus-visible:ring-ring grid size-11 place-items-center rounded-full outline-none focus-visible:ring-2"
                    type="button"
                    onClick={() => cancelUpload(entry.id)}
                  >
                    <X aria-hidden="true" size={17} />
                  </button>
                ) : null}
                {entry.status === "error" ? (
                  <button
                    aria-label={`Retry ${entry.file.name}`}
                    className="hover:bg-muted focus-visible:ring-ring grid size-11 place-items-center rounded-full outline-none focus-visible:ring-2"
                    type="button"
                    onClick={() => void startUpload(entry)}
                  >
                    <RefreshCw aria-hidden="true" size={16} />
                  </button>
                ) : null}
                {entry.status !== "uploading" ? (
                  <button
                    aria-label={`Remove ${entry.file.name}`}
                    className="hover:bg-muted focus-visible:ring-ring grid size-11 place-items-center rounded-full outline-none focus-visible:ring-2"
                    type="button"
                    onClick={() => removeFile(entry.id)}
                  >
                    <Trash2 aria-hidden="true" size={16} />
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <p
        data-slot="file-upload-status"
        className="sr-only"
        aria-live="polite"
        role="status"
      >
        {notice}
      </p>
    </div>
  )
}

export const FileUpload = React.forwardRef(FileUploadInner) as <
  TResult = unknown,
>(
  props: FileUploadProps<TResult> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement
