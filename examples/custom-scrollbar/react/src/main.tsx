import { createRoot } from "react-dom/client";
// Required: brings in the pre-paint native-bar hiding plus the overlay strip
// base styles. Without it the strips have no styling of their own and the
// browser paints its native scrollbar until the engine injects its stylesheet.
import "@theme-kit/core/scrollbar.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
