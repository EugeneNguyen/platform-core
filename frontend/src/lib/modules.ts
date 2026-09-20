// Same origin by default - platform-core's own backend is reachable at
// /api on this same port behind the gateway (nginx/default.conf), no
// separate host/port needed.
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "";

export interface ModuleConfig {
  name: string;
  kind: "kernel" | "module";
  path: string;
  repo: string;
  enabled: boolean;
  url_prefix: string | null;
}

export async function fetchModules(): Promise<ModuleConfig[]> {
  const response = await fetch(`${API_BASE_URL}/api/modules`);
  if (!response.ok) {
    throw new Error(`GET /api/modules failed with status ${response.status}`);
  }
  const data = (await response.json()) as { modules: ModuleConfig[] };
  return data.modules;
}
