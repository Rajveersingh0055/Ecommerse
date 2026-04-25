import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import DashboardHomePage from "./pages/DashboardHomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";

function App() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/" || location.pathname === "/signup";
  const isDashboardPage =
    location.pathname === "/products" || location.pathname === "/home";
  const useFluidLayout = isAuthPage || isDashboardPage;

  return (
    <div
      className={`app-shell ${isAuthPage ? "auth-shell" : ""} ${
        isDashboardPage ? "dashboard-shell" : ""
      }`}
    >
      {!useFluidLayout && (
        <header className="header">
          <h1 className="brand">Orufy Assignment</h1>
          <nav className="nav">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/products">Products</NavLink>
          </nav>
        </header>
      )}

      <main className={useFluidLayout ? "auth-main" : "main"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/home" element={<DashboardHomePage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
