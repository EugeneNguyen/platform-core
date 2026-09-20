export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export interface ModuleConfig {
  name: string;
  kind: "kernel" | "module";
  path: string;
  repo: string;
  enabled: boolean;
  frontend_url: string | null;
}

export async function fetchModules(): Promise<ModuleConfig[]> {
  const response = await fetch(`${API_BASE_URL}/modules`);
  if (!response.ok) {
    throw new Error(`GET /modules failed with status ${response.status}`);
  }
  const data = (await response.json()) as { modules: ModuleConfig[] };
  return data.modules;
}
