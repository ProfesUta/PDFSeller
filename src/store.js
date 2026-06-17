export const STORE_KEY = "docvault_listings";

export const Store = {
  getAll() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  save(listing) {
    const all = this.getAll();
    listing.id = Date.now().toString();
    listing.createdAt = new Date().toISOString();
    all.unshift(listing);
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
    return listing;
  },

  delete(id) {
    const all = this.getAll().filter((l) => l.id !== id);
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  },

  getCategories() {
    const all = this.getAll();
    const cats = [...new Set(all.map((l) => l.category).filter(Boolean))];
    return cats.sort();
  },

  getStats() {
    const all = this.getAll();
    const revenue = all.reduce((sum, l) => sum + parseFloat(l.price || 0), 0);
    return { total: all.length, revenue };
  },
};
