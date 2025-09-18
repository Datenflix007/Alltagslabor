# Here are your Instructions
```markdown
# 🔬 AlltagsLabor - Mobile Lern-App

Eine mobile Anwendung für Bildungsexperimente, entwickelt für Schulen und Lernende. Die App bietet eine intuitive Benutzeroberfläche zum Durchsuchen und Durchführen von wissenschaftlichen Experimenten aus verschiedenen Fachbereichen.

![AlltagsLabor Logo](assets/app-icon.png)

## 📱 Über die App

AlltagsLabor ist eine **React Native/Expo** basierte mobile Anwendung, die Experimente aus einem **GitLab-Repository** lädt und in einer benutzerfreundlichen mobilen Oberfläche präsentiert. Die App wurde speziell für den Bildungsbereich entwickelt und unterstützt verschiedene Schulformen und Klassenstufen.

### ✨ Features

- 🔍 **Suchfunktion** - Experimente nach Freitext durchsuchen
- 📚 **Strukturierte Inhalte** - Aufgaben, Merksätze und Anleitungen
- 🏫 **Bildungskontext** - Zuordnung nach Fach, Klassenstufe und Schulform  
- 📱 **Mobile-First** - Optimiert für Smartphones und Tablets
- 🔄 **Live-Updates** - Experimente werden direkt vom GitLab-Repository geladen
- 📖 **Impressum** - Vollständige Autoren- und Lizenzinformationen

### 🎯 Zielgruppe

- **Schüler:innen** - Eigenständiges Experimentieren und Lernen
- **Lehrkräfte** - Unterrichtsvorbereitung und -durchführung  
- **Bildungseinrichtungen** - Integration in den Schulalltag

## 🛠 Voraussetzungen

### System-Requirements

- **Windows 10/11**, **macOS 10.15+** oder **Linux**
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Python 3.10+** ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))

### Mobile Testing

- **Android**: Expo Go App ([Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **iOS**: Expo Go App ([App Store](https://apps.apple.com/app/expo-go/id982107779))
- **Alternativ**: Webbrowser (Chrome, Firefox, Safari)

### Entwicklungsumgebung (Optional)

- **Visual Studio Code** ([Download](https://code.visualstudio.com/))
- **Android Studio** (für Android-Emulator)
- **Xcode** (für iOS-Simulator, nur macOS)

## 📦 Installation

### Option 1: Automatische Installation (Windows)

1. **Repository klonen:**
   ```bash
   git clone https://github.com/IhrUsername/alltagslabor.git
   cd alltagslabor
   ```

2. **Quickstart-Skript ausführen:**
   ```cmd
   quickstart.bat
   ```
   
   Das Skript installiert automatisch alle Dependencies und startet die Anwendung.

### Option 2: Manuelle Installation

1. **Repository klonen:**
   ```bash
   git clone https://github.com/IhrUsername/alltagslabor.git
   cd alltagslabor
   ```

2. **Backend einrichten:**
   ```bash
   cd backend
   python -m venv .venv
   
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   
   pip install -r requirements.txt
   ```

3. **Frontend einrichten:**
   ```bash
   cd ../frontend
   npm install
   # oder mit yarn:
   yarn install
   ```

4. **Expo CLI installieren (global):**
   ```bash
   npm install -g expo-cli
   ```

## 🚀 Benutzung

### Entwicklungsserver starten

1. **Backend starten** (Terminal 1):
   ```bash
   cd backend
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate  # macOS/Linux
   python server.py
   ```
   
   Backend läuft auf: `http://localhost:8001`

2. **Frontend starten** (Terminal 2):
   ```bash
   cd frontend
   expo start
   # oder alternativ:
   npx expo start
   ```

### App testen

#### 📱 Auf dem Smartphone (Empfohlen)

1. **Expo Go App** installieren (siehe Voraussetzungen)
2. **QR-Code scannen** der im Terminal/Browser angezeigt wird
3. **App öffnet sich automatisch** auf dem Smartphone

#### 🌐 Im Webbrowser

1. `w` im Frontend-Terminal drücken
2. App öffnet sich unter `http://localhost:19006`

#### 📟 Mit Emulator/Simulator

- **Android**: `a` im Frontend-Terminal drücken
- **iOS**: `i` im Frontend-Terminal drücken (nur macOS)

### App-Navigation

#### Startseite
- **Suchfeld**: Experimente nach Begriffen durchsuchen
- **Suchbutton**: Suche ausführen
- **Experimentliste**: Alle verfügbaren Experimente durchblättern

#### Experiment-Ansicht
- **Experiment auswählen**: Auf Experiment-Karte tippen
- **Experiment-Details**: Vollständige Beschreibung, Aufgaben und Merksätze
- **Zurück**: Pfeil oben links oder Zurück-Geste

#### Inhaltstypen
- 🔵 **Aufgaben**: Blau markierte Bereiche mit Übungsaufgaben
- 🟠 **Merksätze**: Orange markierte wichtige Erkenntnisse
- 📝 **Texte**: Allgemeine Beschreibungen und Anleitungen

## 🔧 Entwicklung

### Projektstruktur

```
alltagslabor/
├── backend/                 # FastAPI Backend
│   ├── server.py           # Hauptserver
│   ├── requirements.txt    # Python Dependencies
│   └── .env               # Umgebungsvariablen
├── frontend/               # React Native/Expo Frontend
│   ├── app/               # App-Screens (Expo Router)
│   │   └── index.tsx     # Hauptkomponente
│   ├── package.json      # Node.js Dependencies
│   └── .env             # Frontend-Konfiguration
├── .vscode/              # VS Code Konfiguration
├── quickstart.bat        # Windows Setup-Skript
└── README.md            # Diese Datei
```

### API-Endpunkte

- `GET /api/experiments` - Alle Experimente
- `GET /api/experiments/search?freetext=Begriff` - Suche
- `GET /api/subjects` - Verfügbare Fächer  
- `GET /api/school-types` - Schulformen
- `GET /api/grades` - Klassenstufen
- `GET /api/impressum` - Impressum-Text

### Live-Reload

- **Frontend**: Änderungen in `frontend/app/` werden sofort in der App sichtbar
- **Backend**: Server startet bei Änderungen automatisch neu
- **Keine Build-Schritte** erforderlich während der Entwicklung

## 📄 Lizenz & Impressum

**Friedrich-Schiller-Universität Jena**  
Institut für Erziehungswissenschaft  
L4a - Digitales Lehren und Lernen an der Werkstattschule Jena  

**Dozentin:** Dr. phil. Stefanie Czempiel  
**Studenten:** Claudius Gladewitz, Patrick Köhler, Felix Staacke

Dieses Projekt wurde im Rahmen einer Lehrveranstaltung entwickelt und dient ausschließlich Bildungszwecken.

## 🐛 Problembehebung

### Häufige Probleme

**Backend startet nicht:**
```bash
cd backend
pip install -r requirements.txt
python server.py
```

**Frontend-Dependencies-Fehler:**
```bash
cd frontend
rm -rf node_modules
npm install
expo start --clear
```

**Expo Go verbindet nicht:**
- Smartphone und Computer im **gleichen WLAN**
- **Firewall/Antivirus** temporär deaktivieren
- `expo start --tunnel` für Remote-Verbindung

**Port bereits in Verwendung:**
- Backend: Port in `backend/.env` ändern
- Frontend: Port mit `expo start --port 3001` ändern

### Support

Bei technischen Problemen oder Fragen:
1. **GitHub Issues** erstellen
2. **Logs prüfen** in den Terminal-Fenstern
3. **Browser-Konsole** bei Web-Version öffnen

## 🚀 Deployment

### Expo Build (Produktionsversion)

```bash
cd frontend
expo build:android  # Android APK
expo build:ios      # iOS IPA (nur macOS)
```

### App Store Veröffentlichung

1. **Apple Developer Account** (iOS)
2. **Google Play Console** (Android)  
3. **App Store Connect** für iOS
4. **Expo Application Services (EAS)** für automatisierte Builds

---

**Viel Spaß beim Experimentieren! 🔬✨**
```

Diese README.md bietet eine vollständige Anleitung mit allen wichtigen Informationen für Nutzer und Entwickler. Sie können sie direkt als `README.md` in Ihrem Projektwurzelordner speichern.