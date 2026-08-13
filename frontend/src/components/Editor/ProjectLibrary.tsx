import { useCallback, useEffect, useState } from 'react';
import { getProject, listProjects } from '../../api/client';
import { isGarmentType } from '../../lib/garments';
import { useEditorStore } from '../../stores/editorStore';

interface ProjectSummary {
  id: string;
  name: string;
  updated_at: string | null;
}

export default function ProjectLibrary() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setProjects(await listProjects());
    } catch (error) {
      console.error('Failed to list projects:', error);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const loadProject = useCallback(async (id: string) => {
    setLoadingId(id);
    try {
      const project = await getProject(id);
      const store = useEditorStore.getState();
      store.setProjectId(project.id);
      store.setProjectName(project.name);
      store.setTshirtColor(project.tshirt_color);
      store.setMockupCredit(project.mockup_credit ?? '');
      if (isGarmentType(project.garment_type)) store.setGarmentType(project.garment_type);
      if (project.front_canvas_json && store.frontCanvas) {
        await store.frontCanvas.loadFromJSON(project.front_canvas_json);
        store.frontCanvas.renderAll();
      }
      if (project.back_canvas_json && store.backCanvas) {
        await store.backCanvas.loadFromJSON(project.back_canvas_json);
        store.backCanvas.renderAll();
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Could not load this project.');
    } finally {
      setLoadingId(null);
    }
  }, []);

  return (
    <section className="sidebar-section project-library">
      <div className="section-heading">
        <span>Projects</span>
        <button type="button" className="icon-button" onClick={() => void refresh()} aria-label="Refresh projects">↻</button>
      </div>
      {projects.length === 0 ? (
        <p className="empty-state">Saved designs will appear here.</p>
      ) : (
        <div className="project-list">
          {projects.map((project) => (
            <button
              type="button"
              className="project-row"
              key={project.id}
              onClick={() => void loadProject(project.id)}
              disabled={loadingId === project.id}
            >
              <span>{project.name}</span>
              <small>{loadingId === project.id ? 'Loading…' : 'Open'}</small>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
