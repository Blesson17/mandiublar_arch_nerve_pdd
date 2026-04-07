# ImplantAI - Android Application

A Kotlin-based mobile application for clinicians to manage dental cases and review AI-powered CBCT analysis on-the-go.

---

## 🛠️ Tech Stack

- **Kotlin**: Primary language for modern Android development.
- **Jetpack Compose**: Declarative UI toolkit.
- **Retrofit 2**: Networking library for REST API communication.
- **OkHttp 3**: HTTP client with logging interceptors.
- **Coil**: Image loading library for OPG previews.
- **SharedPreferences**: For local session and token storage.

---

## 📥 Getting Started

### Prerequisites

- Android Studio (Koala or newer recommended)
- JDK 17+
- Android Device/Emulator (API 24+)

### Configuration

1. **API Base URL**: Update the backend IP address in the `ApiService` or common configuration file (typically `Constants.kt` or `RetrofitClient.kt`). 
   - Emulator default: `http://10.0.2.2:8000`
   - Local Network: `http://192.168.x.x:8000`

2. **Network Security**: Ensure `android:usesCleartextTraffic="true"` is set in `AndroidManifest.xml` if testing over HTTP.

---

## 🧪 Build & Run

1. Open this project in Android Studio.
2. Let Gradle sync dependencies.
3. Choose your device/emulator and click **Run**.

---

## 🧭 Key Modules

- `ui/`: Compose screens for Dashboard, Login, Case View, and Settings.
- `network/`: API interfaces and Retrofit implementation.
- `model/`: Data classes mapping to backend response schemas.
- `utils/`: Helpers for authentication tokens and image processing.

---

## 🔐 Key Features

- **Dashboard**: Quick view of recent patient cases and analysis status.
- **Case Review**: View OPG projections with automated nerve canal highlights.
- **Profile Management**: Update doctor settings and practice information.
- **Secure Auth**: Persistent login with JWT token support.
