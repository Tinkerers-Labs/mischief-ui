import { CodeBlock } from "@/components/code-block"
import type { DocBlock } from "@/lib/component-docs"

export function DocBlocks({ blocks }: { blocks: readonly DocBlock[] }) {
  return blocks.map((block, index) => {
    switch (block.kind) {
      case "text":
        return <p key={index}>{block.text}</p>

      case "code":
        return (
          <figure className="doc-figure" key={index}>
            <CodeBlock code={block.code} />
            {block.caption ? <figcaption>{block.caption}</figcaption> : null}
          </figure>
        )

      case "list":
        return (
          <ul className="doc-list" key={index}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )

      case "table":
        return (
          <div className="doc-table-scroll" key={index}>
            <table className="doc-table">
              <thead>
                <tr>
                  {block.headers.map((header) => (
                    <th key={header} scope="col">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row.join("|")}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>
                        {cellIndex === 0 ? <code>{cell}</code> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
    }
  })
}
