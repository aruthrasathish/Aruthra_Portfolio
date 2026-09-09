# Avatar assets

## What is in here

Audited with ffprobe/PIL, not assumed.

| File | Size | Frames | Alpha | Verdict |
| --- | --- | --- | --- | --- |
| `0907.mp4` | 2.4 MB | 240 | none (`yuv420p`) | Source. First 2.967 s is the avatar, then it hard-cuts to a photograph. **Keep.** |
| `aruthra-avatar.webp` | 5.4 MB | 160 | **none** (alpha 255 everywhere) | Opaque plate, includes the photo cut. Unusable. |
| `aruthra-avatar.json` | 0 bytes | - | - | Empty. Not a Lottie file. |
| `aruthra-avatar-cutout.webp` | 28 KB | 1 | real | Superseded - faded out below the knee, no feet. |
| `aruthra-avatar-fullbody.webp` | 33 KB | 1 | real | Superseded - arm/torso gaps were sealed shut. |
| **`aruthra-avatar-clean.png`** | 234 KB | 1 | real | **Master.** 372 x 1231, cleaned matte. |
| **`aruthra-avatar-clean.webp`** | 49 KB | 1 | real | **In use.** Same pixels and alpha, a fifth of the bytes. |

## How the clean cut-out was made

Rebuilt from the source frame by `scripts/build-avatar-cutout.py`, which reads
the extracted frame and writes a new file. It never modifies anything already in
this folder.

1. **Background flood.** Smooth, desaturated pixels reachable from the frame
   border. Because the gaps between the arms and the torso open downward, the
   flood walks into them - which is what makes that negative space genuinely
   transparent rather than a trapped grey patch.
2. **Background plate.** True background values are kept where they are known
   and inpainted only underneath the figure. Over-smoothing this was what
   previously made the floor near the shoes read as foreground.
3. **Continuous alpha** from each pixel's departure from the plate behind it -
   no hard threshold, so anti-aliasing falls out naturally (1.2% of pixels are
   a genuine soft edge, versus a hard 730-pixel rim before).
4. **Structural clean-up** for the two regions the flood cannot reach, because
   the white sneakers and the studio floor are the same brightness: the floor
   between the legs (bright runs flanked by trousers on both sides) and the
   floor and cast shadow around the shoes (excluded from the footprint the legs
   establish).
5. **Colour decontamination.** Edge pixels have the plate's contribution
   removed - `F = (I - (1-a)B) / a`. This is what kills the light halo, and it
   is a matte fix, not a CSS blend mode.

Measured result over a dark background: edge pixels average **22 luma darker**
than the interior next to them. A halo would show up as the opposite.

## There is no motion in any asset

Measured frame by frame across the whole avatar segment, per body region:

| Region | Max pixel difference |
| --- | --- |
| head / face | 3 / 255 |
| arms | 3 / 255 |
| legs | 3 / 255 |
| feet | 3 / 255 |

3/255 is h.264 noise. **There is no wave, no arm gesture, no leg movement, no
blink and no expression change in any file here**, and no two frames differ
enough to be cut into distinct poses. The avatar segment is a single static pose
recorded as video.

The component therefore does no limb animation. It runs the full character
state machine, but every state renders the same 1.5px vertical breath. Nothing
rotates and nothing slides sideways.

## To get real character animation

The hero runs a character state machine - `enter -> greeting -> idle -> micro |
dance -> idle` - and a pose/clip player that is already wired up. It currently
has exactly one pose to work with, so the states drive only sub-degree
presentation motion. Every state below starts performing for real the moment
the matching artwork lands; **no code change is needed**, only `lib/data.js`.

### What each behaviour needs

| Behaviour you asked for | Pose files required | Clip to add |
| --- | --- | --- |
| **Real waving** | `pose-wave-up`, `pose-wave-out` (arm raised, arm across) | `wave: [{pose:"waveUp",hold:380},{pose:"waveOut",hold:380}]` |
| **Head turns / tilts** | `pose-head-left`, `pose-head-right` | `micro: [{pose:"headLeft",hold:700},{pose:"idle",hold:400}]` |
| **Blinking** | `pose-blink` (identical to idle, eyes closed) | `blink: [{pose:"blink",hold:120},{pose:"idle",hold:60}]` |
| **Facial expressions** | `pose-smile`, `pose-think` | `micro: [{pose:"smile",hold:900}]` |
| **A little dance** | `pose-dance-left`, `pose-dance-right` (weight on each foot, arms differing) | `dance: [{pose:"danceL",hold:240},{pose:"danceR",hold:240},{pose:"danceL",hold:240},{pose:"idle",hold:200}]` |

Four to eight poses covers all of it. A blink pose is the cheapest single win:
one file, and the character stops looking like a photograph.

### Hard requirements for every pose

- **Real alpha.** No white or grey plate. There is no code-side workaround.
- **Identical canvas size** for every pose (the current one is 340 x 1091).
- **Identical baseline.** The feet must land on the same pixel row in every
  file. Layers are pinned with `object-position: 50% 100%`, so a shifted
  baseline makes the character jump when the pose changes.
- **Same camera, same lighting, same scale.** These crossfade over 120ms; a
  changed camera reads as a glitch, not a gesture.
- Export the whole set from one rig or one prompt seed so the character does
  not subtly change identity between poses.

### Then wire it up

```js
avatar: {
  poses: {
    idle:   { src: "/avatar/pose-idle.webp" },
    blink:  { src: "/avatar/pose-blink.webp" },
    waveUp: { src: "/avatar/pose-wave-up.webp" },
    danceL: { src: "/avatar/pose-dance-left.webp" },
    danceR: { src: "/avatar/pose-dance-right.webp" },
  },
  clips: {
    greeting: [{ pose: "waveUp", hold: 400 }, { pose: "idle", hold: 300 }],
    wave:     [{ pose: "waveUp", hold: 400 }, { pose: "idle", hold: 300 }],
    micro:    [{ pose: "blink",  hold: 120 }, { pose: "idle", hold: 400 }],
    dance:    [{ pose: "danceL", hold: 240 }, { pose: "danceR", hold: 240 }],
  },
  aspect: "340 / 1091",
  alt: "Illustrated avatar of Aruthra Sathish Kumar",
  greeting: "Hi! \u{1F44B}",
}
```

Any state without a clip falls back to `idle`, so a partial set is safe - add
`blink` alone and only the micro-action improves. Once more than one pose
exists the component automatically damps its presentation transform to 30%,
because from then on the artwork is doing the acting.

### An animated file instead of poses

A single transparent animated asset also works - `poses.idle` accepts an
animated WebP, or `{ kind: "video" }` for a transparent WebM. That gives
continuous motion but no state awareness: the scheduler cannot make it wave
on hover or dance on cue, because it cannot seek inside the file. Poses are
the better fit for this design.

## Do not

- Do not put a card, ring, border, panel or glow behind the figure. The stage is
  intentionally bare so the character stands on the network background.
- Do not use `mix-blend-mode` to hide a baked-in background. It breaks in one
  theme or the other and mangles the artwork's own dark and light areas.
- Do not run the asset through `next/image` without `unoptimized` — it re-encodes
  animated WebP to a single frame.
