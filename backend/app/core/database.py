from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Ensure data directory exists
settings.db_path.parent.mkdir(parents=True, exist_ok=True)

engine = create_async_engine(
    f"sqlite+aiosqlite:///{settings.db_path}",
    echo=settings.debug,
)

AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        columns = await conn.run_sync(
            lambda sync_conn: {column["name"] for column in inspect(sync_conn).get_columns("projects")}
        )
        if "garment_type" not in columns:
            await conn.execute(
                text("ALTER TABLE projects ADD COLUMN garment_type VARCHAR(32) NOT NULL DEFAULT 'tshirt'")
            )
        if "mockup_credit" not in columns:
            await conn.execute(
                text("ALTER TABLE projects ADD COLUMN mockup_credit VARCHAR(160) NOT NULL DEFAULT ''")
            )
