import Navbar from '../components/Navbar';

const Hello = () => {
  return (
    <div>
      <Navbar />
      <div className="p-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
      </div>
    </div>
  );
};

export default Hello;