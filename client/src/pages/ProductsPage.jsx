import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { api, resolveAssetUrl } from "../api.js";

const productTypes = [
  "Foods",
  "Electronics",
  "Clothes",
  "Beauty Products",
  "Others",
];

const initialForm = {
  productName: "",
  productType: "",
  quantityStock: "",
  mrp: "",
  sellingPrice: "",
  brandName: "",
  images: "", // comma-separated URLs
  isPublished: false,
};

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  // ── load products from API ────────────────────────────────────────────────
  async function loadProducts() {
    try {
      setLoading(true);
      setError("");
      // Backend returns a direct array of products now
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

  // ── helpers ───────────────────────────────────────────────────────────────
  function openAddModal() {
    setModalMode("add");
    setEditingId(null);
    setForm(initialForm);
    setIsTypeMenuOpen(false);
  }

  function openEditModal(product) {
    setModalMode("edit");
    setEditingId(product._id);
    // Fix: use product.name (new schema), not product.title
    setForm({
      productName: product.name ?? "",
      productType: product.type ?? "Foods",
      quantityStock: String(product.quantity ?? ""),
      mrp: String(product.mrp ?? ""),
      sellingPrice: String(product.sellingPrice ?? ""),
      brandName: product.brand ?? "",
      images: (product.images ?? []).join(", "),
      isPublished: product.isPublished ?? false,
    });
    setIsTypeMenuOpen(false);
  }

  function closeModal() {
    setModalMode(null);
    setIsTypeMenuOpen(false);
  }

  function openDeleteModal(product) {
    setDeleteTarget(product);
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
  }

  // ── save (create / update) ────────────────────────────────────────────────
  async function handleSaveProduct(event) {
    event.preventDefault();

    if (!form.productName.trim()) return;

    // Fix: send correct new schema fields via FormData for Multer
    const payload = new FormData();
    payload.append("name", form.productName.trim());
    payload.append("type", form.productType || "Others");
    payload.append("quantity", Number(form.quantityStock || 0));
    payload.append("mrp", Number(form.mrp || 0));
    payload.append("sellingPrice", Number(form.sellingPrice || 0));
    payload.append("brand", form.brandName.trim() || "Unknown");
    payload.append("isPublished", form.isPublished);

    // If images exist (they are currently files from input, or just string if untouched)
    if (form.images && Array.isArray(form.images)) {
      form.images.forEach((file) => payload.append("images", file));
    } else if (typeof form.images === "string") {
      // Just in case it's the old comma string
      payload.append("images", form.images);
    }

    try {
      setSaving(true);
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (modalMode === "edit" && editingId) {
        await api.put(`/products/${editingId}`, payload, config);
      } else {
        await api.post("/products", payload, config);
      }
      closeModal();
      setForm(initialForm);
      await loadProducts();
    } catch {
      setError("Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────
  async function handleDeleteProduct() {
    if (!deleteTarget) return;

    try {
      await api.delete(`/products/${deleteTarget._id}`);
      closeDeleteModal();
      await loadProducts();
    } catch {
      setError("Failed to delete product. Please try again.");
    }
  }

  // ── toggle publish (calls real API) ──────────────────────────────────────
  async function handleTogglePublish(productId) {
    try {
      // Fix: call PATCH /api/products/:id/toggle instead of only updating local state
      await api.patch(`/products/${productId}/toggle`);
      await loadProducts();
    } catch {
      setError("Failed to toggle publish status.");
    }
  }

  const showEmptyState = !loading && !error && products.length === 0;

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
        <header className="dashboard-topbar">
          <div className="topbar-gradient" />
          <div className="topbar-left-title">Products</div>
          <div className="topbar-search">Search Services, Products</div>
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

        <div className="dashboard-content">
          {loading && <p>Loading products...</p>}
          {error && <p className="error">{error}</p>}

          {!showEmptyState && (
            <div className="products-head-row">
              <h2>Products</h2>
              <button className="add-inline-btn" onClick={openAddModal}>
                + Add Products
              </button>
            </div>
          )}

          {showEmptyState && (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                <span />
                <span />
                <span />
                <span className="plus" />
              </div>
              <h2>Feels a little empty over here...</h2>
              <p>You can create products without connecting store</p>
              <p>you can add products to store anytime</p>
              <button className="add-products-btn" onClick={openAddModal}>
                Add your Products
              </button>
            </div>
          )}

          {products.length > 0 && (
            <div className="dashboard-cards">
              {products.map((product) => (
                <article key={product._id} className="dashboard-product-card">
                  <div className="card-media-wrap">
                    {/* Fix: use product.images[0] (new schema) */}
                    <img
                      src={
                        resolveAssetUrl(product.images?.[0]) ||
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
                    <div>
                      <dt>Status -</dt>
                      <dd>
                        {product.isPublished ? "Published" : "Unpublished"}
                      </dd>
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
                      onClick={() => openEditModal(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-icon"
                      onClick={() => openDeleteModal(product)}
                      aria-label="Delete product"
                    >
                      🗑
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────────────── */}
      {modalMode && (
        <div className="dashboard-modal-overlay" onClick={closeModal}>
          <div
            className="dashboard-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dashboard-modal-header">
              <h3>{modalMode === "edit" ? "Edit Product" : "Add Product"}</h3>
              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form className="dashboard-modal-form" onSubmit={handleSaveProduct}>
              <label>Product Name</label>
              <input
                placeholder="Enter product name"
                value={form.productName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, productName: e.target.value }))
                }
                required
              />

              <label>Product Type</label>
              <div className="product-type-wrap">
                <button
                  type="button"
                  className="select-display"
                  onClick={() => setIsTypeMenuOpen((prev) => !prev)}
                >
                  {form.productType || "Select product type"}
                  <span>⌄</span>
                </button>

                {isTypeMenuOpen && (
                  <ul className="type-menu">
                    {productTypes.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, productType: item }));
                            setIsTypeMenuOpen(false);
                          }}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <label>Quantity Stock</label>
              <input
                type="number"
                min="0"
                placeholder="Enter available stock"
                value={form.quantityStock}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    quantityStock: e.target.value,
                  }))
                }
              />

              <label>MRP (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="Enter MRP"
                value={form.mrp}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, mrp: e.target.value }))
                }
              />

              <label>Selling Price (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="Enter selling price"
                value={form.sellingPrice}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sellingPrice: e.target.value }))
                }
              />

              <label>Brand Name</label>
              <input
                placeholder="Enter brand name"
                value={form.brandName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, brandName: e.target.value }))
                }
              />

              <label>Upload Images (JPG, PNG, WEBP)</label>
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    images: Array.from(e.target.files),
                  }))
                }
              />

              <label>
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isPublished: e.target.checked,
                    }))
                  }
                />{" "}
                Publish immediately
              </label>

              <button
                className="modal-submit-btn"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? modalMode === "edit"
                    ? "Updating..."
                    : "Creating..."
                  : modalMode === "edit"
                    ? "Update"
                    : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ──────────────────────────────────────── */}
      {deleteTarget && (
        <div className="dashboard-modal-overlay" onClick={closeDeleteModal}>
          <div
            className="delete-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dashboard-modal-header compact">
              <h3>Delete Product</h3>
              <button
                type="button"
                className="modal-close"
                onClick={closeDeleteModal}
              >
                ×
              </button>
            </div>

            <div className="delete-modal-body">
              <p>
                Are you sure you really want to delete{" "}
                {/* Fix: use deleteTarget.name */}
                <strong>"{deleteTarget.name}"</strong>?
              </p>
              <button className="delete-cta" onClick={handleDeleteProduct}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
