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

export const deleteFlashcard = async (id) => {
  const { data } = await api.delete(`/api/flashcards/${id}`);
  return data;
};

export const editFlashcardStatus = async (id, status) => {
  const { data } = await api.patch(
    `/api/flashcards/${id}/status?status=${status}`
  );
  return data;
};

export const updateFlashcard = async (
  id,
  { frontContent, backContent, status }
) => {
  const { data } = await api.put(`/api/flashcards/${id}`, {
    frontContent,
    backContent,
    status,
  });
  return data;
};

export const addFlashcard = async ({ frontContent, backContent, status }) => {
  const { data } = await api.post("/api/flashcards", {
    frontContent,
    backContent,
    status,
  });
  return data;
};

export const addFlashcardToFolder = async (folderId, flashcardId) => {
  await api.post(`/api/flashcard-folders/${folderId}/flashcards`, {
    flashcardIds: [flashcardId],
  });
};

export const editFolderName = async (id, name) => {
  const { data } = await api.put(
    `/api/flashcard-folders/${id}?name=${encodeURIComponent(name)}`
  );
  return data;
};

export const importFlashcardFolder = async (id) => {
  const { data } = await api.post(`/api/flashcard-folders/${id}/import`);
  return data;
};
