<template>
  <div class="main_contain">
    <DefaultTable v-if="ShowDefaultTable" :dataLableName="dataLableName" :dataTable="dataTable" @closetable="ShowDefaultTable = false" :prevrap="false"/>
    <PlanPavlov v-if="modellingSettings.showTable == 'Plan'" :dataTable="modellingRezult.eventData" @closetable="modellingSettings.showTable = null"/>
    <NodeLoad v-if="modellingSettings.showTable == 'NodeLoad'" :dataTable="modellingRezult.eventData" @closetable="modellingSettings.showTable = null"/>
    <div class="ContentDiv">
        <div class="FlexRow Panel">
          <div class="ButtonModelling">
            <div><input type="checkbox"  v-model="interSatellite"/><label>interSatellite: {{ interSatellite }}</label></div>
            <button @click="StartModelling" class="ButtonCommand rightPadding"><img src="../../assets/start.png" alt="" class="iconButton">Старт моделирования</button>
          </div>
        <div class="PanelWork">
          <table class="colum">
            <tbody>
            <tr>
              <td><button class="ButtonCommand" @click="ShowPlan" :class="(modellingRezult.eventData.length < 1) ? 'disable' : ''">План</button></td>
              <td><button class="ButtonCommand" @click="ShowNodeLoad" :class="(modellingRezult.eventData.length < 1) ? 'disable' : ''">Нагрузка узлов</button></td>
            </tr>
            <tr>
              <td><button class="ButtonCommand" @click="ShowRezult()" :class="(false) ? 'disable' : ''">Результат(отобразить)</button></td>
            </tr>
            </tbody>
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
import { UnixToDtime } from '@/js/WorkWithDTime';
import { KaSettings } from './KaSettings';
import PlanPavlov from './Pavlov/PlanPavlov.vue';
import NodeLoad from './Pavlov/NodeLoad.vue';
import { NPList, OGList } from '@/js/GlobalData';
export default {
  name: 'KA2',
  mixins: [KaSettings],
  data(){
    return{
      modellingRezult: {
          data: [],
          eventData: []
        },
        modellingSettings:{
          showTable: null
        },
      interSatellite: true,
      dataTable: [],
      dataLableName: [],
      ShowDefaultTable: false
    }
  },
  components:{
    DefaultTable,
    PlanPavlov,
    NodeLoad
  },
  methods: {
    async StartModelling(){
      DisplayLoad(true)
      this.StartAwait("successPlannerModelling")
      let rezult = await FetchPost("/api/v1/planner", {"interSatellite": this.interSatellite}, undefined, true, "Расчёт Planner окончен") || null
      console.log(rezult)
      try {
        this.modellingRezult= rezult.XMLDocument
      } catch (error) {
        console.error(error)
      }
      await this.ParceRezult()
      DisplayLoad(false)
    },
    ParceRezult(){
      console.log(this.modellingRezult, "Обработка результатов")
      this.modellingRezult.JsonData = JSON.stringify(this.modellingRezult,null,2)
      let time = 0
      let plan = this.modellingRezult.report.plan
      plan.time.sort(function(a, b) { // Обработка времени интервалов
          return parseFloat(a.interval) - parseFloat(b.interval);
      });
      plan.time.forEach(element => {
        element.timeUnixstart = UnixToDtime(time,true)
        element.timeStart = time
        time+=element.text
        element.timeEnd = time
        element.timeUnixend = UnixToDtime(element.timeEnd,true)
      });

      let dataToPrevrap = plan
      let dataPrevrap = []
      let objectList = {}
      
      NPList.forEach(GS => {
          objectList[GS.id] = {id: GS.id, name: GS.nameEarthPoint, type: 'GS'}
      })
      OGList.forEach(OG => {
          OG.satellites.forEach(SAT => {
              objectList[SAT.tleId] = {id: SAT.tleId, name: SAT.name, type: 'SAT'}
          })
      })
      dataToPrevrap.transport.forEach(el => {
         el.typeEl='Передача'; 
         el.time = el.text
         for (let i = 0; i < dataToPrevrap.to_transport.length; i++) {
              const element = dataToPrevrap.to_transport[i];
              if(el.interval == element.interval && element.object == el.object){
                  el.volume = element.text
                  break
              }
          }
         dataPrevrap.push(el);
      })
      dataToPrevrap.process.forEach(el => {
          el.typeEl = "Обработка";
          el.time = el.text
          for (let i = 0; i < dataToPrevrap.to_process.length; i++) {
              const element = dataToPrevrap.to_process[i];
              if(el.interval == element.interval && element.object == el.object){
                  el.volume = element.text
                  break
              }
          }
          dataPrevrap.push(el)
      })
      try {
          dataToPrevrap.lost.forEach(el => {
              el.typeEl='Потери';el.volume=el.text; dataPrevrap.push(el);
          })
      } catch (error) {
          console.log("Потерь нет")//Переделать это под не возможность потерь и отображение
      }
      dataToPrevrap.storage.forEach(el => {
         el.typeEl='Хранение'; el.volume = el.text;dataPrevrap.push(el);
      })
      
      dataPrevrap.sort((a,b) => {return a.interval - b.interval})
      dataPrevrap.forEach(event => {
        event.intervalTime = dataToPrevrap.time[event.interval-1]
        event.objectName = objectList[event.object]
        event.to_objectName = objectList[event.to_object] || {name : ''}
      })
      this.modellingRezult.eventData=dataPrevrap
      console.log(this.modellingRezult, "Обработка результатов финал")
    },
    ShowPlan(){
      this.modellingSettings.showTable = 'Plan'
    },
    ShowNodeLoad(){
      this.modellingSettings.showTable = 'NodeLoad'
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
      DisplayLoad(true)
      let rezult = await FetchGet("/api/v1/planner/all") || null
      try {
        this.modellingRezult= rezult.XMLDocument
      } catch (error) {
        console.error(error)
      }
      await this.ParceRezult()
      DisplayLoad(false)
    },
    ShowRezult(){
      this.dataTable = []
      this.dataLableName = [{label: "data", nameParam: "data"}]
      this.dataTable.push({data: this.modellingRezult.JsonData}) 
      this.ShowDefaultTable = true

    },
    async ReLoadComponent(){
      this.GetRezultPavlov()
    }
  },
  async mounted(){
    this.ReLoadComponent()
  }
}
</script>


<style lang="scss" scoped>

</style>