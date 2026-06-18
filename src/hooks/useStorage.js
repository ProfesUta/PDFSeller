import { supabase } from "../supabaseClient";

/**
 * Custom hook for Supabase Storage operations
 */
export const useStorage = () => {
  /**
   * Upload a file to Supabase Storage
   * @param {string} bucketName - Name of the storage bucket
   * @param {string} filePath - Path where file will be stored (e.g., "documents/file.pdf")
   * @param {File} file - File object from input
   * @returns {Promise<{publicUrl: string} | {error: string}>}
   */
  const uploadFile = async (bucketName, filePath, file) => {
    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }

      // Upload file to storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true });

      if (error) {
        throw error;
      }

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        publicUrl: publicUrlData?.publicUrl,
        path: data?.path,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      return { error: error.message };
    }
  };

  /**
   * Delete a file from Supabase Storage
   * @param {string} bucketName - Name of the storage bucket
   * @param {string} filePath - Path of file to delete
   * @returns {Promise<{success: boolean} | {error: string}>}
   */
  const deleteFile = async (bucketName, filePath) => {
    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting file:", error);
      return { error: error.message };
    }
  };

  return {
    uploadFile,
    deleteFile,
  };
};
