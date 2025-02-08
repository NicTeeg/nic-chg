import { Sidebar } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { DarkThemeToggle } from 'flowbite-react';

const SideBar = () => {
  return (
    <div className="flex h-screen flex-col">
      <Sidebar aria-label="sidebar" className="h-full">
        <Sidebar.Items className="grow">
          <Sidebar.ItemGroup>
            <Sidebar.Item>
              <Link to="/">Home</Link>
            </Sidebar.Item>
            <Sidebar.Item>
              <Link to="/chart">Chart</Link>
            </Sidebar.Item>
            <Sidebar.Item>
              <Link to="/charttwo">Chart Two</Link>
            </Sidebar.Item>
          </Sidebar.ItemGroup>
          <Sidebar.ItemGroup>
            <Sidebar.Item>
            <div className="flex justify-center">
                <DarkThemeToggle />
              </div>
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </div>
  );
};

export default SideBar;