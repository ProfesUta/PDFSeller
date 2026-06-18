import { supabase } from "../supabaseClient";

/**
 * Custom hook for Supabase Database (PostgreSQL) operations
 */
export const useDatabase = () => {
  /**
   * Fetch all rows from a table
   * @param {string} tableName - Name of the table
   * @returns {Promise<{data: Array} | {error: string}>}
   */
  const getAll = async (tableName) => {
    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }

      const { data, error } = await supabase.from(tableName).select("*");

      if (error) {
        throw error;
      }

      return { data };
    } catch (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      return { error: error.message };
    }
  };

  /**
   * Insert a single row into a table
   * @param {string} tableName - Name of the table
   * @param {Object} data - Object containing column values
   * @returns {Promise<{data: Object} | {error: string}>}
   */
  const insert = async (tableName, data) => {
    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }

      const { data: insertedData, error } = await supabase
        .from(tableName)
        .insert([data])
        .select();

      if (error) {
        throw error;
      }

      return { data: insertedData?.[0] };
    } catch (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      return { error: error.message };
    }
  };

  /**
   * Update a row in a table
   * @param {string} tableName - Name of the table
   * @param {number|string} id - Primary key value (id)
   * @param {Object} data - Object containing updated column values
   * @returns {Promise<{data: Object} | {error: string}>}
   */
  const update = async (tableName, id, data) => {
    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }

      const { data: updatedData, error } = await supabase
        .from(tableName)
        .update(data)
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      return { data: updatedData?.[0] };
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      return { error: error.message };
    }
  };

  /**
   * Delete a row from a table
   * @param {string} tableName - Name of the table
   * @param {number|string} id - Primary key value (id)
   * @returns {Promise<{success: boolean} | {error: string}>}
   */
  const remove = async (tableName, id) => {
    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }

      const { error } = await supabase.from(tableName).delete().eq("id", id);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      return { error: error.message };
    }
  };

  return {
    getAll,
    insert,
    update,
    remove,
  };
};
