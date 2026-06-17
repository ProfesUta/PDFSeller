import { useEffect, useState } from "react";
import { Store } from "../store.js";
import { Header } from "../components/Header.jsx";
import { OwnerGate } from "../components/OwnerGate.jsx";

const OWNER_KEY = "docvault_owner";
const OWNER_CODE = "shesiroo";

function isOwner() {
  return localStorage.getItem(OWNER_KEY) === "true";
}

export default function Admin() {
  const [listings, setListings] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [ownerMode, setOwnerMode] = useState(isOwner());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    tags: "",
  });

  useEffect(() => {
    setListings(Store.getAll());
  }, [ownerMode]);

  const stats = {
    total: listings.length,
    revenue: listings.reduce((sum, l) => sum + parseFloat(l.price || 0), 0),
  };

  const resetForm = () => {
    setForm({ title: "", price: "", category: "", description: "", tags: "" });
    setSelectedFile(null);
    setSelectedImage(null);
  };

  const publishDocument = async () => {
    setError("");
    setSuccess("");

    if (!ownerMode) {
      setError("Owner access required to publish documents.");
      return;
    }

    if (!form.title.trim()) return setError("Please enter a document title.");
    if (form.price === "")
      return setError("Please enter a price (use 0 for free).");
    if (!form.category) return setError("Please select a category.");
    if (!form.description.trim())
      return setError("Please add a short description.");
    if (!selectedFile) return setError("Please select a PDF file to upload.");

    const fileData = await readFileAsDataURL(selectedFile);
    const tags = form.tags
      ? form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    Store.save({
      title: form.title,
      price: parseFloat(form.price) || 0,
      category: form.category,
      description: form.description,
      tags,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileData,
      coverImage: selectedImage || null,
    });

    setSuccess(
      "✅ Document published successfully! It's now live in your store.",
    );
    resetForm();
    setListings(Store.getAll());
  };

  const readFileAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf")
      return setError("Only PDF files are accepted.");
    if (file.size > 50 * 1024 * 1024)
      return setError("File too large. Maximum size is 50MB.");
    setError("");
    setSelectedFile(file);
  };

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return setError("Please select a valid image file.");
    if (file.size > 5 * 1024 * 1024)
      return setError("Image too large. Maximum size is 5MB.");
    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const deleteListing = (id) => {
    Store.delete(id);
    setListings(Store.getAll());
  };

  const unlockOwner = (code) => {
    if (code === OWNER_CODE) {
      localStorage.setItem(OWNER_KEY, "true");
      setOwnerMode(true);
      setError("");
      return;
    }
    setError("Incorrect owner code. Please try again.");
  };

  return (
    <div>
      <Header active="upload" />
      <OwnerGate active={ownerMode} onUnlock={unlockOwner} />
      <main>
        <section className="admin-hero">
          <div className="container">
            <div className="admin-hero-text">
              <div className="hero-tag">Seller Dashboard</div>
              <h1>Publish your PDF</h1>
              <p>
                Upload a document, set your price, and start selling
                immediately.
              </p>
            </div>
            <div className="admin-stats-row">
              <div className="admin-stat-card">
                <span id="adminTotal">{stats.total}</span>
                <label>Listed</label>
              </div>
              <div className="admin-stat-card accent">
                <span id="adminRevenue">${stats.revenue.toFixed(2)}</span>
                <label>Est. Revenue</label>
              </div>
            </div>
          </div>
        </section>

        <section className="upload-section">
          <div className="container upload-layout">
            <div className="upload-form-card">
              <h2>New Listing</h2>
              {error && <div className="form-error">{error}</div>}
              {success && <div className="form-success">{success}</div>}
              <div className="form-group">
                <label>Document Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Complete Python Cheat Sheet"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (USD) *</label>
                  <div className="input-prefix">
                    <span>$</span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      placeholder="9.99"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="">Select…</option>
                    <option>Business</option>
                    <option>Technology</option>
                    <option>Design</option>
                    <option>Finance</option>
                    <option>Education</option>
                    <option>Health</option>
                    <option>Legal</option>
                    <option>Marketing</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Short Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows="3"
                  placeholder="What will buyers get from this document?"
                />
              </div>
              <div className="form-group">
                <label>
                  Tags <span className="optional">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. python, programming, reference"
                />
              </div>
              <div className="form-group">
                <label>PDF File *</label>
                <div
                  className="file-drop"
                  onClick={() =>
                    document.getElementById("adminPdfFile").click()
                  }
                >
                  <div className="file-drop-icon">📄</div>
                  <p>Click to select or drag & drop your PDF</p>
                  <span className="file-hint">PDF files only · Max 50MB</span>
                  <input
                    id="adminPdfFile"
                    type="file"
                    accept=".pdf"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                </div>
                {selectedFile && (
                  <div className="file-selected" style={{ display: "flex" }}>
                    <span className="file-icon">📄</span>
                    <div className="file-info">
                      <strong>{selectedFile.name}</strong>
                      <small>{(selectedFile.size / 1024).toFixed(1)} KB</small>
                    </div>
                    <button
                      className="file-remove"
                      type="button"
                      onClick={() => setSelectedFile(null)}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>
                  Cover Image <span className="optional">(optional)</span>
                </label>
                <div
                  className="file-drop small"
                  onClick={() =>
                    document.getElementById("adminCoverImg").click()
                  }
                >
                  <div className="file-drop-icon">🖼</div>
                  <p>Click to upload cover image</p>
                  <span className="file-hint">JPG, PNG · Max 5MB</span>
                  <input
                    id="adminCoverImg"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleImageSelect(e.target.files[0])}
                  />
                </div>
                {selectedImage && (
                  <div id="imgPreviewWrap" style={{ display: "block" }}>
                    <img
                      id="imgPreview"
                      className="img-preview"
                      src={selectedImage}
                      alt="Preview"
                    />
                    <button
                      className="file-remove"
                      type="button"
                      onClick={() => setSelectedImage(null)}
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>
              <button
                className="btn-publish"
                type="button"
                onClick={publishDocument}
              >
                <span id="publishLabel">Publish Document</span>
              </button>
            </div>
            <div className="listings-panel">
              <h2>Your Listings</h2>
              <div id="listingsContainer">
                {listings.length === 0 ? (
                  <div className="empty-listings">
                    No documents yet.
                    <br />
                    Upload your first PDF to get started.
                  </div>
                ) : (
                  listings.map((listing) => (
                    <div className="listing-item" key={listing.id}>
                      <div className="listing-thumb">
                        {listing.coverImage ? (
                          <img src={listing.coverImage} alt="" />
                        ) : (
                          "📄"
                        )}
                      </div>

                      <div className="listing-info">
                        <div className="listing-title">{listing.title}</div>
                        <div className="listing-meta">
                          <span>{listing.category || "—"}</span>
                          <span>{(listing.fileSize / 1024).toFixed(1)} KB</span>
                          <span>
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="listing-actions">
                        <span className="listing-price-badge">
                          {parseFloat(listing.price) === 0
                            ? "Free"
                            : `$${parseFloat(listing.price).toFixed(2)}`}
                        </span>
                        <button
                          className="btn-icon"
                          type="button"
                          onClick={() => deleteListing(listing.id)}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
