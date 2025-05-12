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
            <div><input type="checkbox"  v-model="interSatellite"/><label>interSatellite: {{ interSatellite }}</label></div>
          </fieldset>
        <div class="PanelWork">
          <table class="colum">
            <tr>
              <td><button class="ButtonCommand LIghtPoint" @click="GetRezultPavlov"><div :class="systemStatus.successPlannerModelling ? 'approved' : 'Notapproved'"></div>Результат(подгрузить)</button></td>
            </tr>
            <tr>
              <td><button class="ButtonCommand" @click="ShowRezult()" :class="(modellingRezult.data.length < 1) ? 'disable' : ''">Результат(отобразить)</button></td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { DisplayLoad, FetchGet, FetchPost } from '@/js/LoadDisplayMetod';
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
      this.StartAwait("successPlannerModelling")
      let rezult = await FetchPost("/api/v1/planner", {"interSatellite": this.interSatellite}, undefined, true, "Расчёт Planner окончен") || []
      console.log(rezult)
      this.modellingRezult.data = rezult
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
    async GetRezultPavlov(){
      this.modellingRezult.data = await FetchGet("/api/v1/planner/all") || []
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

</style>