import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";

const Topbar = () => {
  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/" className="text-xl font-bold text-blue-600">
          JobBoardPro
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link to="/jobs" className="text-gray-700 hover:text-blue-600">
            Jobs
          </Link>
          <Link to="/login" className="text-gray-700 hover:text-blue-600">
            Login
          </Link>
          <Link to="/register" className="text-gray-700 hover:text-blue-600">
            Register
          </Link>
        </nav>

        {/* Mobile Menu Icon */}
        <div className="md:hidden text-gray-600 text-xl cursor-pointer">
          <FaBars />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
