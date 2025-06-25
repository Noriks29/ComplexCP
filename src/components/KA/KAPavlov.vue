<template>
  <div class="main_contain">
    <PlanPavlov v-if="modellingSettings.showTable == 'Plan'" :dataTable="modellingRezult.eventData" @closetable="modellingSettings.showTable = null"/>
    <NodeLoad v-if="modellingSettings.showTable == 'NodeLoad'" :dataTable="modellingRezult.eventData" :summary="summary" @closetable="modellingSettings.showTable = null"/>
    <div class="ContentDiv">
        <div class="FlexRow">
          <div class="ButtonModelling">
            <div><label><input type="checkbox" class="checkbox-input" v-model="interSatellite"/>Межспутниковая связь</label></div>
            <div><label><input type="checkbox" class="checkbox-input" v-model="scProcess"/>Обработка на борту</label></div>
            <button  @click="StartModelling" class="ButtonCommand rightPadding"><img src="../../assets/start.png" alt="" class="iconButton">Старт планирования</button>
          </div>
        <div class="PanelWork">
          <table class="colum">
            <tbody>
              <tr>
              <td style="text-align: end;">Важность планирования:</td>
              <td class="SliderModelling"><div>
                <div class="labelDiv">
                  <label id="volumeM">MAX Объём</label>
                  <input type="number" class="inputType1" style="width: 75px;" v-model="sliderPriority">
                  <label id="lostM">MIN Потери</label>
                </div>
                <input @change="console.log($event.target.value)" type="range"  min="0" max="1" step="0.01" v-model="sliderPriority"/>
              </div></td>
            </tr></tbody></table>
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

import { UnixToDtime } from '@/js/WorkWithDTime';
import { KaSettings } from './KaSettings';
import PlanPavlov from './Pavlov/PlanPavlov.vue';
import NodeLoad from './Pavlov/NodeLoad.vue';
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
      summary: {},
      interSatellite: true,
      scProcess: false,
      sliderPriority: 0.1,
    }
  },
  components:{
    PlanPavlov,
    NodeLoad
  },
  methods: {
    async StartModelling(){
      this.$showLoad(true);
      let rezult = await this.$FetchPost("/api/v1/planner", {"interSatellite": this.interSatellite, "maxVolume": 1-this.sliderPriority,"minLost": this.sliderPriority*(-1), "scProcess": this.scProcess}, undefined, true) || null
      try {
        this.modellingRezult= rezult.XMLDocument
        this.$showToast('План успешно получен','success', 'Планирование');
      } catch (error) {
        this.$showToast('Ошибка расчёта'+error,'error', 'Планирование');
      }
      await this.ParceRezult()
      this.$showLoad(false);
    },
    async ParceRezult(){
      console.log(this.modellingRezult, "Обработка результатов")
      this.modellingRezult.eventData = []
      this.summary = this.modellingRezult.report.summary
      let time = (await this.$SystemObject()).modelingBegin
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
      let NPList = await this.$NPList()
      NPList.forEach(GS => {
          objectList[GS.id] = {id: GS.id, name: GS.nameEarthPoint, type: 'GS'}
      })
      let OGList = await this.$OGList()
      OGList.forEach(OG => {
          OG.satellites.forEach(SAT => {
              objectList[SAT.tleId] = {id: SAT.tleId, name: SAT.name, type: 'SAT'}
          })
      })
      try{
      dataToPrevrap.inputflow.forEach(el => {
          el.typeEl = "Съёмка";
          el.volume = el.text
          el.time = 1 // тестово 1 секунда 
          dataPrevrap.push(el)
      })
      } catch (error) {
        if(dataToPrevrap.inputflow==undefined) dataPrevrap.inputflow = []
        this.$showToast('Проблемы с входными потоками','warning', 'Съёмка');
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
        dataToPrevrap.storage.forEach(el => {
          el.typeEl='Хранение'; el.volume = el.text;dataPrevrap.push(el);
        })
      } catch (error) {
          console.log("Потерь нет")//Переделать это под не возможность потерь и отображение
          if(dataToPrevrap.storage==undefined) dataPrevrap.storage = []
          this.$showToast('Проблемы с операциями Хранения','warning', 'Обработка');
      }
      try {
          dataToPrevrap.lost.forEach(el => {
              el.typeEl='Потери';el.volume=el.text; dataPrevrap.push(el);
          })
      } catch (error) {
          console.log("Потерь нет")//Переделать это под не возможность потерь и отображение
          if(dataToPrevrap.lost==undefined) dataPrevrap.lost = []
      }
      
      dataPrevrap.sort((a,b) => {
        return a.interval - b.interval
      })
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
      let rezult = await this.$FetchGet("/api/v1/planner/all") || null
      try {
        this.modellingRezult= rezult.XMLDocument
        this.$showToast('План найден в базе','info', 'Планирование');
      } catch {
        console.log()
      }
      await this.ParceRezult()
    },
    async ReLoadComponent(){
      this.GetRezultPavlov()
    }
  },
  async mounted(){
    console.log(this.modellingRezult)
    this.ReLoadComponent()
  }
}
</script>


<style lang="scss" scoped>

.checkbox-input {
    appearance: none;
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--color-border1);
    border-radius: 0.25rem;
    background-color: var(--color-bg-panel);
    cursor: pointer;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    margin: 0 5px 0 0;

}
.checkbox-input:checked {
    background-color: var(--color-border1);
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e");
}
.ButtonModelling{
    display: flex;
    align-items: flex-start;
    height: 100%;
    justify-content: space-around;
    div{
      display: flex;
    }
}

.SliderModelling{
  width: 70%;
  div{
    .labelDiv{
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    input{
      padding: 0px !important;
      width: calc(100% - 20px);
      flex: 1;
      margin: 0px 10px;
      height: 30px;
      text-align: center;
    }
  }
}
</style>