
import ScrollVideo from "../components/ScrollVideo";

const Index = () => {
  return (
    <div className="bg-black min-h-screen w-full relative">
      <ScrollVideo />
      {/* Black section below the fold */}
      <div className="w-full min-h-[100vh] bg-black flex items-center justify-center">
        {/* You can add more content here later if needed */}
      </div>
    </div>
  );
};

export default Index;
