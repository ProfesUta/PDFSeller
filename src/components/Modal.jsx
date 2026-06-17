export function Modal({ listing, onClose }) {
  if (!listing) return null;

  const isFree = parseFloat(listing.price) === 0;

  const handleDownload = () => {
    if (!listing.fileData) {
      window.alert(
        "File not available for download. (Demo mode — upload a real PDF to enable downloads.)",
      );
      return;
    }
    const link = document.createElement("a");
    link.href = listing.fileData;
    link.download = listing.fileName || `${listing.title}.pdf`;
    link.click();
    onClose();
  };

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        {listing.coverImage ? (
          <img
            className="modal-cover"
            src={listing.coverImage}
            alt={listing.title}
          />
        ) : (
          <div className="modal-cover-placeholder">📄</div>
        )}
        <div className="modal-cat">{listing.category || "Document"}</div>
        <div className="modal-title">{listing.title}</div>
        <div className="modal-desc">{listing.description}</div>
        {listing.tags?.length ? (
          <div className="modal-tags">
            {listing.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="modal-price-row">
          <span className={`modal-price ${isFree ? "free" : ""}`}>
            {isFree ? "Free" : `$${parseFloat(listing.price).toFixed(2)}`}
          </span>
          <button
            className="btn-purchase"
            type="button"
            onClick={handleDownload}
          >
            {isFree ? "⬇ Download Free" : "💳 Purchase & Download"}
          </button>
        </div>
      </div>
    </div>
  );
}
