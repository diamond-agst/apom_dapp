const mem = new Map<string, string>();

function storageAvailable(): boolean {
  try {
    const k = "__wc_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export const safeStorage = {
  available: storageAvailable(),

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.available) {
        return window.localStorage.getItem(key);
      }
      return mem.get(key) ?? null;
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.available) {
        window.localStorage.setItem(key, value);
      } else {
        mem.set(key, value);
      }
    } catch {
      // blocked
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (this.available) {
        window.localStorage.removeItem(key);
      } else {
        mem.delete(key);
      }
    } catch {
      // ignore
    }
  },
};
