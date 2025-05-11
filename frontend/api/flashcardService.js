import api from "./config";
export const getFlashcardsFolder = async () => {
  const { data } = await api.get("/api/flashcard-folders/user");
  return data;
};

export const createFlashcardFolder = async (folder) => {
  const { data } = await api.post("/api/flashcard-folders", folder);
  return data;
};
