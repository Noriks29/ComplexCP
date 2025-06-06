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
          <div><button @click="CommandWork(5)" class="ButtonCommand">Расчёт плана контактов</button></div>
        </div>
      </div>

      <div class="Panel RightPanel">
          <div v-if="PageSettings.status == 1" class="TableDiv" style="max-height: 60vh;">
            <table class="TableDefault">
              <thead><tr><th>НП</th><th>КА</th><th>Начало</th><th>Конец</th></tr></thead>
              <tbody><tr v-for="data, index in PageSettings.SatNp" :key="index">
                <td>{{ data.earthName }}</td><td>{{ data.satelliteName }}</td><td>{{ data.begin }}</td><td>{{ data.end }}</td>
              </tr>
            </tbody></table>
          </div>
          <div id="plotlymapContain1" style="height: fit-content;"></div>
      </div>

    </div>
    </div>
  </template>
  
  <script>

import { PagesSettings } from './PagesSettings';
import Plotly from 'plotly.js-dist'

  export default {
    name: 'TargetDZZ',
    mixins: [PagesSettings],
    data(){
      return{
        PageSettings:{
          mode: false, //лидер / все
          status: 1, //код открытого окна
          SatNp: [], //список контактов сат-нп
        },
        ShowPlotlyContain: false,
      }
    },
    methods: {
       async CommandWork(commandId){
            if(commandId == 5){
              this.$showLoad(true);
              document.getElementById("plotlymapContain1").innerHTML=''
              await this.$FetchGet("/api/v1/contact-plan/earth")
              this.ReFetch()
              this.$showLoad(false);
            }
            if(commandId == 1){
              this.$showLoad(true);
              document.getElementById("plotlymapContain1").innerHTML=''
              await this.$FetchPost('/api/v1/pro42/view/earth', {leaderProcessing: this.PageSettings.mode})
              this.ReFetch()
              this.$showLoad(false);
            }
            if(commandId == 6){
              document.getElementById("plotlymapContain1").innerHTML=''
              let response = await this.$FetchGet('/api/v1/modelling/data/earth-sat/all') || []
              let dataPlotly = []
              /*
              let dataGrapf = {
                type: 'bar',
                y: [],
                x: [],
                orientation: 'h',
                base: [],
                text: [],
                marker: {
                  opacity: 0.7,
                  line: {
                    width: 2
                  }
                }
              }*/
              response.forEach(element => {
                /*
                console.log(this.CreateDateTime(element.end - element.begin, 2))
                dataGrapf.y.push(element.earthName)
                dataGrapf.text.push(element.satelliteName)
                dataGrapf.x.push(this.CreateDateTime(element.end - element.begin, 2))
                dataGrapf.base.push(this.CreateDateTime(element.begin, 1))*/


                let flagadd = false
                  dataPlotly.forEach(plot => {
                    if(plot.name == element.earthName){
                      plot.y.push(element.earthName)
                      plot.text.push(element.satelliteName)
                      plot.x.push(this.CreateDateTime(element.end - element.begin, 2))
                      plot.base.push(this.CreateDateTime(element.begin, 1))
                      flagadd = true
                    }
                  })
                  if(!flagadd){
                    dataPlotly.push({
                      type: 'bar',
                      name: element.earthName,
                      y: [element.earthName],
                      x: [this.CreateDateTime(element.end - element.begin, 2)],
                      text: [element.satelliteName],
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
              Plotly.newPlot("plotlymapContain1", dataPlotly,
                {
                  title: 'Окна видимости',
                  barmode: 'stack', 
                  showlegend: false,
                  height:80+(dataPlotly.length*80),
                  margin:{l:150,t:40,b:40,r:10}
                }
              )
            }
        },
        async ReFetch(){
          this.PageSettings.SatNp = await this.$FetchGet('/api/v1/modelling/data/earth-sat/all', false) || []
          if(this.PageSettings.SatNp.length < 1){
            this.$showToast('Окна видимости не найдены','info', 'КА - НП');
          }
          this.PageSettings.SatNp = this.PageSettings.SatNp.sort((a, b) => parseFloat(a.begin) - parseFloat(b.begin))
              for (let index = 0; index < this.PageSettings.SatNp.length; index++) {
                const element = this.PageSettings.SatNp[index]
                element.begin = this.CreateDateTime(element.begin)
                element.end = this.CreateDateTime(element.end)
              }
          this.CommandWork(6)
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
