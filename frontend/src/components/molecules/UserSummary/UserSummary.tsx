import Avatar from "../../atoms/Avatar";
import type { AppShellUser } from "../../types";

export interface UserSummaryProps {
  user: AppShellUser;
}

/** Mirrors Tabler's own top-bar "user block" sample - avatar + name/email, no dropdown. */
function UserSummary({ user }: UserSummaryProps) {
  return (
    <div className="d-flex lh-1 align-items-center">
      <Avatar name={user.name} />
      <div className="d-none d-xl-block ps-2">
        <div>{user.name}</div>
        <div className="mt-1 small text-secondary">{user.email}</div>
      </div>
    </div>
  );
}

export default UserSummary;
