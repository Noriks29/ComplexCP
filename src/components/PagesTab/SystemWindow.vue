<template>
  <table class="TableDefault"><tbody>
    <tr><td>Интервал расчёта группировки:</td><td>
            {{ (dataSystem.minTleTime ? CreateDateTime(dataSystem.minTleTime) : 'Не указан' ) + " -- "}}
            
            {{ dataSystem.maxTleTime ? CreateDateTime(dataSystem.maxTleTime) : 'Не указан'}}
          </td><td rowspan="4"><button class="ButtonCommand ButtonUpload" :class="!systemChange ? 'disable': ''" @click="SaveSystem"><img src="@/assets/save.svg" alt=""></button></td></tr>
          <tr><td colspan="1">Начало горизонта планирования:</td><td>
            <DateTime :valueUnix="dataSystem.modelingBegin" :id="'modelingBegin'"  @valueSelect="ChangeTime"/>
          </td></tr>
          <tr><td  colspan="1">Окончание горизонта планирования:</td><td>
            <DateTime :valueUnix="dataSystem.modelingEnd" :id="'modelingEnd'" @valueSelect="ChangeTime"/>
          </td></tr>
          <tr><td  colspan="1">Шаг интегрирования баллистики:</td><td><input placeholder="Введите шаг" class="inputType2" id="step" @change="ChangeParam" type="number" min="0" v-model="dataSystem.step"></td></tr>
        </tbody></table>
  </template>
  <script>
import DateTime from '../DateTime.vue';
import { PagesSettings } from './PagesSettings';
import { CreateDateTime } from '@/js/WorkWithDTime';
  export default {
    name: 'SystemWindow',
    mixins: [PagesSettings],
    components:{
      DateTime
    },
    data(){
      return{
        dataSystem:{},
        systemChange: false
      }
    },
    methods: {
      CreateDateTime(time){
        return CreateDateTime(time)
      },
      ChangeTime(obgTime){
        this.systemChange = true
        if(obgTime.id == 'modelingBegin'){
          this.dataSystem.startTime = obgTime.time
          //this.$ChangeSystemObject('startTime', obgTime.time)
        }
        this.dataSystem[obgTime.id] = obgTime.time
        //this.$ChangeSystemObject(obgTime.id, obgTime.time)
      },
      ChangeParam(){
        this.systemChange = true
        //this.$ChangeSystemObject('step',  Math.floor(target.target.value))
      },
      async SaveSystem(){
        await this.$ChangeSystemObject(null, null, this.dataSystem)
        this.systemChange = false
      },
      
      async reload(){
        this.dataSystem = await this.$SystemObject()
      }
    },
    async created(){
      this.dataSystem = await this.$SystemObject()
    },
  }
  </script>

<style lang="scss" scoped>
.TableDefault{
  background: none;
  text-align: left;
  filter: none;
  tr{
    background: none;
  }
}
.ButtonUpload{
  padding: 30px 10px;
  img{
    width: 20px;
  }
}
</style>
