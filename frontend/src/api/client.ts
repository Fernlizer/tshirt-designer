import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let editorCsrfToken: string | null = null;
let turnstileSiteKey: string | null = null;

api.interceptors.request.use((config) => {
  if (editorCsrfToken) config.headers.set('X-Editor-CSRF', editorCsrfToken);
  return config;
});

export const startEditorSession = async () => {
  const { data } = await api.post('/security/editor-session');
  editorCsrfToken = data.csrf_token;
  turnstileSiteKey = data.turnstile_site_key ?? null;
  return data;
};

declare global { interface Window { turnstile?: { render: (container: HTMLElement, options: Record<string, unknown>) => string; execute: (widgetId: string) => void; }; } }

const getTurnstileToken = async (): Promise<string | undefined> => {
  if (!turnstileSiteKey) return undefined;
  if (!window.turnstile) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Could not load bot protection'));
      document.head.append(script);
    });
  }
  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.append(container);
    const cleanup = () => container.remove();
    const widgetId = window.turnstile!.render(container, {
      sitekey: turnstileSiteKey,
      size: 'invisible',
      callback: (token: string) => { cleanup(); resolve(token); },
      'error-callback': () => { cleanup(); reject(new Error('Bot protection failed')); },
    });
    window.turnstile!.execute(widgetId);
  });
};

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

export const removeImageBackground = async (filename: string) => {
  const turnstileToken = await getTurnstileToken();
  const { data } = await api.post('/images/remove-background', { filename, turnstile_token: turnstileToken });
  return data;
};

// Projects
export interface ProjectPayload {
  name: string;
  tshirt_color: string;
  garment_type: string;
  mockup_credit: string;
  front_canvas_json: string | null;
  back_canvas_json: string | null;
}

export const createProject = async (project: ProjectPayload) => {
  const { data } = await api.post('/projects', project);
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

export const updateProject = async (id: string, updates: ProjectPayload) => {
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
