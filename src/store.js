import {
  supabase,
  isSupabaseEnabled,
  STORAGE_BUCKET,
  COVER_BUCKET,
} from "./supabaseClient.js";

export const STORE_KEY = "docvault_listings";

const createPublicUrl = (bucket, path) => {
  if (!path) return null;
  const result = supabase.storage.from(bucket).getPublicUrl(path);
  return result.error ? null : result.data.publicUrl;
};

const rowToListing = (row) => ({
  id: row.id?.toString() ?? "",
  title: row.title,
  price: parseFloat(row.price || 0),
  category: row.category,
  description: row.description,
  tags: Array.isArray(row.tags)
    ? row.tags
    : row.tags
      ? row.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
  fileName: row.file_name ?? "",
  fileSize: row.file_size ?? 0,
  filePath: row.file_path ?? "",
  coverPath: row.cover_path ?? null,
  coverImage: row.cover_path
    ? createPublicUrl(COVER_BUCKET, row.cover_path)
    : null,
  pdfUrl: row.file_path ? createPublicUrl(STORAGE_BUCKET, row.file_path) : null,
  createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
});

export const Store = {
  async getAll() {
    if (!isSupabaseEnabled) {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase getAll error:", error);
      return [];
    }

    return data.map(rowToListing);
  },

  async save(listing, pdfFile, coverFile) {
    if (!isSupabaseEnabled) {
      const all = this.getAll ? await this.getAll() : [];
      const saved = {
        ...listing,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      all.unshift(saved);
      localStorage.setItem(STORE_KEY, JSON.stringify(all));
      return saved;
    }

    const timestamp = Date.now();
    const filePath = `${timestamp}_${pdfFile.name}`;
    const pdfUpload = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, pdfFile, { cacheControl: "3600", upsert: false });

    if (pdfUpload.error) {
      throw pdfUpload.error;
    }

    let coverPath = null;
    if (coverFile) {
      coverPath = `${timestamp}_${coverFile.name}`;
      const coverUpload = await supabase.storage
        .from(COVER_BUCKET)
        .upload(coverPath, coverFile, { cacheControl: "3600", upsert: false });
      if (coverUpload.error) {
        throw coverUpload.error;
      }
    }

    const payload = {
      title: listing.title,
      price: listing.price,
      category: listing.category,
      description: listing.description,
      tags: listing.tags,
      file_name: pdfFile.name,
      file_size: pdfFile.size,
      file_path: filePath,
      cover_path: coverPath,
    };

    const { data, error } = await supabase
      .from("documents")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return rowToListing(data);
  },

  async delete(id) {
    if (!isSupabaseEnabled) {
      const all = (await this.getAll()).filter((l) => l.id !== id);
      localStorage.setItem(STORE_KEY, JSON.stringify(all));
      return;
    }

    const { data: rowData, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      return;
    }

    if (rowData.file_path) {
      await supabase.storage.from(STORAGE_BUCKET).remove([rowData.file_path]);
    }
    if (rowData.cover_path) {
      await supabase.storage.from(COVER_BUCKET).remove([rowData.cover_path]);
    }

    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete error:", error);
    }
  },
};
