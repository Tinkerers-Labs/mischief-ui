import * as React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { FileThumbnail } from "../registry/default/file-thumbnail/file-thumbnail"
import {
  FileUpload,
  type FileUploadEntry,
} from "../registry/default/file-upload/file-upload"
import { HoldButton } from "../registry/default/hold-button/hold-button"

describe("HoldButton", () => {
  it("keeps native click callbacks and keyboard activation composable", () => {
    const onClick = vi.fn()
    const onComplete = vi.fn()

    render(
      <HoldButton onClick={onClick} onComplete={onComplete}>
        Hold to remove
      </HoldButton>
    )

    fireEvent.click(screen.getByRole("button"), { detail: 0 })

    expect(onClick).toHaveBeenCalledOnce()
    expect(onComplete).toHaveBeenCalledOnce()
    expect(screen.getByRole("button")).toHaveAttribute("data-state", "complete")
  })

  it("allows a consumer to cancel internal activation", () => {
    const onComplete = vi.fn()

    render(
      <HoldButton
        onClick={(event) => event.preventDefault()}
        onComplete={onComplete}
      />
    )

    fireEvent.click(screen.getByRole("button"), { detail: 0 })

    expect(onComplete).not.toHaveBeenCalled()
  })
})

describe("FileUpload", () => {
  it("keeps a controlled queue in sync and exposes the adapter result", async () => {
    const user = userEvent.setup()
    const onUploadComplete = vi.fn()
    const uploadFile = vi.fn(async () => ({ key: "uploads/photo.png" }))

    function ControlledUpload() {
      const [files, setFiles] = React.useState<
        FileUploadEntry<{ key: string }>[]
      >([])

      return (
        <FileUpload
          accept="image/*"
          value={files}
          onValueChange={setFiles}
          onUploadComplete={onUploadComplete}
          uploadFile={uploadFile}
        />
      )
    }

    const { container } = render(<ControlledUpload />)
    const input = container.querySelector<HTMLInputElement>(
      '[data-slot="file-upload-input"]'
    )
    const file = new File(["image"], "photo.png", { type: "image/png" })

    expect(input).not.toBeNull()
    await user.upload(input!, file)

    await waitFor(() => expect(onUploadComplete).toHaveBeenCalledOnce())
    expect(onUploadComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "complete",
        result: { key: "uploads/photo.png" },
      }),
      { key: "uploads/photo.png" }
    )
    expect(screen.getByText("Uploaded")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Remove photo.png" }))
    expect(screen.queryByText("photo.png")).not.toBeInTheDocument()
  })
})

describe("FileThumbnail", () => {
  it("creates and revokes an object URL for a browser image file", async () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:preview")
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined)
    const file = new File(["image"], "photo.png", { type: "image/png" })

    const { unmount } = render(
      <FileThumbnail alt="Uploaded photo" file={file} />
    )

    expect(screen.getByRole("status")).toHaveAccessibleName(
      "Loading preview for photo.png"
    )
    await screen.findByAltText("Uploaded photo")
    expect(createObjectURL).toHaveBeenCalledWith(file)

    unmount()
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview")
  })
})
