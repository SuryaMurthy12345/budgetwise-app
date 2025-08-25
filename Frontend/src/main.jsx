import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // 👈 use HashRouter
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
