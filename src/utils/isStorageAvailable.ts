export function isStorageAvailable(): boolean {
  try {
    const k = "__wc_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}
