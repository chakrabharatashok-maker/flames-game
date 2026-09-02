import zlib
import struct
import math

def create_flames_icon(width, height, filename):
    # Create raw RGBA image buffer
    raw_data = bytearray()
    
    cx, cy = width / 2, height / 2
    r_radius = width * 0.44

    for y in range(height):
        raw_data.append(0)  # PNG filter type 0 (None)
        for x in range(width):
            # Normalized coordinates
            nx = (x - cx) / (width / 2)
            ny = (y - cy) / (height / 2)
            dist = math.sqrt(nx * nx + ny * ny)

            # Squircle rounded rect background
            # |nx|^4 + |ny|^4 <= 0.85
            is_inside = (abs(nx)**3.5 + abs(ny)**3.5) <= 0.88

            if is_inside:
                # Romantic Gradient from Crimson (#ff416c) to Gold/Pink (#ff4b2b)
                t = (nx + ny + 2) / 4.0
                t = max(0.0, min(1.0, t))
                
                # Gradient colors:
                # Top-left: (255, 65, 108) -> Bottom-right: (255, 75, 43)
                red = int(255)
                green = int(65 * (1 - t) + 75 * t)
                blue = int(108 * (1 - t) + 43 * t)

                # Add a glowing heart / flame center highlight
                heart_dist = math.sqrt(nx*nx + (ny+0.1)*(ny+0.1))
                if heart_dist < 0.45:
                    # White/gold inner highlight
                    hl = (1 - heart_dist / 0.45)
                    red = int(min(255, red + 100 * hl))
                    green = int(min(255, green + 150 * hl))
                    blue = int(min(255, blue + 180 * hl))

                alpha = 255
            else:
                red, green, blue, alpha = 0, 0, 0, 0

            raw_data.extend([red, green, blue, alpha])

    # Compress IDAT chunk
    compressed_data = zlib.compress(bytes(raw_data), 9)

    # Build PNG chunks
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        crc = zlib.crc32(tag + data) & 0xffffffff
        return c + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    
    png_bytes = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", compressed_data) + chunk(b"IEND", b"")

    with open(filename, "wb") as f:
        f.write(png_bytes)
    print(f"Created {filename} ({width}x{height})")

create_flames_icon(192, 192, "icon-192.png")
create_flames_icon(512, 512, "icon-512.png")
