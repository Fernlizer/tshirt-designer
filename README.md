# 👕 T-Shirt Design Studio

A web-based T-shirt design tool that lets you create custom designs with drag-and-drop, image upload, and mockup generation.

## Features

- 🎨 **Canvas Editor** - Drag, drop, resize, rotate images on a T-shirt template
- 📤 **Image Upload** - Import PNG, JPG, SVG, WebP files
- 👕 **Front & Back** - Design both sides independently
- 🎨 **Color Picker** - Choose from preset colors or custom hex
- ✏️ **Editable Text Tool** - Double-click text on the canvas to edit it, or use the Text Properties panel to change content, font family, size, color, weight, italic, underline, and alignment
- 🧍 **Mockup Preview** - Generate mockup on a T-shirt template
- 💾 **Project Library** - Save front and back artwork together, reopen saved projects without losing the garment template or print guides, and delete projects with an in-app confirmation dialog
- ✨ **In-app Feedback** - Styled toast notifications for save, upload, export, and error feedback; no browser alert popups
- 👔 **Garment Templates** - Design on realistic Classic Tee, Oversized Tee, and Hoodie front/back templates
- 📐 **Alignment Guides** - Use the full-garment grid, center horizontally without changing height, or center within the safe print area

## Alignment controls

The design canvas includes a full-garment grid for checking placement. Choose **Center horizontally** to correct only left/right alignment while preserving the layer's vertical position, or choose **Center in print area** to reset the layer to the exact print-area center.

![Hoodie alignment controls](docs/alignment-controls-example.png)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Fabric.js 6 |
| Backend | FastAPI + SQLAlchemy + Pillow |
| Database | SQLite (async) |
| Container | Docker + Docker Compose |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Fernlizer/tshirt-designer.git
cd tshirt-designer

# Start with Docker
docker compose up --build

# Access the app
# Frontend: http://localhost:9005
# Backend API: http://localhost:9004
# API Docs: http://localhost:9004/docs
```

## Ports

| Service | Port |
|---------|------|
| Frontend | 9005 |
| Backend API | 9004 |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | Upload image |
| GET | `/api/images` | List uploaded images |
| DELETE | `/api/images/{filename}` | Delete image |
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/{id}` | Get project |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project |
| POST | `/api/mockup/generate` | Generate mockup |

## Development

```bash
# Backend only
cd backend
pip install -e .
uvicorn app.main:app --reload --port 9004

# Frontend only
cd frontend
npm install
npm run dev
```

When running the frontend outside Docker, its development proxy uses `http://localhost:9004` by default. Docker Compose supplies the internal backend address automatically.

## Project workflow

1. Add images or text to either the Front or Back canvas.
2. Select text to use the Text Properties panel, or double-click it to type directly on the canvas.
3. Choose **Save** to create a project or update the project currently open.
4. Use **Projects** in the left sidebar to reopen or delete saved work. Delete opens an in-app confirmation dialog and cannot be undone.

Artwork is persisted separately from the garment template and alignment guides, so opening a project restores the design while retaining the current editor surface.

## License

MIT
