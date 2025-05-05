<template>
  <table class="TableDefault"><tbody>
    <tr><td>Начальное время расчетов(потом убрать)</td><td>
            <DateTime :valueUnix="dataSystem.startTime" :id="'startTime'"  @valueSelect="ChangeTime"/>
          </td></tr>
          <tr><td>Начало горизонта планирования</td><td>
            <DateTime :valueUnix="dataSystem.modelingBegin" :id="'modelingBegin'"  @valueSelect="ChangeTime"/>
          </td></tr>
          <tr><td>Окончание горизонта планирования</td><td>
            <DateTime :valueUnix="dataSystem.modelingEnd" :id="'modelingEnd'" @valueSelect="ChangeTime"/>
          </td></tr>
          <tr><td>Шаг интегрирования баллистики</td><td><input id="step" @change="ChangeParam" type="number" min="0" :value="dataSystem.step"><label for="step"></label></td></tr>
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
