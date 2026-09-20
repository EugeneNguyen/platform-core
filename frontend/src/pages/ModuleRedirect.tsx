import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useModules } from "../lib/useModules";

/**
 * Route generated per module from modules.yaml (via GET /modules) - no
 * module federation yet, so "composing" a module's frontend here means
 * handing off the browser to its own deployment, at `frontend_url` plus
 * whatever path came after the module's own segment
 * (`/platform-auth/login` -> `${frontend_url}/login`).
 */
function ModuleRedirect() {
  const { modules, loading } = useModules();
  const params = useParams<{ moduleName: string; "*": string }>();

  const module = modules.find((m) => m.name === params.moduleName);

  useEffect(() => {
    if (module?.frontend_url) {
      const rest = params["*"] ?? "";
      window.location.replace(`${module.frontend_url}/${rest}`);
    }
  }, [module, params]);

  if (loading) return <p>Loading modules…</p>;
  if (!module) return <p>Unknown module "{params.moduleName}".</p>;
  if (!module.frontend_url) return <p>Module "{module.name}" has no frontend.</p>;
  return <p>Redirecting to {module.name}…</p>;
}

export default ModuleRedirect;
