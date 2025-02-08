import { HashRouter, Route, Routes } from 'react-router-dom';
import SideBar from './SideBar';
import Chart from './Chart';
import ChartTwo from './ChartTwo';
import Home from './Home';

function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen">
        <SideBar />
        <main className="flex-1 p-4 dark:bg-gray-800">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chart" element={<Chart />} />
            <Route path="/charttwo" element={<ChartTwo />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
