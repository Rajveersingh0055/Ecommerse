import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function DashboardHomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("published");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/products");
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // Fix: use real isPublished field from DB instead of local state map
  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        activeTab === "published" ? p.isPublished : !p.isPublished,
      ),
    [products, activeTab],
  );

  // Fix: call real PATCH toggle API
  async function handleTogglePublish(productId) {
    try {
      await api.patch(`/products/${productId}/toggle`);
      await loadProducts();
    } catch {
      setError("Failed to toggle publish status.");
    }
  }

  const showEmptyState = !loading && !error && filteredProducts.length === 0;

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  }

  return (
    <section className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          Productr <span className="logo-dot" />
        </div>

        <div className="dashboard-search">Search</div>

        <nav className="dashboard-nav">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `dashboard-link ${isActive ? "active" : ""}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `dashboard-link ${isActive ? "active" : ""}`
            }
          >
            Products
          </NavLink>
        </nav>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar home-topbar">
          <div className="topbar-gradient" />
          <div className="topbar-left-title">Home</div>
          <div
            className="user-profile-section"
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "auto",
              gap: "10px",
            }}
          >
            <div className="topbar-avatar" style={{ marginLeft: 0 }} />
            <div className="topbar-arrow" style={{ marginRight: "15px" }}>
              âŒ„
            </div>
            <button
              onClick={handleLogout}
              className="action-secondary"
              style={{ padding: "4px 12px", fontSize: "13px" }}
            >
              Logout
            </button>
          </div>
        </header>

        <div className="home-tabs">
          <button
            className={`home-tab ${activeTab === "published" ? "active" : ""}`}
            onClick={() => setActiveTab("published")}
          >
            Published
          </button>
          <button
            className={`home-tab ${activeTab === "unpublished" ? "active" : ""}`}
            onClick={() => setActiveTab("unpublished")}
          >
            Unpublished
          </button>
        </div>

        <div className="dashboard-content">
          {loading && <p>Loading products...</p>}
          {error && <p className="error">{error}</p>}

          {filteredProducts.length > 0 && (
            <div className="dashboard-cards">
              {filteredProducts.map((product) => (
                <article key={product._id} className="dashboard-product-card">
                  <div className="card-media-wrap">
                    {/* Fix: use product.images[0] (new schema) */}
                    <img
                      src={
                        product.images?.[0] ||
                        "https://picsum.photos/600/400?random=99"
                      }
                      alt={product.name}
                    />
                  </div>

                  <div className="media-dots">
                    <span className="active" />
                    <span />
                    <span />
                    <span />
                  </div>

                  {/* Fix: use product.name */}
                  <h3>{product.name}</h3>

                  <dl className="product-meta">
                    <div>
                      <dt>Product type -</dt>
                      <dd>{product.type}</dd>
                    </div>
                    <div>
                      <dt>Quantity Stock -</dt>
                      <dd>{product.quantity}</dd>
                    </div>
                    <div>
                      <dt>MRP-</dt>
                      <dd>₹ {product.mrp}</dd>
                    </div>
                    <div>
                      <dt>Selling Price -</dt>
                      <dd>₹ {product.sellingPrice}</dd>
                    </div>
                    <div>
                      <dt>Brand Name -</dt>
                      <dd>{product.brand}</dd>
                    </div>
                    <div>
                      <dt>Total Number of images -</dt>
                      <dd>{product.images?.length ?? 0}</dd>
                    </div>
                  </dl>

                  <div className="card-actions">
                    <button
                      className={`action-primary ${product.isPublished ? "unpublish" : "publish"}`}
                      onClick={() => handleTogglePublish(product._id)}
                    >
                      {product.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      className="action-secondary"
                      onClick={() => navigate("/products")}
                    >
                      Edit
                    </button>
                    <button
                      className="action-icon"
                      onClick={() => navigate("/products")}
                    >
                      🗑
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {showEmptyState && (
            <div className="empty-state home-empty-state">
              <div className="empty-icon" aria-hidden="true">
                <span />
                <span />
                <span />
                <span className="plus" />
              </div>
              <h2>
                No {activeTab === "published" ? "Published" : "Unpublished"}{" "}
                Products
              </h2>
              <p>
                Your {activeTab === "published" ? "published" : "unpublished"}{" "}
                products will appear here
              </p>
              <p>Create your first product to publish</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
