import { watch, onBeforeUnmount, Ref } from 'vue';

export function useClickOutsideAdvanced(
  targetRef: Ref<HTMLElement | null>,
  handler: () => void,
  ignoreSelectors: string[] = [],
  enabled: Ref<boolean>
) {
  const listener = (event: MouseEvent) => {
    if (!enabled.value) return;

    const target = event.target as HTMLElement;
    const el = targetRef.value;

    if (!el || el.contains(target)) return;

    for (const selector of ignoreSelectors) {
      if (target.closest(selector)) return;
    }

    handler();
  };

  window.addEventListener('click', listener);

  onBeforeUnmount(() => {
    window.removeEventListener('click', listener);
  });
}