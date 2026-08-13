import uuid
import io
import base64
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image
from app.core.config import settings

router = APIRouter(prefix="/api/mockup", tags=["mockup"])


class MockupRequest(BaseModel):
    design_image_b64: str  # base64 encoded PNG of the canvas export
    side: str = "front"  # "front" or "back"
    tshirt_color: str = "#FFFFFF"


@router.post("/generate")
async def generate_mockup(body: MockupRequest):
    """Generate a simple mockup by overlaying the design on a T-shirt template."""
    try:
        # Decode design image
        design_data = base64.b64decode(body.design_image_b64)
        design_img = Image.open(io.BytesIO(design_data)).convert("RGBA")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid design image data")

    # Create a simple T-shirt mockup (placeholder - will use proper templates later)
    mockup_width, mockup_height = 800, 1000
    mockup = Image.new("RGBA", (mockup_width, mockup_height), (0, 0, 0, 0))

    # Draw a simple T-shirt shape using the color
    from PIL import ImageDraw

    draw = ImageDraw.Draw(mockup)
    color = body.tshirt_color

    # Simple T-shirt outline
    shirt_points = [
        (250, 150), (200, 200), (100, 250), (150, 350),  # left sleeve
        (250, 300), (250, 800), (550, 800), (550, 300),  # body
        (650, 350), (700, 250), (600, 200), (550, 150),  # right sleeve
        (400, 100),  # neckline
    ]
    draw.polygon(shirt_points, fill=color, outline="#333333")

    # Resize design to fit the shirt print area (centered)
    print_area = (300, 250, 500, 650)  # x1, y1, x2, y2
    print_w = print_area[2] - print_area[0]
    print_h = print_area[3] - print_area[1]

    design_img.thumbnail((print_w, print_h), Image.Resampling.LANCZOS)

    # Center the design on the shirt
    offset_x = print_area[0] + (print_w - design_img.width) // 2
    offset_y = print_area[1] + (print_h - design_img.height) // 2

    mockup.paste(design_img, (offset_x, offset_y), design_img)

    # Convert to PNG base64
    buf = io.BytesIO()
    mockup.save(buf, format="PNG")
    mockup_b64 = base64.b64encode(buf.getvalue()).decode()

    # Save to file
    settings.mockup_dir.mkdir(parents=True, exist_ok=True)
    filename = f"mockup_{body.side}_{uuid.uuid4().hex[:8]}.png"
    mockup.save(settings.mockup_dir / filename, format="PNG")

    return {
        "mockup_b64": mockup_b64,
        "filename": filename,
        "url": f"/api/mockups/{filename}",
    }
