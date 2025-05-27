<template>
    <div class="main_contain RowSection">
          <div>
            <button class="ToMenuButtonDiv" @click="SelectComponent('TemplateComponent')">
              <img src="../../assets/exit.svg">
            </button>
          </div>
    <div class="ContentDiv">
      <div class="Panel LeftPanel">
            <div class="FlexColumn">
              <div style="display: flex;align-items: center; white-space: nowrap; margin: 5px;">Минимальный угол <input type="number" :value="experimentObject.angle" @change="experimentObject.angle=Number($event.target.value)"></div>
              <div><button @click="CommandWork(1)" class="ButtonCommand">Рассчитать окна видимости</button></div>
              <div><button @click="CommandWork(2)" class="ButtonCommand">Расчёт плана контактов</button></div>
              <div><button @click="CommandWork(3)" class="ButtonCommand">Показать окна видимости / плана контактов</button></div>
              <div><button @click="CommandWork(4)" class="ButtonCommand">Графическое представление плана контактов</button></div>
            </div>
        </div>
        <div class="Panel RightPanel">
          <div v-if="PageSettings.status == 1">
            <table class="TableDefault">
            <thead><tr><th>КА</th><th>Видимый КА</th><th>Начало</th><th>Конец</th></tr></thead>
              <tbody><tr v-for="data, index in PageSettings.SatSat" :key="index">
                <td>{{ data.satellite1 }}</td><td>{{ data.satellite2 }}</td><td>{{ data.beginUnix }}</td><td>{{ data.endUnix }}</td>
              </tr>
            </tbody></table>
          </div>
          <div id="plotlymapContain1" style="height: 79vh;"></div>
          </div>
        </div>
    </div>

    
  </template>
  
  <script>

import {DisplayLoad, FetchGet, FetchPost} from '../../js/LoadDisplayMetod.js'
import { PagesSettings } from './PagesSettings.js';
import Plotly from 'plotly.js-dist'

  export default {
    name: 'LeaderConstellationConstellation',
    mixins: [PagesSettings],
    data(){
      return{
        clusterTopology: [], // топология сети
        networkClaster: [], //полносвязная сеть
        lessConstellation: [], // облегчённый список ог для селектора
        PageSettings:{
          mode: false, //лидер / все
          status: 1, //код открытого окна
          SatNp: [], //список контактов сат-нп
          SatSat: [], //список контактов сат-сат
        },
        experimentObject: {angle: 0}, //обьект отправки пост
        ShowPlotlyContain: false,
      }
    },
    methods: {
      async AddRow(mode){
        switch (mode) {
          case 'clusterTopology':
            this.clusterTopology.push({
              "cluster1": this.lessConstellation[0].value,
              "cluster2": this.lessConstellation[1].value,
              "beginTime": null,
              "endTime": null,
              "deleted": null
            })
            await FetchPost('/api/v1/topology/update', this.clusterTopology, null)
            this.ReFetch()
            break;
          case 'network':
            this.networkClaster.push({
                "beginTime": 10000000,
                "endTime": 10002000,
                "deleted": null
              })
            await FetchPost('/api/v1/network/update', this.networkClaster, null)
            this.ReFetch()
          
            break;
        
          default:
            break;
        }
      },


       async CommandWork(commandId){
            DisplayLoad(true)
            let dataPlotly = null
            switch (commandId) {
              case 0:
                this.PageSettings.status = 0
                
                break;
              case 1:
                document.getElementById("plotlymapContain1").innerHTML=''
                if(this.PageSettings.mode) await FetchPost('/api/v1/cluster/pro42',this.experimentObject, null)
                else await FetchGet('/api/v1/pro42/view/sat', null)
                await this.ReFetch()
                break;
              case 2:
                document.getElementById("plotlymapContain1").innerHTML=''
                await FetchGet('/api/v1/contact-plan/sat')
                await this.ReFetch()
                this.PageSettings.status = 1
                break;

              case 3:
                //Таблица сат-сат
                this.PageSettings.status = 1
                break;
              
              case 4:
                this.PageSettings.status = 4
                document.getElementById("plotlymapContain1").innerHTML=''
                if(this.PageSettings.SatSat.length < 1 ) return
                this.ShowPlotlyContain = true
                dataPlotly = []

                this.PageSettings.SatSat.forEach(element => {
                  let flagadd = false
                  dataPlotly.forEach(plot => {
                    if(plot.name == element.satellite2){
                      plot.y.push(element.satellite1+"-"+element.satellite2)
                      plot.x.push(this.CreateDateTime(element.end - element.begin, 2))
                      plot.base.push(this.CreateDateTime(element.begin, 1))
                      flagadd = true
                    }
                  })
                  if(!flagadd){
                    dataPlotly.push({
                      type: 'bar',
                      name: element.satellite2,
                      y: [element.satellite1+"-"+element.satellite2],
                      x: [this.CreateDateTime(element.end - element.begin, 2)],
                      orientation: 'h',
                      base: [this.CreateDateTime(element.begin, 1)],
                      textfont: {
                        size: 16,
                        color: '#000000'
                      },
                      marker: {
                        opacity: 0.5,
                        color: "#0065ff",
                        line: {width: 1}
                      }
                    })
                  }
                });
                console.log(dataPlotly)
                Plotly.newPlot("plotlymapContain1", dataPlotly, {title: 'Окна видимости', showlegend: false,height:150+(dataPlotly.length*70), margin:{l:150,t:40,b:40,r:10}})
                break
              
              case 5:
                this.PageSettings.status = 2
                document.getElementById("plotlymapContain1").innerHTML=''
                break;
            
              default:
                break;
            }
            DisplayLoad(false)
        },
        async ReFetch(){
          if(this.PageSettings.mode) this.clusterTopology = await FetchGet("/api/v1/topology/all") || []
          if(this.PageSettings.mode) this.networkClaster = await FetchGet("/api/v1/network/all") || []
          this.PageSettings.SatSat = []
          let response = []
          if(this.PageSettings.mode) response = await FetchGet('/api/v1/cluster/all',false) || []
          else response = await FetchGet('/api/v1/modelling/data/sat-sat/all',false) || []
            if(response.length < 1){
              return
            }
            response = response.sort((a, b) => parseFloat(a.begin) - parseFloat(b.begin))
            for (let index = 0; index < response.length; index++) {
              response[index].beginUnix = this.CreateDateTime(response[index].begin)
              response[index].endUnix = this.CreateDateTime(response[index].end)
            }
          this.PageSettings.SatSat = response
        }
    },
    async mounted() {
      DisplayLoad(true)

      this.ReFetch()
      let rezult = await FetchGet("/api/v1/constellation/cl/all") || []
      this.PageSettings.SatNp = await FetchGet('/api/v1/modelling/data/earth-sat/all', false) || []
      
      this.lessConstellation = []
      rezult.forEach(element => {
        this.lessConstellation.push({lable: element.constellationName, value: element})
      })
      DisplayLoad(false)
    }
  }
  </script>

<style lang="scss" scoped>






#PlotlyDiv{
  width: 100vw;
    height: 100vh;
    position: fixed;
    left: 0px;
    top: 0px;
    background-color: #000000d4;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;

  .ContainerDiv{
    min-width: 90vw;
    margin-top: 100px;
    flex: 1;
    margin-bottom: 20px;
    background-color: #111111c7;
    border: 2px solid #4c4b4b;
    backdrop-filter: blur(10px);
    border-radius: 15px;

    .closebutton{
      display: flex;
      margin: 20px;
      flex-direction: row-reverse;
      button{
        background: none;
        border: none;
        img{
          width: 25px;
        }
      }
    }
  }
  
}
</style>
