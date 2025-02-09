import { HashRouter, Route, Routes } from "react-router-dom";
import ChartChangelog from "./ChartChangelog";
import Charts from "./Charts";
import Home from "./Home";
import { SideBar } from "./SideBar";

function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen">
        <SideBar />
        <main className="flex-1 p-4 dark:bg-gray-800">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/changelog" element={<ChartChangelog />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
