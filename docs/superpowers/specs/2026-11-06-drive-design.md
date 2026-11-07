# Drive: carpetas y archivos para adjuntar en los posts

Fecha: 2026-11-06 · Repos: `awesomeApp` (API Laravel 12) y `vue-project` (Vue 3)

## Objetivo

Cada usuario del admin (Admin o Writer) tiene su propio drive: crea carpetas y subcarpetas, sube
imágenes y archivos de cualquier tipo, y después los adjunta a sus posts. Un mismo archivo se puede
adjuntar a varios posts. En el blog, las imágenes adjuntas se suman al carrusel del post y el resto
aparece como lista de descargas.

**Fuera de alcance:** la tabla `photos` y la subida de fotos actual del post no cambian; tampoco las
imágenes que TinyMCE inserta en el cuerpo (`editor-images`). No hay cuota por usuario, papelera,
compartir entre usuarios ni arrastrar archivos entre carpetas (se mueve con "Mover a…").

## Decisiones

| Tema | Decisión |
|---|---|
| Morph | Tabla puente polimórfica `fileables` (`morphToMany`): un archivo, muchos posts (u otros modelos a futuro). |
| Dueño | Un drive por usuario. Nadie ve ni toca el drive de otro, **tampoco un Admin**. |
| Privacidad | Disco privado `local` (`storage/app/private`). Solo se sirven por el API. |
| Quién abre un archivo | Su dueño siempre; cualquiera si el archivo está adjunto a un post publicado. |
| En el blog | Imágenes adjuntas → carrusel (después de las fotos del post). Resto → "Archivos adjuntos". |
| Carpetas | Tabla propia `folders`, autorreferenciada (`parent_id`). |
| Morph map | No se usa: activarlo cambiaría el `subject_type` que guarda `activity_log` para los posts. `fileables.fileable_type` guarda la clase completa. |

## Datos

### `folders`
| Columna | Tipo | Notas |
|---|---|---|
| id | bigint | |
| user_id | FK users, cascade | dueño |
| parent_id | FK folders nullable, cascade | `null` = raíz |
| name | string(120) | único entre hermanas del mismo usuario (validado en el FormRequest; en MySQL un índice único con `parent_id` nulo no lo garantiza) |
| timestamps | | |

Índice: `(user_id, parent_id)`.

### `files`
| Columna | Tipo | Notas |
|---|---|---|
| id | bigint | |
| user_id | FK users, cascade | dueño |
| folder_id | FK folders nullable, nullOnDelete | `null` = raíz (el borrado de carpetas lo hace la Action, que también borra del disco) |
| original_name | string(255) | nombre con el que se subió; se puede renombrar |
| name | string(100) | nombre que asigna Laravel (`hashName()`), p. ej. `aZ3…k9.jpg` |
| path | string(255) | `drive/{user_id}/{name}` |
| disk | string(20) | `local` |
| extension | string(20) | del nombre original, en minúsculas |
| mime_type | string(127) | detectado en el servidor (`getMimeType()`), no el que manda el navegador |
| size | unsigned bigint | bytes |
| kind | string(20) | `image`, `video`, `audio`, `pdf`, `document`, `archive`, `other` (derivado del mime) |
| width / height | unsigned int nullable | solo imágenes (`getimagesize`) |
| checksum | char(64) | sha256 del contenido |
| timestamps | | |

Índices: `(user_id, folder_id)`, `(user_id, checksum)`.

### `fileables`
| Columna | Tipo | Notas |
|---|---|---|
| file_id | FK files, cascade | |
| fileable_type / fileable_id | `morphs('fileable')` | |
| position | unsigned smallint | orden dentro del post |
| timestamps | | |

Clave única: `(file_id, fileable_type, fileable_id)`.

## Backend (awesomeApp)

### Modelos
- `Folder`: `user()`, `parent()`, `children()`, `files()`; `ancestors()` devuelve la ruta raíz → carpeta
  (sube por `parent_id`; la profundidad es pequeña).
- `File` (`App\Models\File`; ojo, comparte nombre con la fachada `Illuminate\Support\Facades\File`):
  `user()`, `folder()`, `posts()` (`morphedByMany`); `isPublic()` = adjunto a algún post publicado;
  al borrarse elimina su archivo del disco (evento `deleted`).
- `Post::files()`: `morphToMany(File::class, 'fileable')->withPivot('position')->withTimestamps()->orderBy('fileables.position')`.
  Al forzar el borrado de un post se desvinculan sus archivos (los archivos siguen en el drive).
- `User::folders()`, `User::files()`.
- Interfaz `App\Contracts\OwnedPrivately` (la implementan `Folder` y `File`).

### Autorización
- `Gate::before` devuelve `null` cuando el primer argumento implementa `OwnedPrivately`; así la
  policy decide también para el Admin. El resto del sitio sigue igual.
- `FolderPolicy` y `FilePolicy`: `update`/`delete` solo para el dueño; si no, `Response::denyAsNotFound()` (404).
- `FilePolicy::view(?User $user, File $file)`: dueño, o `isPublic()`. Si no, 404.

### Validación (FormRequests)
- `StoreFolderRequest`: `name` requerido, ≤120, sin `/` ni `\`, único entre las hermanas;
  `parent_id` nullable y carpeta del usuario.
- `UpdateFolderRequest`: igual pero `sometimes`; `parent_id` no puede ser la carpeta ni una descendiente.
- `StoreFileRequest`: **un archivo por petición** (el front sube cada uno con su barra de progreso y su
  error); `file` requerido, `max:20480` (20 MB), extensión no bloqueada
  (`php`, `phtml`, `phar`, `php3-8`, `exe`, `msi`, `bat`, `cmd`, `sh`, `com`, `scr`, `jar`, `htaccess`);
  `folder_id` nullable y carpeta del usuario.
- `UpdateFileRequest`: `original_name` (≤255, sin `/` ni `\`; se conserva la extensión si se borra) y/o `folder_id`.
- `StorePostRequest`: `file_ids` nullable array, `file_ids.*` debe ser un archivo del usuario actual **o ya
  adjunto a ese post** (un Admin que edita el post de otro no pierde sus adjuntos).

### Actions (`app/Actions/Drive`)
- `StoreUploadedFile(User, UploadedFile, ?Folder): File`: guarda con `store("drive/{id}", 'local')` y
  extrae los metadatos. Si ya hay un archivo del usuario con el mismo `checksum`, la respuesta lo indica
  (`duplicate_of`) pero igual lo guarda.
- `DeleteFolder(Folder)`: borra subcarpetas y archivos (los archivos uno a uno en lotes `chunkById`
  para que se borre cada uno del disco), dentro de una transacción.
- `SyncFiles(Model $model, array $ids)`: `sync` con `position` según el orden recibido.

### Resources
- `FolderResource`: `id`, `name`, `parent_id`, `files_count`, `folders_count`, `created_at`.
- `FileResource`: todas las columnas útiles + `url` (`/api/files/{id}/{original_name}`) +
  `posts_count` en el admin.

### Controladores y rutas
Dentro de `Route::prefix('admin')->middleware(['auth:sanctum', 'role:Admin|Writer'])`:

| Método | Ruta | Acción |
|---|---|---|
| GET | `/admin/drive` | `DriveController@index`: `?folder=` → `{ folder, breadcrumbs, folders, files }`; `?q=` → archivos por nombre en todo el drive; `?kind=` filtra |
| GET | `/admin/drive/tree` | `DriveController@tree`: todas las carpetas del usuario (para "Mover a…") |
| POST | `/admin/drive/folders` | `FoldersController@store` |
| PATCH | `/admin/drive/folders/{folder}` | `FoldersController@update` (renombrar/mover) |
| DELETE | `/admin/drive/folders/{folder}` | `FoldersController@destroy` → `DeleteFolder` |
| POST | `/admin/drive/files` | `FilesController@store` (`throttle:drive`, 60/min) |
| PATCH | `/admin/drive/files/{file}` | `FilesController@update` |
| DELETE | `/admin/drive/files/{file}` | `FilesController@destroy` |

Pública (con sesión opcional de Sanctum para reconocer al dueño):

| GET | `/files/{file}/{name?}` | `ServeFileController` |
|---|---|---|

- Imágenes (salvo SVG) y PDF: `inline`; todo lo demás (incluidos SVG y HTML): `attachment` con el nombre original.
- Cabeceras: `X-Content-Type-Options: nosniff`; `Cache-Control: private, max-age=3600` (público solo si el archivo es público).

Posts: `store`/`update` del admin llaman a `SyncFiles` con `file_ids` cuando viene en la petición;
`edit` carga `files`. El `show` público carga `files` (solo los campos públicos de `FileResource`).

Activity log (`useLogName('drive')`): subir y borrar archivos, crear y borrar carpetas.

### Tests (PHPUnit, `Storage::fake('local')`)
- `DriveFoldersTest`: crear, renombrar, mover, nombre repetido (422), mover dentro de sí misma o de una
  descendiente (422), borrar en cascada (borra del disco), otro usuario (incluido Admin) → 404.
- `DriveFilesTest`: subir y comprobar metadatos (imagen con medidas, PDF, zip), extensión bloqueada (422),
  >20 MB (422), carpeta ajena (422), renombrar, mover, borrar (borra del disco), aislamiento, búsqueda.
- `ServeFileTest`: dueño ve el suyo; invitado → 404; adjunto a post publicado → 200 para invitados;
  adjunto solo a borrador → 404; SVG siempre `attachment`.
- `PostFilesTest`: adjuntar con orden, archivo ajeno (422), Admin edita post ajeno sin perder adjuntos,
  el `show` público trae `files`.

## Front (vue-project)

### Admin › Drive (`/admin/drive`, Element Plus)
- Ruta y menú "Drive" (Admin, Writer), icono de carpeta.
- Store `useDriveStore` (Pinia): carpeta actual, migas, carpetas, archivos, subidas en curso.
- Página:
  - Migas de la ruta (clic para subir de nivel); botones "Nueva carpeta" y "Subir"; buscador.
  - Zona para soltar archivos (`el-upload drag`, una petición por archivo, progreso y error por archivo).
  - Tabla: miniatura (imágenes) o icono por `kind`, nombre, tipo, tamaño legible, fecha, "en N posts".
    Doble clic en carpeta la abre; en imagen, vista previa (`el-image` preview).
  - Acciones por fila: renombrar, "Mover a…" (diálogo con `el-tree` de carpetas), descargar, borrar
    (al borrar una carpeta se avisa cuántos archivos contiene y cuántos están en posts).
  - La carpeta actual va en la URL (`?folder=`) para volver con atrás/adelante.
- El explorador es un componente (`DriveBrowser.vue`) con modo `select` reutilizado en el editor.

### Editor del post (`PostEditor.vue`)
- Sección "Archivos del drive": botón "Adjuntar del drive" abre `DriveBrowser` en modo selección
  (multiselección, navegar carpetas, buscar).
- Lista de adjuntos con miniatura/icono, subir/bajar para ordenar y quitar. Se envía `file_ids` al guardar.

### Blog (`Post/show.vue`)
- Carrusel: `photos` + imágenes de `files` (en ese orden). Con una sola imagen, se ve como hoy.
- "Archivos adjuntos": los `files` que no son imagen, con icono por tipo, nombre, tamaño y botón de descarga.

### Iconos
Los iconos nuevos se registran en `src/plugins/icons.ts` (MDI) y `src/layouts/Admin/element-icons.ts`
(Element), que validan los tests.

## Errores y casos borde
- Subida que falla (tamaño, tipo, red): el archivo queda en la lista de subidas con su mensaje y se puede reintentar.
- Borrar un archivo adjunto: se quita de esos posts (cascade de `fileables`); la interfaz avisa antes.
- Archivo que falta en el disco al servirlo: 404.
- Límites de PHP/nginx: `upload_max_filesize=30M`, `post_max_size=32M`, `client_max_body_size 32M`
  (ya documentados en `DEPLOY.md`), por encima de los 20 MB.

## Verificación
- `php artisan test` (backend), `npx vue-tsc --noEmit -p tsconfig.app.json` y `npx vitest run` (front).
- En el navegador con un usuario temporal (se borra al final): crear carpetas anidadas, subir varios
  archivos, mover, renombrar, borrar, adjuntar a un post, verlo en el blog como invitado, y comprobar
  que un archivo no adjunto da 404 sin sesión.
