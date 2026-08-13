from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Literal
from pydantic import BaseModel
from app.core.database import get_db
from app.services.project_service import project_service

router = APIRouter(prefix="/api/projects", tags=["projects"])


class ProjectCreate(BaseModel):
    name: str = "Untitled Design"
    tshirt_color: str = "#FFFFFF"
    garment_type: Literal["tshirt", "oversized", "hoodie"] = "tshirt"
    mockup_credit: str = ""


class ProjectUpdate(BaseModel):
    name: str | None = None
    tshirt_color: str | None = None
    garment_type: Literal["tshirt", "oversized", "hoodie"] | None = None
    mockup_credit: str | None = None
    front_canvas_json: str | None = None
    back_canvas_json: str | None = None


@router.post("")
async def create_project(body: ProjectCreate, db: AsyncSession = Depends(get_db)):
    project = await project_service.create(
        db,
        name=body.name,
        tshirt_color=body.tshirt_color,
        garment_type=body.garment_type,
        mockup_credit=body.mockup_credit,
    )
    return project.to_dict()


@router.get("")
async def list_projects(db: AsyncSession = Depends(get_db)):
    projects = await project_service.list_all(db)
    return [p.to_dict() for p in projects]


@router.get("/{project_id}")
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    project = await project_service.get(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.to_dict()


@router.put("/{project_id}")
async def update_project(project_id: str, body: ProjectUpdate, db: AsyncSession = Depends(get_db)):
    data = body.model_dump(exclude_none=True)
    project = await project_service.update(db, project_id, data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.to_dict()


@router.delete("/{project_id}")
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db)):
    if not await project_service.delete(db, project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    return {"ok": True}
