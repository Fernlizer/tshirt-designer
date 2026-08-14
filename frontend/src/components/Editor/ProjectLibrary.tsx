import { useCallback, useEffect, useState } from 'react';
import { deleteProject, getProject, listProjects } from '../../api/client';
import { isGarmentType } from '../../lib/garments';
import { loadProjectArtwork } from '../../lib/projectCanvas';
import { useEditorStore } from '../../stores/editorStore';
import { useFeedback } from '../Feedback/FeedbackProvider';

interface ProjectSummary {
  id: string;
  name: string;
  updated_at: string | null;
}

export default function ProjectLibrary() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { confirm, notify } = useFeedback();

  const refresh = useCallback(async () => {
    try {
      setProjects(await listProjects());
    } catch (error) {
      console.error('Failed to list projects:', error);
    }
  }, []);

  useEffect(() => {
    void refresh();
    window.addEventListener('projects:changed', refresh);
    return () => window.removeEventListener('projects:changed', refresh);
  }, [refresh]);

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
        await loadProjectArtwork(store.frontCanvas, project.front_canvas_json);
      }
      if (project.back_canvas_json && store.backCanvas) {
        await loadProjectArtwork(store.backCanvas, project.back_canvas_json);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      notify({ tone: 'error', title: 'Could not open project', message: 'Please try again.' });
    } finally {
      setLoadingId(null);
    }
  }, [notify]);

  const removeProject = useCallback(async (project: ProjectSummary) => {
    const confirmed = await confirm({
      title: 'Delete this project?',
      message: `“${project.name}” and its saved artwork will be permanently removed.`,
      confirmLabel: 'Delete project',
      tone: 'danger',
    });
    if (!confirmed) return;

    setLoadingId(project.id);
    try {
      await deleteProject(project.id);
      const store = useEditorStore.getState();
      if (store.projectId === project.id) store.setProjectId(null);
      await refresh();
      notify({ tone: 'success', title: 'Project deleted', message: `“${project.name}” was removed.` });
    } catch (error) {
      console.error('Failed to delete project:', error);
      notify({ tone: 'error', title: 'Could not delete project', message: 'Please try again.' });
    } finally {
      setLoadingId(null);
    }
  }, [confirm, notify, refresh]);

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
            <div className="project-row" key={project.id}>
              <span>{project.name}</span>
              <div className="project-row-actions">
                <button
                  type="button"
                  className="project-open-button"
                  onClick={() => void loadProject(project.id)}
                  disabled={loadingId === project.id}
                >
                  {loadingId === project.id ? 'Loading…' : 'Open'}
                </button>
                <button
                  type="button"
                  className="project-delete-button"
                  onClick={() => void removeProject(project)}
                  disabled={loadingId === project.id}
                  aria-label={`Delete ${project.name}`}
                  title="Delete project"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
