import { useEffect, useMemo, useState } from "react";
import { Store } from "../store.js";
import { Modal } from "../components/Modal.jsx";
import { Header } from "../components/Header.jsx";

export default function Storefront() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [modalListing, setModalListing] = useState(null);

  useEffect(() => {
    async function loadListings() {
      const items = await Store.getAll();
      setListings(items);
    }
    loadListings();
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(listings.map((l) => l.category).filter(Boolean))];
    return cats.sort();
  }, [listings]);

  const filtered = useMemo(() => {
    return listings.filter((listing) => {
      const matchesCategory =
        category === "all" || listing.category === category;
      const matchesSearch = search
        ? [listing.title, listing.description, ...(listing.tags || [])]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [category, search, listings]);

  return (
    <div>
      <Header active="browse" />
      <main>
        <section className="hero">
          <div className="hero-tag">PDF Marketplace</div>
          <h1 className="hero-title">
            Knowledge you can
            <br />
            <em>download instantly.</em>
          </h1>
          <p className="hero-sub">
            Curated PDFs — guides, templates, research, and more. Pay once, own
            it forever.
          </p>
          <div className="hero-search">
            <input
              type="text"
              id="searchInput"
              placeholder="Search documents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearch(e.target.value)}
            />
            <button onClick={() => setSearch(search)}>Search</button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span id="totalDocs">{filtered.length}</span>
              <label>Documents</label>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span>Instant</span>
              <label>Delivery</label>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span>Secure</span>
              <label>Checkout</label>
            </div>
          </div>
        </section>

        <section className="categories-section">
          <div className="container">
            <div className="categories" id="categoriesBar">
              <button
                className={`cat-btn ${category === "all" ? "active" : ""}`}
                onClick={() => setCategory("all")}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`cat-btn ${category === cat ? "active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="products-section">
          <div className="container">
            <div className="products-header">
              <h2>Available Documents</h2>
              <span id="resultCount" className="result-count">
                {filtered.length > 0 ? `${filtered.length} documents` : ""}
              </span>
            </div>
            <div className="products-grid" id="productsGrid">
              {filtered.length === 0 ? (
                <div className="empty-state" style={{ display: "block" }}>
                  <div className="empty-icon">📄</div>
                  <p>
                    No documents found.
                    <br />
                    Try a different search or check back later.
                  </p>
                </div>
              ) : (
                filtered.map((listing) => (
                  <div
                    className="product-card"
                    key={listing.id}
                    onClick={() => setModalListing(listing)}
                  >
                    {listing.coverImage ? (
                      <img
                        className="product-cover"
                        src={listing.coverImage}
                        alt={listing.title}
                      />
                    ) : (
                      <div className="product-cover-placeholder">📄</div>
                    )}
                    <div className="product-body">
                      <div className="product-category">
                        {listing.category || "Document"}
                      </div>
                      <div className="product-title">{listing.title}</div>
                      <div className="product-desc">{listing.description}</div>
                      {listing.tags?.length ? (
                        <div className="product-tags">
                          {listing.tags.slice(0, 3).map((tag) => (
                            <span className="tag" key={tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div className="product-footer">
                        <span
                          className={`product-price ${parseFloat(listing.price) === 0 ? "free" : ""}`}
                        >
                          {parseFloat(listing.price) === 0
                            ? "Free"
                            : `$${parseFloat(listing.price).toFixed(2)}`}
                        </span>
                        <button
                          className="btn-buy"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalListing(listing);
                          }}
                        >
                          {parseFloat(listing.price) === 0
                            ? "Get Free"
                            : "Buy Now"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <Modal listing={modalListing} onClose={() => setModalListing(null)} />
    </div>
  );
}
