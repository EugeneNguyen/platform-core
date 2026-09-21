import UserSummary from "../molecules/UserSummary";
import type { AppShellUser } from "../types";

export interface HeaderProps {
  user?: AppShellUser | null;
  onLogout?: () => void;
}

/**
 * `sticky-top` (a plain Bootstrap utility) rather than Tabler's
 * `data-bs-navbar="sticky"` html-attribute route - that route needs the
 * host to own `<html>` and set the attribute itself, coupling this
 * package to a specific host wiring. A class on the element it belongs to
 * works the same and needs nothing from the host beyond loading Tabler's
 * CSS.
 *
 * Deliberately has no `navbar-expand-*` class (this header has no
 * collapsible nav of its own, so it doesn't need one) - Tabler's CSS
 * treats ANY `.page` child matching `[class*=navbar-expand]` that isn't
 * `.navbar-vertical` as "the other navigation" in its vertical/horizontal
 * toggle (docs.tabler.io/ui/layout/page-layouts, "Navigation position"):
 * `html:not([data-bs-navbar-position=vertical]) .page:has(>
 * [class*=navbar-expand]:not(.navbar-vertical))>.navbar-vertical{display:
 * none}`. With that class here, Sidebar's `aside.navbar-vertical` gets
 * hidden outright (not just below a breakpoint) unless the host sets
 * `data-bs-navbar-position="vertical")` on `<html>` - and setting that
 * instead hides THIS header. Neither is what we want (both should always
 * show); dropping the class here sidesteps the toggle entirely.
 */
function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="navbar d-print-none sticky-top bg-white">
      <div className="container-xl">
        <div className="navbar-nav flex-row order-md-last align-items-center gap-3 ms-auto py-2">
          {user && <UserSummary user={user} />}
          {onLogout && (
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onLogout}>
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
