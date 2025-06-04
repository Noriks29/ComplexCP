import { ref } from 'vue';
import LoadProcess from '@/components/LoadProcess.vue';
import { adress } from './config_server';
const ShowFetchData = true
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
    app.config.globalProperties.$FetchGet = async function (http, AlertError = true, massage=null){
        let AcsessKey = localStorage.data
        try {
            const response = await fetch('http://'+adress+http+'?accessKey='+AcsessKey);
            if (!response.ok) { // для мэссэджей ильяса
                let rezult = await response.json()
                if(ShowFetchData) console.log(http,rezult)
                throw new Error(rezult.MESSAGE);
            }
            else{
                let rezult = await response.json()
                if(ShowFetchData) console.log(http, rezult)
                if(massage != null) alert(massage)
                return rezult;
            }
        } catch (error) {
            console.log('Error during fetch:', error);
            if(AlertError) alert("Ошибка запроса, дальнейшая работа может быть некорректной!" + error)
            return undefined
        }
    }
    app.config.globalProperties.$FetchPost = async function (http,datapost,dopparamhttp, AlertError = true, massage=null){
        if(ShowFetchData) console.log(JSON.stringify(datapost))
        let AcsessKey = localStorage.data
        if(dopparamhttp != undefined){
            AcsessKey = AcsessKey +"&"+dopparamhttp
        }
        try {
            const response = await fetch('http://'+adress+http+'?accessKey='+AcsessKey,{
              method:  'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(datapost)
            })
            if (!response.ok) {
                let rezult = await response.json()
                if(ShowFetchData) console.log(http,rezult)
                throw new Error(rezult.MESSAGE);
            }
            else{
                let rezult = await response.json()
                if(ShowFetchData) console.log(http, rezult)
                if(massage != null) alert(massage)
                return rezult;
            }
            } catch (error) {
                console.log('Error save:', error);
                if(AlertError) alert("ОШИБКА ОТПРАВКИ  " + error)
                return undefined;
            }
    }

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