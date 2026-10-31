/// <reference types="vite/client" />

// TinyMCE se carga como script global (components/Tinymce/dynamicLoadScript)
interface Window {
  tinymce: any
}
