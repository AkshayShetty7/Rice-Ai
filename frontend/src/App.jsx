import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "./i18n";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Detection from "./pages/Detection";
import Chatbot from "./pages/Chatbot";
import "./styles/global.css";

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/detection" element={<Detection />} />
          <Route path="/chatbot"   element={<Chatbot />} />
        
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
