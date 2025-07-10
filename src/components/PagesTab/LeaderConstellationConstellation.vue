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
              <div><button @click="CommandWork(1)" class="ButtonCommand">Рассчитать окна видимости</button></div>
              <div><button @click="CommandWork(2)" class="ButtonCommand">Расчёт плана контактов</button></div>
            </div>
        </div>
        <div class="Panel RightPanel">
          <div v-if="PageSettings.status == 1" class="TableDiv" style="max-height: 60vh">
            <table class="TableDefault">
            <thead><tr><th>КА</th><th>Видимый КА</th><th>Начало</th><th>Конец</th></tr></thead>
              <tbody><tr v-for="data, index in PageSettings.SatSat" :key="index">
                <td>{{ data.satellite1 }}</td><td>{{ data.satellite2 }}</td><td>{{ data.beginUnix }}</td><td>{{ data.endUnix }}</td>
              </tr>
            </tbody></table>
          </div>
          <div id="plotlymapContain1" style="height: fit-content;"></div>
          </div>
        </div>
    </div>

    
  </template>
  
  <script>

import { PagesSettings } from './PagesSettings.js';
import Plotly from 'plotly.js-dist'
import { CreateDateTime } from '@/js/WorkWithDTime.js';

  export default {
    name: 'LeaderConstellationConstellation',
    mixins: [PagesSettings],
    data(){
      return{
        PageSettings:{
          mode: false, //лидер / все
          status: 1, //код открытого окна
          SatNp: [], //список контактов сат-нп
          SatSat: [], //список контактов сат-сат
        },
        experimentObject: {angle: 0}, //обьект отправки пост
      }
    },
    methods: {
       async CommandWork(commandId){
            this.$showLoad(true);
            let dataPlotly = null
            switch (commandId) {
              case 1:
                document.getElementById("plotlymapContain1").innerHTML=''
                await this.$FetchGet('/api/v1/pro42/view/sat', null)
                await this.ReFetch()
                break;
              case 2:
                document.getElementById("plotlymapContain1").innerHTML=''
                await this.$FetchGet('/api/v1/contact-plan/sat')
                await this.ReFetch()
                break;   
              case 4:
                document.getElementById("plotlymapContain1").innerHTML=''
                if(this.PageSettings.SatSat.length < 1 ) return
                this.ShowPlotlyContain = true
                dataPlotly = []
                this.PageSettings.SatSat.forEach(element => {
                  let flagadd = false
                  dataPlotly.forEach(plot => {
                    if(plot.name == element.satellite2){
                      plot.y.push(element.satellite1+"-"+element.satellite2)
                      plot.x.push(CreateDateTime(element.end - element.begin, 2))
                      plot.base.push(CreateDateTime(element.begin, 1))
                      flagadd = true
                    }
                  })
                  if(!flagadd){
                    dataPlotly.push({
                      type: 'bar',
                      name: element.satellite2,
                      y: [element.satellite1+"-"+element.satellite2],
                      x: [CreateDateTime(element.end - element.begin, 2)],
                      orientation: 'h',
                      base: [CreateDateTime(element.begin, 1)],
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
                Plotly.newPlot("plotlymapContain1", dataPlotly, {title: 'Окна видимости', barmode: 'stack', showlegend: false,height:80+(dataPlotly.length*70), margin:{l:150,t:40,b:40,r:10}})
                break

              default:
                break;
            }
            this.$showLoad(false);
        },
        async ReFetch(){
          this.PageSettings.SatSat = []
          let response = await this.$FetchGet('/api/v1/modelling/data/sat-sat/all',false) || []
            if(response.length < 1){
              return
            }
            response = response.sort((a, b) => parseFloat(a.begin) - parseFloat(b.begin))
            for (let index = 0; index < response.length; index++) {
              response[index].beginUnix = CreateDateTime(response[index].begin)
              response[index].endUnix = CreateDateTime(response[index].end)
            }
          this.PageSettings.SatSat = response
          this.CommandWork(4)
        }
    },
    async mounted() {
      this.ReFetch()
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
