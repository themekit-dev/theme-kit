export interface DOMWriteBatch {
  setAttribute(name: string, value: string | null): void;
  toggleClass(name: string, force: boolean): void;
  setStyle(property: string, value: string | null): void;
  flush(target: HTMLElement): void;
}

export function createDOMWriteBatch(): DOMWriteBatch {
  const attributes = new Map<string, string | null>();
  const classToggles = new Map<string, boolean>();
  const styles = new Map<string, string | null>();
  let dirty = false;

  return {
    setAttribute(name: string, value: string | null) {
      attributes.set(name, value);
      dirty = true;
    },

    toggleClass(name: string, force: boolean) {
      classToggles.set(name, force);
      dirty = true;
    },

    setStyle(property: string, value: string | null) {
      styles.set(property, value);
      dirty = true;
    },

    flush(target: HTMLElement) {
      if (!dirty) return;

      for (const [name, value] of attributes) {
        if (value === null) {
          target.removeAttribute(name);
        } else {
          target.setAttribute(name, value);
        }
      }
      attributes.clear();

      for (const [name, force] of classToggles) {
        target.classList.toggle(name, force);
      }
      classToggles.clear();

      for (const [prop, value] of styles) {
        if (value === null) {
          target.style.removeProperty(prop);
        } else {
          target.style.setProperty(prop, value);
        }
      }
      styles.clear();

      dirty = false;
    },
  };
}
