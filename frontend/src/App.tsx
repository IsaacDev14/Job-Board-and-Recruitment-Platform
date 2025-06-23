import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";


const AppRoutes = () => {
  return (
    <Routes>
      {/* Home page route */}
      <Route path="/" element={<Home/>} />
    </Routes>
  );
};

export default AppRoutes;
