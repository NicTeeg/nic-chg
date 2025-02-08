import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SideBar from './SideBar';
import Chart from './Chart';
import ChartTwo from './ChartTwo';
import Home from './Home';

function App() {
  return (
    <Router basename='/nic-chg'>
      <div className="flex min-h-screen">
        <SideBar />
        <main className="flex-1 p-4 dark:bg-gray-800">
          <Routes>
            <Route path="/chart" element={<Chart />} />
            <Route path="/charttwo" element={<ChartTwo />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;