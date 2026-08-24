# @theme-kit/web

Framework-free theming for any HTML page — no build step required.

## Reference snippet

```html
<script type="module">
  import { defineCustomElements } from "@theme-kit/web";
  defineCustomElements();
</script>

<theme-kit-provider>
  <theme-kit-toggle></theme-kit-toggle>
  <theme-kit-select></theme-kit-select>
</theme-kit-provider>
```

## Elements

`<theme-kit-provider>`, `<theme-kit-scope>`, `<theme-kit-toggle>`, `<theme-kit-select>`, plus `getProviderRuntime()` for imperative access.
