import type { ThemeDefinition, ThemeRuntime } from "@theme-kit/core";
import type { BootstrapVariableOptions } from "./generator";
import { generateBootstrapVariables } from "./generator";
import { resolveAdapterSource } from "@theme-kit/adapters";

export function getBootstrapVariables<T extends ThemeDefinition>(
  runtime: ThemeRuntime<T>,
  options?: BootstrapVariableOptions,
): Record<string, string> {
  return generateBootstrapVariables(resolveAdapterSource(runtime), options);
}
