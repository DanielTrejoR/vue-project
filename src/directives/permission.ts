import type { DirectiveBinding } from 'vue';
import { pinia } from '~/stores';
import { useAuthStore } from '~/stores/auth';

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const userPerms = useAuthStore(pinia).permissions;
    const requiredPerms = binding.value;

    const allowed = Array.isArray(requiredPerms)
      ? requiredPerms.every((p) => userPerms.includes(p))
      : userPerms.includes(requiredPerms);

    if (!allowed) el.remove();
  }
};