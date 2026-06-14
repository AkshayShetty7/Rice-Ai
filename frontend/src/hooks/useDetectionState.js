import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "rice_detection_state";

/**
 * Reads the saved state from localStorage.
 * Returns { preview: base64String, result: object } or null.
 */
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Converts a File object to a base64 data-URL string.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}


export function useDetectionState() {
  const saved = loadSaved();

  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState(saved?.preview ?? null);
  const [result,     setResult]     = useState(saved?.result  ?? null);
  const [loading,    setLoading]    = useState(false);
  const [isRestored, setIsRestored] = useState(!!saved?.preview);

  // Persist preview + result whenever either changes
  useEffect(() => {
    if (!preview && !result) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ preview: preview ?? null, result: result ?? null })
      );
    } catch {
      // Storage quota exceeded – fail silently
    }
  }, [preview, result]);

  /** Load a new File selected by the user */
  const setImageFile = useCallback(async (f) => {
    if (!f) {
      setFile(null);
      setPreview(null);
      setResult(null);
      setIsRestored(false);
      return;
    }
    try {
      const b64 = await fileToBase64(f);
      setFile(f);
      setPreview(b64);
      setResult(null);      // new image → clear old result
      setIsRestored(false);
    } catch {
      // Fallback: use object URL if FileReader fails
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setIsRestored(false);
    }
  }, []);

  /** Wipe everything – called by the "Clear" button */
  const clearState = useCallback(() => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setIsRestored(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    file,
    preview,
    result,
    loading,
    isRestored,
    setImageFile,
    setResult,
    setLoading,
    clearState,
  };
}
