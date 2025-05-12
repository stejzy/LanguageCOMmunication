import api from "./config";
export const getFlashcardManyFolder = async () => {
  const { data } = await api.get("/api/flashcard-folders/user");
  return data;
};

export const createFlashcardFolder = async (folder) => {
  const { data } = await api.post("/api/flashcard-folders", folder);
  return data;
};

export const deleteFlashcardFolder = async (id) => {
  const { data } = await api.delete(`/api/flashcard-folders/${id}`);
};

export const getFlashcardOneFolder = async (id) => {
  const { data } = await api.get(`/api/flashcard-folders/${id}`);
  return data;
};
