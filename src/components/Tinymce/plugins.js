// Plugins de TinyMCE 8 (los de la 4.x como paste, hr, textcolor o contextmenu ya son parte del núcleo).
// "media" no se incluye: el backend purifica el cuerpo y quita los iframes; para embeds está el campo iframe del post.
// Cada plugin tiene que estar importado en ./setup.ts
const plugins = 'advlist anchor autolink autosave charmap code codesample directionality emoticons fullscreen image insertdatetime link lists nonbreaking pagebreak preview searchreplace table visualblocks visualchars wordcount'

export default plugins
