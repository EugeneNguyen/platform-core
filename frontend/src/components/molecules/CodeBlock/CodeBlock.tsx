import CopyButton from "../../atoms/CopyButton";

// Tabler's ::selection is a 10% primary tint - invisible on <pre>'s dark
// surface, so a selection there looked like nothing happened. Shipped as
// a string (not a .css import) so the package's "." entry stays loadable
// by react-router's route-config loader.
const CODE_BLOCK_STYLES = `
.pc-code-block pre::selection,
.pc-code-block pre ::selection {
  background-color: color-mix(in srgb, var(--tblr-primary) 55%, transparent);
  color: #fff;
}
`;

export interface CodeBlockProps {
  /** The snippet - shown verbatim (wrapped) and copied as-is. */
  code: string;
  /** @default true - a Copy button in the top-right corner. */
  copyable?: boolean;
  className?: string;
}

/** A dark, wrapped code snippet (Tabler's `pre`) with a Copy button and a visible text selection. */
function CodeBlock({ code, copyable = true, className }: CodeBlockProps) {
  return (
    <div className={["pc-code-block position-relative", className].filter(Boolean).join(" ")}>
      <style href="platform-core-code-block" precedence="default">
        {CODE_BLOCK_STYLES}
      </style>
      <pre className="mb-0" style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", paddingRight: copyable ? "5rem" : undefined }}>
        {code}
      </pre>
      {copyable && (
        <div className="position-absolute top-0 end-0 m-2">
          <CopyButton text={code} />
        </div>
      )}
    </div>
  );
}

export default CodeBlock;
