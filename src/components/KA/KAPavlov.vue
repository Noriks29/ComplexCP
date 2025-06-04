<template>
  <div class="main_contain">
    <DefaultTable v-if="ShowDefaultTable" :dataLableName="dataLableName" :dataTable="dataTable" @closetable="ShowDefaultTable = false" :prevrap="false"/>
    <PlanPavlov v-if="modellingSettings.showTable == 'Plan'" :dataTable="modellingRezult.eventData" @closetable="modellingSettings.showTable = null"/>
    <NodeLoad v-if="modellingSettings.showTable == 'NodeLoad'" :dataTable="modellingRezult.eventData" @closetable="modellingSettings.showTable = null"/>
    <div class="ContentDiv">
        <div class="FlexRow Panel">
          <div class="ButtonModelling">
            <div><input type="checkbox"  v-model="interSatellite"/><label>interSatellite: {{ interSatellite }}</label></div>
            <button  @click="StartModelling" class="ButtonCommand rightPadding"><img src="../../assets/start.png" alt="" class="iconButton">Старт планирования</button>
          </div>
        <div class="PanelWork">
          <table class="colum">
            <tbody>
            <tr>
              <td><button class="ButtonCommand" @click="ShowPlan" :class="(modellingRezult.eventData.length < 1) ? 'disable' : ''">План</button></td>
              <td><button class="ButtonCommand" @click="ShowNodeLoad" :class="(modellingRezult.eventData.length < 1) ? 'disable' : ''">Нагрузка узлов</button></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { FetchGet, FetchPost } from '@/js/LoadDisplayMetod';
import DefaultTable from '../DefaultTable.vue';
import { UnixToDtime } from '@/js/WorkWithDTime';
import { KaSettings } from './KaSettings';
import PlanPavlov from './Pavlov/PlanPavlov.vue';
import NodeLoad from './Pavlov/NodeLoad.vue';
import { NPList, OGList, SystemObject } from '@/js/GlobalData';
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
      this.$showLoad(true);
      let rezult = await FetchPost("/api/v1/planner", {"interSatellite": this.interSatellite}, undefined, true) || null
      try {
        this.modellingRezult= rezult.XMLDocument
        this.$showToast('План успешно получен','success', 'Планирование');
      } catch (error) {
        this.$showToast('Ошибка расчёта'+error,'error', 'Планирование');
      }
      await this.ParceRezult()
      this.$showLoad(false);
    },
    ParceRezult(){
      console.log(this.modellingRezult, "Обработка результатов")
      this.modellingRezult.JsonData = JSON.stringify(this.modellingRezult,null,2)
      let time = SystemObject.modelingBegin
      console.log(SystemObject.modelingBegin)
      let plan = this.modellingRezult.report.plan
      plan.time.sort(function(a, b) { // Обработка времени интервалов
          return parseFloat(a.interval) - parseFloat(b.interval);
      });
      plan.time.forEach(element => {
        element.timeUnixstart = UnixToDtime(time,false)
        element.timeStart = time
        time+=element.text
        element.timeEnd = time
        element.timeUnixend = UnixToDtime(element.timeEnd,false)
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
      try {
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
      } catch (error) {
        if(dataToPrevrap.transport==undefined) dataPrevrap.transport = []
        this.$showToast('Проблемы с операциями передачи','warning', 'Обработка');
      }
      try{
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
      } catch (error) {
        if(dataToPrevrap.process==undefined) dataPrevrap.process = []
        this.$showToast('Проблемы с операциями обработки','warning', 'Обработка');
      }
      try {
          dataToPrevrap.lost.forEach(el => {
              el.typeEl='Потери';el.volume=el.text; dataPrevrap.push(el);
          })
      } catch (error) {
          console.log("Потерь нет")//Переделать это под не возможность потерь и отображение
          if(dataToPrevrap.lost==undefined) dataPrevrap.lost = []
      }
      try{
        dataToPrevrap.storage.forEach(el => {
          el.typeEl='Хранение'; el.volume = el.text;dataPrevrap.push(el);
        })
      } catch (error) {
          console.log("Потерь нет")//Переделать это под не возможность потерь и отображение
          if(dataToPrevrap.storage==undefined) dataPrevrap.storage = []
          this.$showToast('Проблемы с операциями Хранения','warning', 'Обработка');
      }
      
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
    async GetRezultPavlov(){
      let rezult = await FetchGet("/api/v1/planner/all") || null
      try {
        this.modellingRezult= rezult.XMLDocument
        this.$showToast('План найден в базе','info', 'Планирование');
      } catch {
        console.log()
      }
      await this.ParceRezult()
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