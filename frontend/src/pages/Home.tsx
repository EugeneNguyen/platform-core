import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { useModules } from "../lib/useModules";
import { loadRemoteComponent } from "../lib/remoteComponents";

function Home() {
  const { modules, loading, error } = useModules();
  const [RemoteLogin, setRemoteLogin] = useState<ComponentType | null>(null);

  useEffect(() => {
    const platformAuth = modules.find((module) => module.name === "platform-auth");
    if (!platformAuth) return;
    let cancelled = false;
    loadRemoteComponent(platformAuth, "RemoteLogin").then((Component) => {
      if (!cancelled) setRemoteLogin(() => Component);
    });
    return () => {
      cancelled = true;
    };
  }, [modules]);

  if (loading) return <p>Loading modules…</p>;
  if (error) return <p>Failed to load modules: {error}</p>;

  return (
    <div>
      <h1>platform-core</h1>
      <p>Modules composed into this platform:</p>
      <ul>
        {modules.map((module) => (
          <li key={module.name}>
            {module.name} ({module.kind}){" "}
            {module.url_prefix ? <a href={module.url_prefix}>open</a> : "— no frontend"}
          </li>
        ))}
      </ul>

      {/* platform-auth's login form, loaded via Module Federation and
          rendered inline - no page navigation, no separate deploy to
          visit. Falls back to nothing (the link above still works) if the
          remote fails to load. */}
      {RemoteLogin && (
        <div style={{ marginTop: "2rem" }}>
          <h2>platform-auth (federated)</h2>
          <RemoteLogin />
        </div>
      )}
    </div>
  );
}

export default Home;
