export function OwnerGate({ active, onUnlock }) {
  if (active) return null;

  const handleSubmit = () => {
    const code = document.getElementById("ownerCodeInput")?.value || "";
    onUnlock(code);
  };

  return (
    <div className="owner-gate-overlay">
      <div className="owner-gate-panel">
        <h3>Owner Access Required</h3>
        <p>Enter your owner code to unlock the upload dashboard.</p>
        <input
          id="ownerCodeInput"
          type="password"
          placeholder="Owner access code"
        />
        <button className="btn-publish" type="button" onClick={handleSubmit}>
          Unlock
        </button>
        <p className="owner-gate-note">
          If you are a buyer, use the store page to browse and purchase
          documents.
        </p>
      </div>
    </div>
  );
}
