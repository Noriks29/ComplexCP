<template>
  <table class="TableDefault"><tbody>
    <tr><td>Интервал TLE:</td><td>
            {{ CreateDateTime(dataSystem.minTleTime)}}
          </td></tr>
    <tr><td></td><td>
            {{ CreateDateTime(dataSystem.maxTleTime) }}
          </td></tr>
          <tr><td colspan="1">Начало горизонта планирования:</td><td>
            <DateTime :valueUnix="dataSystem.modelingBegin" :id="'modelingBegin'"  @valueSelect="ChangeTime"/>
          </td></tr>
          <tr><td  colspan="1">Окончание горизонта планирования:</td><td>
            <DateTime :valueUnix="dataSystem.modelingEnd" :id="'modelingEnd'" @valueSelect="ChangeTime"/>
          </td></tr>
          <tr><td  colspan="1">Шаг интегрирования баллистики:</td><td><input placeholder="Введите шаг" class="inputType2" id="step" @change="ChangeParam" type="number" min="0" :value="dataSystem.step"></td></tr>
        </tbody></table>
  </template>
  <script>
import DateTime from '../DateTime.vue';
import { PagesSettings } from './PagesSettings';
import { SystemObject, ChangeSystemObject } from '@/js/GlobalData';
import { CreateDateTime } from '@/js/WorkWithDTime';
  export default {
    name: 'SystemWindow',
    mixins: [PagesSettings],
    components:{
      DateTime
    },
    data(){
      return{
        dataSystem:{}
      }
    },
    methods: {
      CreateDateTime(time){
        return CreateDateTime(time)
      },
      ChangeTime(obgTime){
        ChangeSystemObject(obgTime.id, obgTime.time)
      },
      ChangeParam(target){
        ChangeSystemObject('step',  Math.floor(target.target.value))
      },
    },
    created(){
      this.dataSystem = SystemObject
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
</style>
