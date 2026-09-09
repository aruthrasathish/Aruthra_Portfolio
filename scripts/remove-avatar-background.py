from pathlib import Path
from PIL import Image
from rembg import remove, new_session
import time

input_dir = Path(r".\public\avatar\frames-input")
output_dir = Path(r".\public\avatar\frames-alpha")
output_dir.mkdir(parents=True, exist_ok=True)

frames = sorted(input_dir.glob("frame-*.png"))

print(f"Found {len(frames)} frames")
print("Loading BRIA background-removal model...")

session = new_session("bria-rmbg")

print("Model loaded.")
print("Removing backgrounds...")

start = time.time()

for i, frame_path in enumerate(frames, start=1):
    output_path = output_dir / frame_path.name

    image = Image.open(frame_path).convert("RGB")

    result = remove(
        image,
        session=session
    )

    result.save(output_path, "PNG")

    elapsed = time.time() - start
    print(
        f"[{i:03d}/{len(frames):03d}] "
        f"{frame_path.name} complete "
        f"({elapsed:.1f}s elapsed)"
    )

print()
print("DONE")
print(f"Processed {len(frames)} frames.")
print(f"Saved to: {output_dir.resolve()}")
