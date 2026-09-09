"""Rebuild the transparent avatar from the source frame.

Non-destructive: reads the extracted source frame, writes a new PNG. None of the
files in public/avatar/ are modified except the new output.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

SP = sys.argv[1]
OUT = sys.argv[2]

rgb = np.asarray(Image.open(SP + "/src_full.png").convert("RGB")).astype(np.float32)
h, w, _ = rgb.shape
luma = rgb.mean(2); sat = rgb.max(2) - rgb.min(2)
known_bg = np.load(SP + "/known_bg.npy")
plate = np.load(SP + "/plate2.npy")
alpha = np.load(SP + "/alpha2.npy")

fg = ndimage.binary_opening(alpha > 0.5, np.ones((3, 3)))
l, n = ndimage.label(fg)
fg = l == 1 + int(np.argmax(ndimage.sum(fg, l, range(1, n + 1))))
holes = ndimage.binary_fill_holes(fg) & ~fg & ~known_bg
hl, hn = ndimage.label(holes)
if hn:
    sz = ndimage.sum(holes, hl, range(1, hn + 1))
    fg = fg | np.isin(hl, [i + 1 for i, s in enumerate(sz) if s < 2000])

# --- floor showing between the legs -----------------------------------------
# Below the hips the silhouette is two trouser legs. A bright desaturated run
# with trousers on BOTH sides of the same row is the studio floor between them,
# not the figure. The background flood cannot reach it (the shoes wall it off
# at the bottom), so it is identified structurally instead.
ys, _ = np.where(fg); top, bot = ys.min(), ys.max()
hip = top + int((bot - top) * 0.50)
bright = (luma > 185) & (sat < 26)
dark = luma < 110
removed = np.zeros_like(fg)
for y in range(hip, min(bot + 2, h)):
    rf, rb, rd = fg[y], bright[y], dark[y]
    x = 0
    while x < w:
        if rf[x] and rb[x]:
            s = x
            while x < w and rf[x] and rb[x]:
                x += 1
            if rd[max(0, s - 70):s].any() and rd[x:min(w, x + 70)].any():
                removed[y, s:x] = True
        else:
            x += 1
fg = fg & ~removed
print("floor removed from between the legs: %d px" % int(removed.sum()))

# --- floor and cast shadow around the shoes ---------------------------------
MERGE_Y, LEFT, RIGHT = 1262, (288, 392), (498, 600)
allowed = np.zeros((h, w), bool)
allowed[:, LEFT[0]:LEFT[1]] = True; allowed[:, RIGHT[0]:RIGHT[1]] = True
band = np.zeros((h, w), bool); band[MERGE_Y:] = True
fg = np.where(band, fg & allowed, fg)

fg = ndimage.binary_opening(fg, np.ones((3, 3)))
l, n = ndimage.label(fg)
sizes = ndimage.sum(fg, l, range(1, n + 1))
fg = np.isin(l, [i + 1 for i, s in enumerate(sizes) if s > 1500])

# --- final alpha: solid interior, real soft edge ----------------------------
interior = ndimage.binary_erosion(fg, np.ones((3, 3)), iterations=2)
a = np.maximum(alpha, interior.astype(np.float32))
a[known_bg] = 0.0
a[removed] = 0.0
a[~ndimage.binary_dilation(fg, np.ones((3, 3)), iterations=2)] = 0.0
a = np.clip(a, 0, 1)

# --- colour decontamination (defringe) --------------------------------------
B = np.repeat(plate[:, :, None], 3, 2); A3 = a[:, :, None]
F = np.where(A3 > 0.02, (rgb - B * (1 - A3)) / np.maximum(A3, 0.02), rgb)
rim = (a > 0.02) & (a < 0.98)
out = rgb.copy(); out[rim] = np.clip(F, 0, 255)[rim]

img = Image.fromarray(np.dstack([out, a * 255]).astype(np.uint8), "RGBA")
img = img.crop(img.getchannel("A").point(lambda p: 255 if p > 4 else 0).getbbox())
img.save(OUT)
arr = np.asarray(img); al = arr[:, :, 3] / 255.0
print("output %s  %dx%d" % (OUT, img.size[0], img.size[1]))
print("alpha: %.1f%% clear, %.1f%% opaque, %.1f%% soft edge"
      % (100*(al == 0).mean(), 100*(al == 1).mean(), 100*((al > 0) & (al < 1)).mean()))
