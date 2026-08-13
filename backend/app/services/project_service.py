from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import Project


class ProjectService:
    """CRUD operations for design projects."""

    @staticmethod
    async def create(
        db: AsyncSession,
        name: str = "Untitled Design",
        tshirt_color: str = "#FFFFFF",
        garment_type: str = "tshirt",
        mockup_credit: str = "",
    ) -> Project:
        project = Project(
            name=name,
            tshirt_color=tshirt_color,
            garment_type=garment_type,
            mockup_credit=mockup_credit,
        )
        db.add(project)
        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def get(db: AsyncSession, project_id: str) -> Project | None:
        result = await db.execute(select(Project).where(Project.id == project_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_all(db: AsyncSession) -> list[Project]:
        result = await db.execute(select(Project).order_by(Project.updated_at.desc()))
        return list(result.scalars().all())

    @staticmethod
    async def update(db: AsyncSession, project_id: str, data: dict) -> Project | None:
        project = await ProjectService.get(db, project_id)
        if not project:
            return None
        for key, value in data.items():
            if hasattr(project, key) and key not in ("id", "created_at"):
                setattr(project, key, value)
        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def delete(db: AsyncSession, project_id: str) -> bool:
        project = await ProjectService.get(db, project_id)
        if not project:
            return False
        await db.delete(project)
        await db.commit()
        return True


project_service = ProjectService()
