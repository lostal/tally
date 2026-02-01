/// <reference types="astro/client" />

interface Window {
  Alpine: import('alpinejs').Alpine;
}

declare module '@alpinejs/collapse' {
  const plugin: (alpine: import('alpinejs').Alpine) => void;
  export default plugin;
}
