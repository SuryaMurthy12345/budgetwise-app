import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProfileForm from "./pages/ProfileForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/profile" element={<Profile/>} />
      <Route path="/profileForm" element={<ProfileForm/>} />

    </Routes>
  );
}

export default App;
