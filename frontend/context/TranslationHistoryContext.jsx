import React, { createContext, useContext, useEffect, useState } from "react";
import { translationHistory, deleteTranslationById } from "@/api/translationService";
import { AuthContext } from "@/context/AuthContext";

// Tworzenie kontekstu
export const TranslationHistoryContext = createContext();

export const TranslationHistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authState } = useContext(AuthContext);

  useEffect(() => {
    if (authState.authenticated) {
      const fetchHistory = async () => {
        try {
          await refreshHistory();
        } catch (err) {
          console.error("Failed to fetch translation history:", err);
        }
      };
      fetchHistory();
    }
  }, [authState.authenticated]);

  useEffect(() => {
    console.log("History downloading:", loading);
  }, [loading]);

  useEffect(() => {
    console.log("Updated history:", history);
  }, [history]);

   
  const refreshHistory = async () => {
    try {
      setLoading(true);
      const data = await translationHistory();
      setHistory(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to refresh history from backend:", error);
      setLoading(false);
    }
  };

  const addAndRefresh = async (entry) => {
    setHistory((prev) => [entry, ...prev]);
    // await refreshHistory();
  };

  const deleteAndRefresh = async (id) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  };

  const deleteFunc =  async (id) => {
    deleteTranslationById(id, deleteAndRefresh);
  };


  return (
    <TranslationHistoryContext.Provider
      value={{ history, loading, addAndRefresh, deleteFunc, deleteAndRefresh, refreshHistory }}
    >
      {children}
    </TranslationHistoryContext.Provider>
  );
};
