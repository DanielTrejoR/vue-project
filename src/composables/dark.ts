import { useDark, useToggle } from "@vueuse/core";

export const isDark = useDark({
    selector: 'html', // default
    storageKey: 'theme',
})

export const toggleDark = useToggle(isDark)
