# Solar System by Devesh

A 3D interactive solar system simulation built with Three.js.

## Features
- Realistic planet textures and orbits
- Camera controls and multiple view options
- Light/Dark mode toggle
- Interactive planet labels
- Customizable planet speeds
- Responsive GUI controls

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SolarSystem
   ```

2. **Install dependencies**
   (Requires [Node.js](https://nodejs.org/) and npm)
   ```bash
   npm install
   ```

3. **Textures**
   - All required planet texture images are already included in the `textures` folder in this repository. You do not need to add them manually.

4. **Start a local server**
   (You can use any static server. Here are two options:)
   
   **Option 1: Using npm [http-server]**
   ```bash
   npx http-server .
   ```
   Then open [http://localhost:8080](http://localhost:8080) in your browser.

   **Option 2: Using Python (if installed)**
   ```bash
   python -m http.server 8000
   ```
   Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Usage
- Open the app in your browser.
- Use the GUI to control camera, lighting, and planet speeds.
- Hover over planets for info labels.
- Toggle between dark and light mode.

## Notes
- For best performance, use a modern browser (Chrome, Firefox, Edge).
- If you add or change textures, update the paths in `main.js` if needed.

## Credits
- Built with [Three.js](https://threejs.org/)
- GUI by [lil-gui](https://lil-gui.georgealways.com/)
- Textures from NASA and other public domain sources

---

Enjoy exploring the solar system! 