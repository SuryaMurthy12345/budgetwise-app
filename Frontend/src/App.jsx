import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Login from "./auth/Login";
import Register from "./auth/Register";
import PageNotFound from "./pages/PageNotFound";
import Screen from "./pages/Screen";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Everything under /screen handled by Screen.jsx */}
        <Route path="/screen/*" element={<Screen />} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
