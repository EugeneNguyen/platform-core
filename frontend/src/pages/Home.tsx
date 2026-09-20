import { useModules } from "../lib/useModules";

function Home() {
  const { modules, loading, error } = useModules();

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
            {module.frontend_url ? <a href={`/${module.name}/`}>open</a> : "— no frontend"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
