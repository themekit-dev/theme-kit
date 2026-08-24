export interface ThemeMeta {
  label?: string;
  description?: string;
  group?: string;
  version?: string;
  created?: string;
  updated?: string;

  family?: string;
  mode?: "light" | "dark" | "system";
  order?: number;
  tags?: string[];
}
