# Solar System by Devesh

A 3D interactive solar system simulation built with Three.js and Vite.

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

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Then open the URL shown in your terminal (typically [http://localhost:5173](http://localhost:5173)) in your browser.

5. **Build for production**
   ```bash
   npm run build
   ```
   The built files will be in the `dist` directory.

## Usage
- Open the app in your browser.
- Use the GUI to control camera, lighting, and planet speeds.
- Hover over planets for info labels.
- Toggle between dark and light mode.

## Notes
- For best performance, use a modern browser (Chrome, Firefox, Edge).
- If you add or change textures, update the paths in `src/main.js` if needed.

## Credits
- Built with [Three.js](https://threejs.org/)
- Bundled with [Vite](https://vitejs.dev/)
- Textures from NASA and other public domain sources

---

Enjoy exploring the solar system! 