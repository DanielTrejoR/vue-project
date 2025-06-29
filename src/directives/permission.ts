import { DirectiveBinding } from 'vue';
import store from '~/store'; // o usa useStore()

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const userPerms = store.getters && store.getters.permissions;
    const requiredPerms = binding.value;

    const allowed = Array.isArray(requiredPerms)
      ? requiredPerms.every((p) => userPerms.includes(p))
      : userPerms.includes(requiredPerms);

    if (!allowed) el.remove();
  }
};