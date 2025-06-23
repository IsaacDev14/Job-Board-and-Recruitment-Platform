import { motion } from "framer-motion"; // For animation
import { FaSearch } from "react-icons/fa"; // For icon

const Home = () => {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center px-4 text-center">
      {/* Animated heading */}
      <motion.h1
        className="text-4xl md:text-6xl font-bold text-gray-800 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Find Your Dream Job
      </motion.h1>

      {/* Subheading */}
      <p className="text-gray-600 text-lg md:text-xl max-w-xl mb-6">
        Explore hundreds of job opportunities across industries. Apply, track, and grow your career from one platform.
      </p>

      {/* Search bar */}
      <div className="w-full max-w-md flex items-center bg-gray-100 p-2 rounded-lg shadow-md">
        <FaSearch className="text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="Search for jobs..."
          className="flex-1 bg-transparent p-2 pl-4 outline-none text-gray-700"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
          Search
        </button>
      </div>
    </main>
  );
};

export default Home;
