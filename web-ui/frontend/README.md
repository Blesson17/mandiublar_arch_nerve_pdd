# ImplantAI - Web UI

A modern React-based clinical dashboard for dental implant planning. This interface allows doctors to manage patient cases, upload CBCT/panoramic scans, and view AI-assisted nerve canal analysis.

---

## 🛠️ Tech Stack

- **React 18**: Component-based UI.
- **Vite**: Ultra-fast build tool and dev server.
- **Framer Motion**: Smooth animations and transitions.
- **Phosphor Icons**: Professional medical-grade iconography.
- **React Router Dom**: Client-side navigation.

---

## 🌐 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- NPM or Yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configuration:
   Ensure your backend service is running. Update the API base URL in `src/config.js` or through environment variables if applicable.

3. Run in Development Mode:
   ```bash
   npm run dev
   ```

4. Build for Production:
   ```bash
   npm run build
   ```

---

## 🧭 Project Structure

- `src/components/`: Reusable UI elements (Sidebar, Modals, Buttons).
- `src/pages/`: Main application views (Dashboard, Analysis, Settings, Profile).
- `src/context/`: Global state management for Authentication and UI settings.
- `src/styles/`: Global CSS and theme configurations.

---

## 🩺 Clinical Workflow

1. **Dashboard**: High-level overview of active cases and statistics.
2. **New Case**: Create a patient record and upload DICOM files/ZIP archives.
3. **Analysis View**: Interactive 2D slice viewer with automated nerve canal tracing.
4. **Reports**: AI-generated case summaries (Clinical & Patient-friendly).

---

## 🔐 Authentication

The application uses **JWT (JSON Web Token)** for secure communication with the backend. User credentials and sessions are managed through the `AuthContext` to ensure a seamless experience across the platform.
