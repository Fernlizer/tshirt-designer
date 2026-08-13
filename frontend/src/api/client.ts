import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Upload
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload', formData);
  return data;
};

export const listImages = async () => {
  const { data } = await api.get('/images');
  return data;
};

export const deleteImage = async (filename: string) => {
  await api.delete(`/images/${filename}`);
};

// Projects
export const createProject = async (name?: string, tshirtColor?: string) => {
  const { data } = await api.post('/projects', { name, tshirt_color: tshirtColor });
  return data;
};

export const listProjects = async () => {
  const { data } = await api.get('/projects');
  return data;
};

export const getProject = async (id: string) => {
  const { data } = await api.get(`/projects/${id}`);
  return data;
};

export const updateProject = async (id: string, updates: Record<string, unknown>) => {
  const { data } = await api.put(`/projects/${id}`, updates);
  return data;
};

export const deleteProject = async (id: string) => {
  await api.delete(`/projects/${id}`);
};

// Mockup
export const generateMockup = async (designImageB64: string, side: string, tshirtColor: string) => {
  const { data } = await api.post('/mockup/generate', {
    design_image_b64: designImageB64,
    side,
    tshirt_color: tshirtColor,
  });
  return data;
};
