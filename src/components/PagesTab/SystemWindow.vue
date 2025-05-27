<template>
  <table class="TableDefault"><tbody>
    <tr><td>Начальное время расчетов</td><td>
            <DateTime :valueUnix="dataSystem.startTime" :id="'startTime'"  @valueSelect="ChangeTime"/>
          </td></tr>
          <tr><td>Начало горизонта планирования</td><td>
            <DateTime :valueUnix="dataSystem.modelingBegin" :id="'modelingBegin'"  @valueSelect="ChangeTime"/>
          </td></tr>
          <tr><td>Окончание горизонта планирования</td><td>
            <DateTime :valueUnix="dataSystem.modelingEnd" :id="'modelingEnd'" @valueSelect="ChangeTime"/>
          </td></tr>
          <tr><td>Шаг интегрирования баллистики</td><td><input placeholder="Введите шаг" class="inputType2" id="step" @change="ChangeParam" type="number" min="0" :value="dataSystem.step"></td></tr>
        </tbody></table>
  </template>
  <script>
import DateTime from '../DateTime.vue';
import { PagesSettings } from './PagesSettings';
import { SystemObject, ChangeSystemObject } from '@/js/GlobalData';

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
