# ImplantAI - Mandibular Arch & Nerve PDD

An AI-powered diagnostic and planning platform for dental implantology. This system provides a unified solution for processing CBCT/panoramic scans, automated detection of vital structures like the Inferior Alveolar Canal (IAC), and AI-generated clinical reports.

![ImplantAI Dashboard](https://via.placeholder.com/1200x600?text=ImplantAI+Dashboard+Preview) <!-- Replace with actual screenshot when available -->

---

## 🏗️ System Architecture

The project is structured as a full-stack cross-platform application:

- **Backend (FastAPI)**: Central API service handling medical image processing (DICOM/CBCT), AI analysis (Gemini & U-Net), and user management.
- **Web UI (React + Vite)**: Professional dashboard for clinicians to manage patients, upload scans, and review interactive 3D/2D analysis reports.
- **Mobile App (Android/Kotlin)**: On-the-go access for doctors to review analysis results, receive notifications, and verify implant plans.

---

## ⚡ Key Features

- **Advanced DICOM Processing**: Supports single `.dcm` files and bulk CBCT studies (ZIP archives).
- **Automated Nerve Tracing**: Uses a custom U-Net segmentation model and pathfinding algorithms to trace the Mandibular Canal.
- **AI-Powered Insights**: Integrates Google Gemini (1.5 Flash) to generate both clinician-facing reports and patient-friendly explanations.
- **Interactive Planning**: Provides 2D cross-sectional views with depth/width measurements and safety margin indicators.
- **Secure Authentication**: JWT-based security with robust password policies and professional profile management.
- **Multi-Tenant Ready**: Built-in support for team collaboration and clinic-based case management.

---

## 🛠️ Tech Stack

| Component | technologies |
| :--- | :--- |
| **Backend** | Python, FastAPI, SQLite, Pydicom, SimpleITK, Scikit-Image, Google Gemini SDK |
| **Web Frontend** | React.js, Vite, Framer Motion, Phosphor Icons, Tailwind CSS |
| **Mobile** | Kotlin, Android SDK, Retrofit, Jetpack Compose |

---

## 🚀 Getting Started

### 1. Backend Setup
The backend requires Python 3.9+ and an optional `GEMINI_API_KEY` for AI reports.

```bash
cd backend
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Unix: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Web UI Setup
Modern React application built with Vite.

```bash
cd web-ui/frontend
npm install
npm run dev
```

### 3. Android Mobile App
Open the root directory in Android Studio. Ensure the `base_url` in the API service matches your backend IP (e.g., `http://10.0.2.2:8000` for emulator or actual server IP).

---

## 📂 Project Structure

```text
├── app/                  # Android Application (Kotlin/Gradle)
├── backend/              # FastAPI Server & AI Processor
│   ├── auth_db.py        # SQLite Database & Session Management
│   ├── dicom_processor.py # Medical imaging logic (voxel/OPG/trace)
│   ├── segmentation_model.py # U-Net model implementation
│   └── main.py           # Core API Endpoints
├── web-ui/               # Web Application
│   └── frontend/         # React Source Code
└── uploads/              # Storage for uploaded medical scans
```

---

## 🧪 Testing

To run backend unit tests (DICOM loaders, Auth, etc.):
```bash
cd backend
python -m unittest discover
```

---

## 📄 License & Compliance

This tool is designed as a clinical assistant for dental professionals. Final diagnosis and implant planning MUST be verified by a board-certified clinician. 

Designed and Developed for **Mandibular Arch & Nerve PPD**.
