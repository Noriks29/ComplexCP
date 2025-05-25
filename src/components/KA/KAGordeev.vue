<template>
    <div class="main_contain">
      <DefaultTable v-if="ShowDefaultTable" :dataLableName="dataLableName" :dataTable="dataTable" @closetable="ShowDefaultTable = false" :prevrap="PreWrapDefaultTable"/>
      <div class="ContentDiv">
        <div class="FlexRow Panel">
          <div class="ButtonModelling">
            <button v-if="!ExperimentStatus && !modellingSettings.experimentEddit" @click="Experiment(true)" class="ButtonCommand rightPadding"><img src="../../assets/start.png" alt="" class="iconButton">Начать эксперимент</button>
            <button v-if="ExperimentStatus" @click="StartModelling" class="ButtonCommand rightPadding"><img src="../../assets/start.png" alt="" class="iconButton">Старт моделирования</button>
            <button v-if="ExperimentStatus" @click="Experiment(false)" class="ButtonCommand rightPadding">Закончить эксперимент</button>
          </div>
          <fieldset style="display: inline-block;">
            <div><input type="checkbox"  v-model="PreWrapDefaultTable"/><label>Форматирование вывода: {{ PreWrapDefaultTable }}</label></div>
          </fieldset>
          <div class="PanelWork" v-if="!modellingSettings.experimentEddit">
          <table class="colum">
            <tbody>
              <tr>
                <td><button class="ButtonCommand LIghtPoint" @click="GetRezultGordeev"><div :class="systemStatus.successRouteModelling ? 'approved' : 'Notapproved'"></div>Результат(переделать на разделы)</button></td>
              </tr>
              <tr>
                <td><button class="ButtonCommand" @click="ShowRezult()" :class="(modellingRezult.data.length < 1) ? 'disable' : ''">Показать Результат(убрать)</button></td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
</template>
  
<script>

import { DisplayLoad, FetchGet } from '@/js/LoadDisplayMetod';
import DefaultTable from '../DefaultTable.vue';
import { GetSystemObject } from '@/js/GlobalData';

import { KaSettings } from './KaSettings';
  export default {
    name: 'KA2',
    mixins: [KaSettings],
    data(){
      return{
        modellingRezult: {
          data: []
        },
        modellingSettings:{
          experimentEddit: false
        },
        interSatellite: true,
        dataTable: [],
        dataLableName: [],
        PreWrapDefaultTable: false,
        ShowDefaultTable: false
      }
    },
    components:{
      DefaultTable
    },
    methods: {
      Experiment(status){
          this.modellingRezult= {
            data: [],
          }
        this.$emit('ChangeExperimentStatus', {status})
      },
      async StartModelling(){
        DisplayLoad(true)
        this.StartAwait("successRouteModelling")
        let rezult = await FetchGet("/api/v1/route", true, "Расчёт Route окончен") || []
        console.log(rezult)
        DisplayLoad(false)
      },
      StartAwait(param){
        setTimeout(() => {
          let interval = setInterval(async () => {
            let system = await GetSystemObject()
            console.log(system)
            console.log("идут запросы системы")
            if(system[param]){
              clearInterval(interval)
              console.log("Интревал оборван")
            }
          }, 3000);
        }, 4000);
      },
      async GetRezultGordeev(){
        this.modellingRezult.data = await FetchGet("/api/v1/route/all") || []
      },
      ShowRezult(){
        this.dataTable = []
        this.dataLableName = [{label: "data", nameParam: "data"}]
        let dataT = this.modellingRezult.data
        for (let index = 0; index < dataT.length; index++) {
          const element = JSON.stringify(dataT[index], null, 2);
          console.log(element)
          this.dataTable.push({data: element}) 
        }
        this.ShowDefaultTable = true
      },
      async ReLoadComponent(){
        console.log("Перезагрузка")
      }
    },
    async mounted(){
      this.ReLoadComponent()
    }
  }
  </script>


<style lang="scss" scoped>
.LIghtPoint{

  div{
    position: absolute;
    width: 10px;
    height: 10px;
    top: 20%;
    left: 10px;
    border-radius: 20px;

    &.approved{
      background-color: rgb(0, 139, 0);
      box-shadow: 0px 0px 5px rgb(11, 167, 11);
    }
    &.Notapproved{
      background-color: red;
      box-shadow: 0px 0px 5px #fe1a1a;
    }
  }


}
</style>