# Face-API.js Models

This directory should contain the following face-api.js model files:

## Required Models

### For Proctoring (Aptitude/Technical Rounds):
- `tiny_face_detector_model-weights_manifest.json` ✅ (Present)
- `tiny_face_detector_model-shard1` ✅ (Present)

### For HR Interview Analysis:
- `face_expression_model-weights_manifest.json` (Missing - needs download)
- `face_expression_model-shard1` (Missing - needs download)

## Download Instructions

1. Visit: https://github.com/justadudewhohacks/face-api.js-models
2. Download the `face_expression_model` files
3. Place them in this directory (`frontend/public/models/`)

Or use this direct link:
- https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_expression_model-weights_manifest.json
- https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/face_expression_model-shard1

## Model Files Structure

```
frontend/public/models/
├── tiny_face_detector_model-weights_manifest.json
├── tiny_face_detector_model-shard1
├── face_expression_model-weights_manifest.json (download needed)
└── face_expression_model-shard1 (download needed)
```

