# Recipes

Task-oriented patterns for Theme Kit. Each recipe is a self-contained solution you can copy-paste and adapt to your project.

## Available Recipes

### SSR Zero-Flash Bootstrap
Prevent the flash of unstyled content by resolving the theme on the server and embedding it in the initial render.

### Persistent Dark Mode
Save the user's theme preference across page reloads and browser sessions using localStorage or cookies.

### System Mode
Respect the user's OS-level dark/light preference and update automatically when it changes.

### Theme Transitions
Animate theme switches with customizable duration, easing, and presets for smooth visual experience.

### Cross-Tab Sync
Synchronize theme changes across multiple browser tabs and windows using BroadcastChannel and storage events.

### Custom Scrollbar
Overlay themed scrollbars that track the active theme with smooth transitions and touch-friendly interactions.

### Scoped Dashboard Theme
Apply a different theme to a specific subtree (like a dashboard panel) while keeping the rest of the app in its default theme.

### Accessible Palette Generation
Generate color palettes that meet WCAG contrast requirements using Theme Kit's contrast validation.

### CLI-Driven Theme Generation
Use the Theme Kit CLI to generate complete theme families from seed colors in your build pipeline.