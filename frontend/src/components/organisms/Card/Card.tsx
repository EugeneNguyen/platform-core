import type { ReactNode } from "react";

/**
 * Tabler's `.card` family (docs.tabler.io/ui/components/cards) as
 * composable pieces, same shape as `Table` - `Card`/`CardHeader`/
 * `CardTitle`/`CardSubtitle`/`CardImage`/`CardBody`/`CardFooter`,
 * assembled the same way you'd write the plain HTML
 * (`<Card><CardHeader><CardTitle>...`). Each just renders the class
 * name a prop maps to - no owned state, same rule as everything else in
 * `components/`.
 */

function classNames(...parts: Array<string | false | undefined>): string | undefined {
  const joined = parts.filter(Boolean).join(" ");
  return joined || undefined;
}

export interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={classNames("card", className)}>{children}</div>;
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  /** @default "sm" - this design system stays compact throughout (`Button`/`FormControl` do the same); pass `"md"` for Tabler's plain, unmodified `.card-header` padding. An inline style, not a utility class - Tabler's own `.card-header` rule loads after Bootstrap's spacing utilities, so a plain `.p-2`-style class isn't guaranteed to win the cascade. */
  size?: "sm" | "md";
}

export function CardHeader({ children, className, size = "sm" }: CardHeaderProps) {
  return (
    <div className={classNames("card-header", className)} style={size === "sm" ? { padding: "0.5rem 1rem" } : undefined}>
      {children}
    </div>
  );
}

export interface CardTitleProps {
  children: ReactNode;
  /** @default "h3" - Tabler's own docs use `h3.card-title` most commonly, both inside `CardHeader` and directly in `CardBody`. */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
}

export function CardTitle({ children, as: Heading = "h3", className }: CardTitleProps) {
  return <Heading className={classNames("card-title", className)}>{children}</Heading>;
}

export interface CardSubtitleProps {
  children: ReactNode;
  className?: string;
}

export function CardSubtitle({ children, className }: CardSubtitleProps) {
  return <div className={classNames("card-subtitle", className)}>{children}</div>;
}

export interface CardImageProps {
  src: string;
  alt: string;
  /** @default "top" */
  position?: "top" | "bottom";
  className?: string;
}

export function CardImage({ src, alt, position = "top", className }: CardImageProps) {
  return <img src={src} alt={alt} className={classNames(`card-img-${position}`, className)} />;
}

export interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={classNames("card-body", className)}>{children}</div>;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={classNames("card-footer", className)}>{children}</div>;
}
