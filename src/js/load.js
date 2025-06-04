import { ref } from 'vue';
import LoadProcess from '@/components/LoadProcess.vue';

const LoadProcessPlugin = {
  install(app) {
    const LoadComponent = ref(null);

    app.component('LoadProcess', LoadProcess);
    app.config.globalProperties.$showLoad = function (status, title=null) {
      if (LoadComponent.value && LoadComponent.value.showSuccess) {
        LoadComponent.value.showSuccess(status, title);
      } else {
        console.error('Error showing success toast');
      }
    };

    app.mixin({
      mounted() {
        if (this.$options.name === "LoadProcess") {
          LoadComponent.value = this;
        }
      },
    });
  },
};

export default LoadProcessPlugin;