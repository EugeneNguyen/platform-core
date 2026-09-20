import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ModuleRedirect from "./pages/ModuleRedirect";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:moduleName/*" element={<ModuleRedirect />} />
    </Routes>
  );
}

export default App;
