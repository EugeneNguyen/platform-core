import axios from "axios";

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
  remote_entry: string | null;
}

export async function fetchModules(): Promise<ModuleConfig[]> {
  try {
    const response = await axios.get<{ modules: ModuleConfig[] }>(`${API_BASE_URL}/api/modules`);
    return response.data.modules;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`GET /api/modules failed with status ${error.response.status}`);
    }
    throw error;
  }
}
