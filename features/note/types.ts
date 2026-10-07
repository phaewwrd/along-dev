export type ProjectNoteDTO = {
  id: string;
  projectId: string;
  content: string;
  createdBy: {
    id: string;
    name: string;
    image: string | null;
  };
  createdAt: string;
  updatedAt: string;
};
