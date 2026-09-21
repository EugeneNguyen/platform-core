import { registerRemotes, loadRemote } from "@module-federation/runtime";
import type { ModuleConfig } from "./modules";

const registered = new Set<string>();

/**
 * Registers `module` as a Module Federation remote (idempotent - safe to
 * call every render) and loads one of its exposed components by name
 * (e.g. "RemoteLogin", matching that module's own `exposes` key).
 *
 * Returns null if the module has no `remote_entry` (not every module
 * exposes a federated component) or the load fails - callers fall back
 * to a plain link to the module's `url_prefix` in that case.
 */
export async function loadRemoteComponent<TProps extends object>(
  module: ModuleConfig,
  exposedName: string,
): Promise<React.ComponentType<TProps> | null> {
  if (!module.remote_entry) return null;

  const remoteName = toCamelCase(module.name);
  if (!registered.has(remoteName)) {
    registerRemotes([{ name: remoteName, entry: module.remote_entry, type: "module", alias: remoteName }]);
    registered.add(remoteName);
  }

  try {
    const mod = await loadRemote<{ default: React.ComponentType<TProps> }>(`${remoteName}/${exposedName}`);
    return mod?.default ?? null;
  } catch (error) {
    console.error(`Failed to load ${exposedName} from ${module.name}:`, error);
    return null;
  }
}

function toCamelCase(kebab: string): string {
  return kebab.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}
