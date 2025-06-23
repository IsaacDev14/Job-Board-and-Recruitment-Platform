import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import Topbar from "../components/Topbar"; // 👈 Importing Topbar here

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Topbar at the top */}
      <Topbar />

      {/* Main content below Topbar */}
      <div className="flex flex-col items-center justify-center px-4 text-center pt-20">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            Find Your Dream Job Effortlessly
          </h1>

          <p className="text-gray-600 mb-8 text-lg">
            A smarter platform that connects job seekers and recruiters. One stop, all careers.
          </p>

          <Link to="/jobs">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Browse Jobs
            </button>
          </Link>
        </motion.div>

        {/* Search Input */}
        <div className="mt-12 w-full max-w-md">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white">
            <input
              type="text"
              placeholder="Search job titles or keywords..."
              className="flex-1 p-3 outline-none"
            />
            <button className="bg-blue-600 p-3 text-white hover:bg-blue-700 transition">
              <FaSearch />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
