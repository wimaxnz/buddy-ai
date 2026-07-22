"""Export FACE_EMOTIONS from BuddyFaceScreen.tsx to shared JSON + C header."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TS = ROOT / "src/components/buddy/BuddyFaceScreen.tsx"
OUT_JSON = ROOT / "shared/figma_face_profiles.json"
OUT_H = Path(r"C:\Users\alist\OneDrive\download\Documents\Arduino\BuddyAI_CoreS3\FigmaFaceData.h")

text = TS.read_text(encoding="utf-8")
block = re.search(r"const FACE_EMOTIONS.*?=\s*\{(.*?)\n\}", text, re.S)
if not block:
    raise SystemExit("FACE_EMOTIONS not found")

emotions = {}
for line in block.group(1).split("\n"):
    line = line.strip().rstrip(",")
    if not line or line.startswith("//"):
        continue
    name = line.split(":")[0].strip()
    if not name.isidentifier():
        continue
    nums = re.findall(r"[-+]?\d*\.?\d+", line)
    shapes = re.findall(r"shape:'([^']+)'", line)
    glows = re.findall(r"glow:'([^']+)'", line)
    if len(nums) < 15 or not shapes or not glows:
        continue
    f = [float(x) for x in nums[:15]]
    emotions[name] = {
        "eye": {"openness": f[0], "pupilX": f[1], "pupilY": f[2], "pupilScale": f[3], "squint": f[4]},
        "brow": {"leftY": f[5], "rightY": f[6], "leftAngle": f[7], "rightAngle": f[8], "leftCurve": f[9], "rightCurve": f[10]},
        "mouth": {"shape": shapes[0], "width": f[11], "openness": f[12]},
        "cheekOp": f[13],
        "glow": glows[0],
    }

OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
OUT_JSON.write_text(json.dumps(emotions, indent=2), encoding="utf-8")

MOUTH_SHAPES = [
    "closed", "tinySmile", "smile", "open", "mediumOpen", "wideOpen",
    "laughing", "worried", "surprised", "sleepy",
]

lines = [
    "#pragma once",
    "// Auto-generated from Figma BuddyFaceScreen — do not edit by hand.",
    "#include <Arduino.h>",
    "",
    "enum FigmaMouthShape : uint8_t {",
]
for i, s in enumerate(MOUTH_SHAPES):
    lines.append(f"  FIGMA_MOUTH_{s.upper() if s != 'tinySmile' else 'TINYSMILE'} = {i},")
lines += ["};", ""]

lines += [
    "struct FigmaEyeCfg { float openness, pupilX, pupilY, pupilScale, squint; };",
    "struct FigmaBrowCfg { float leftY, rightY, leftAngle, rightAngle, leftCurve, rightCurve; };",
    "struct FigmaMouthCfg { FigmaMouthShape shape; float width, openness; };",
    "struct FigmaFaceCfg {",
    "  FigmaEyeCfg eye;",
    "  FigmaBrowCfg brow;",
    "  FigmaMouthCfg mouth;",
    "  float cheekOp;",
    "  uint32_t glow565;",
    "};",
    "",
    "static inline uint32_t figmaHex565(const char* hex) {",
    "  if (!hex || hex[0] != '#') return 0x4FC3;",
    "  long v = strtol(hex + 1, nullptr, 16);",
    "  uint8_t r = (v >> 16) & 0xFF, g = (v >> 8) & 0xFF, b = v & 0xFF;",
    "  return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);",
    "}",
    "",
    "static inline FigmaMouthShape figmaMouthFromName(const char* s) {",
]
shape_map = {s: f"FIGMA_MOUTH_{s.upper() if s != 'tinySmile' else 'TINYSMILE'}" for s in MOUTH_SHAPES}
for s in MOUTH_SHAPES:
    lines.append(f'  if (s && !strcmp(s, "{s}")) return {shape_map[s]};')
lines += ["  return FIGMA_MOUTH_CLOSED;", "};", ""]

lines.append("enum FigmaEmotionId : uint8_t {")
for i, name in enumerate(emotions.keys()):
    lines.append(f"  FIGMA_{name.upper()} = {i},")
lines += ["  FIGMA_EMOTION_COUNT", "};", ""]

lines.append("static const FigmaFaceCfg FIGMA_FACE_PROFILES[] = {")
for name, e in emotions.items():
    ms = e["mouth"]["shape"]
    ms_enum = shape_map.get(ms, "FIGMA_MOUTH_CLOSED")
    glow = e["glow"]
    lines.append("  {")
    lines.append(f'    {{ {e["eye"]["openness"]}f, {e["eye"]["pupilX"]}f, {e["eye"]["pupilY"]}f, {e["eye"]["pupilScale"]}f, {e["eye"]["squint"]}f }},')
    lines.append(f'    {{ {e["brow"]["leftY"]}f, {e["brow"]["rightY"]}f, {e["brow"]["leftAngle"]}f, {e["brow"]["rightAngle"]}f, {e["brow"]["leftCurve"]}f, {e["brow"]["rightCurve"]}f }},')
    lines.append(f'    {{ {ms_enum}, {e["mouth"]["width"]}f, {e["mouth"]["openness"]}f }},')
    lines.append(f'    {e["cheekOp"]}f, figmaHex565("{glow}") }},  // {name}')
lines.append("};")
lines.append("")
lines.append('static const char* FIGMA_EMOTION_NAMES[] = {')
for name in emotions.keys():
    lines.append(f'  "{name}",')
lines.append('};')

OUT_H.write_text("\n".join(lines) + "\n", encoding="utf-8")
print("Exported", len(emotions), "emotions to", OUT_JSON, "and", OUT_H)
