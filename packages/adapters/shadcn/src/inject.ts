export function injectCSS(
  id: string,
  css: string,
  target: HTMLElement = document.head,
): HTMLStyleElement {
  let style = document.getElementById(id) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    target.appendChild(style);
  }
  style.textContent = css;
  return style;
}

export function removeCSS(id: string): void {
  const style = document.getElementById(id);
  if (style) style.remove();
}

export function toCSS(values: Record<string, string>): string {
  const rules = Object.entries(values).map(
    ([key, value]) => `  ${key}: ${value};`,
  );
  return `:root {\n${rules.join("\n")}\n}`;
}
