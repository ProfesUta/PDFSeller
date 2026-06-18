import { useState } from "react";
import { useStorage } from "../hooks/useStorage";
import { useDatabase } from "../hooks/useDatabase";

/**
 * Example component demonstrating Supabase file upload and database operations
 */
export const SupabaseExample = () => {
  const { uploadFile, deleteFile } = useStorage();
  const { insert, getAll, update, remove } = useDatabase();

  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle file upload to Supabase Storage
   * 1. Gets file from input
   * 2. Uploads to storage bucket
   * 3. Inserts record in database with file URL
   */
  const handleFileUpload = async (e) => {
    try {
      setError(null);
      setUploading(true);

      const file = e.target.files?.[0];
      if (!file) {
        setError("No file selected");
        return;
      }

      // Generate unique file path
      const timestamp = Date.now();
      const filePath = `uploads/${timestamp}-${file.name}`;

      // Upload file to storage
      const uploadResult = await uploadFile("SasurveiFaili", filePath, file);
      if (uploadResult.error) {
        setError(uploadResult.error);
        return;
      }

      // Insert record in database
      const dbResult = await insert("documents", {
        title: file.name,
        file_url: uploadResult.publicUrl,
        file_path: uploadResult.path,
        created_at: new Date().toISOString(),
      });

      if (dbResult.error) {
        setError(dbResult.error);
        return;
      }

      setFileName(`Uploaded: ${file.name}`);
      fetchRecords(); // Refresh records list
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Fetch all records from database
   */
  const fetchRecords = async () => {
    try {
      setError(null);
      setLoading(true);

      const result = await getAll("documents");
      if (result.error) {
        setError(result.error);
        return;
      }

      setRecords(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update a record in the database
   */
  const handleUpdateRecord = async (id, newTitle) => {
    try {
      setError(null);

      const result = await update("documents", id, {
        title: newTitle,
        updated_at: new Date().toISOString(),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      fetchRecords(); // Refresh records
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Delete a record from the database
   */
  const handleDeleteRecord = async (id) => {
    try {
      setError(null);

      const result = await remove("documents", id);
      if (result.error) {
        setError(result.error);
        return;
      }

      fetchRecords(); // Refresh records
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Supabase Example</h2>

      {/* Error display */}
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>Error: {error}</div>
      )}

      {/* File upload section */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Upload File</h3>
        <input type="file" onChange={handleFileUpload} disabled={uploading} />
        {uploading && <p>Uploading...</p>}
        {fileName && <p style={{ color: "green" }}>{fileName}</p>}
      </div>

      {/* Records section */}
      <div>
        <h3>Documents</h3>
        <button onClick={fetchRecords} disabled={loading}>
          {loading ? "Loading..." : "Fetch Records"}
        </button>

        {records.length > 0 ? (
          <ul style={{ marginTop: "10px" }}>
            {records.map((record) => (
              <li key={record.id} style={{ marginBottom: "10px" }}>
                <div>
                  <strong>Title:</strong> {record.title}
                </div>
                <div>
                  <strong>URL:</strong>{" "}
                  <a
                    href={record.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View File
                  </a>
                </div>
                <button
                  onClick={() => {
                    const newTitle = prompt("Enter new title:", record.title);
                    if (newTitle) handleUpdateRecord(record.id, newTitle);
                  }}
                  style={{ marginRight: "5px" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRecord(record.id)}
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No records found</p>
        )}
      </div>
    </div>
  );
};
