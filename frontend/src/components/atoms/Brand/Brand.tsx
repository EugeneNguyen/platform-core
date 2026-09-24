import type { ReactNode } from "react";
import { DefaultLink, type LinkComponent } from "../../types";

export interface BrandProps {
  label: ReactNode;
  href?: string;
  linkComponent?: LinkComponent;
  /** Extra classes on the `.navbar-brand` heading. */
  className?: string;
}

function Brand({ label, href = "/", linkComponent: Link = DefaultLink, className }: BrandProps) {
  return (
    <h1 className={["navbar-brand navbar-brand-autodark", className].filter(Boolean).join(" ")}>
      <Link to={href} className="text-reset text-decoration-none">
        {label}
      </Link>
    </h1>
  );
}

export default Brand;
