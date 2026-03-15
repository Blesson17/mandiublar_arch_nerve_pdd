# Backend Auth + Imaging Flow

This backend now supports:

- SQLite-based signup/login (`/auth/signup`, `/auth/login`)
- Token-protected analysis endpoints
- Dedicated panoramic endpoint for mandibular canal tracing (`/analyze-panoramic`)
- CBCT series reconstruction from:
  - single `.dcm` (legacy)
  - `.zip` archive containing many `.dcm` slices
  - folder containing many `.dcm` slices (via `load_cbct_series` helper)

## Input Routing

- `POST /analyze-jaw`
  - `.zip` -> CBCT series reconstruction
  - single `.dcm` -> existing single-file loader (legacy behavior kept)
- `POST /analyze-panoramic`
  - `.jpg`/`.jpeg`/`.png` -> panoramic projection loader
  - single `.dcm` -> existing DICOM loader

Panoramic processing functions remain unchanged (`load_image_projection`, `generate_opg`, canal tracing pipeline).

## Run

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## API Notes

1. Sign up or log in to get a bearer token.
2. Pass token as `Authorization: Bearer <token>` for:
   - `POST /analyze-jaw`
   - `POST /analyze-panoramic`
   - `POST /measure`

## Tests

```bash
cd backend
python -m unittest discover

# targeted CBCT series loader test
python -m unittest test_cbct_series_loader.py
```

## Quick Loader Harness

```bash
cd backend
python run_cbct_series_loader.py /path/to/cbct-study.zip
python run_cbct_series_loader.py /path/to/cbct-study-folder
```

