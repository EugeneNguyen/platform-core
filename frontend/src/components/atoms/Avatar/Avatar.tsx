export interface AvatarProps {
  name: string;
  size?: "sm" | "md";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function Avatar({ name, size = "sm" }: AvatarProps) {
  return (
    <span className={`avatar avatar-${size} bg-secondary-lt`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export default Avatar;
