<template>
    <div class="DataTable">
        <div class="closebutton"><button @click="CloseTable">
            <img src="../../../assets/close.svg"><span>&#8203;</span>
          </button>
          <button @click="LoadXLSX" class="LoadExel">
            <img src="../../../assets/excel.png"><span>&#8203;</span>
          </button>
        </div>
        
        <div class="DataBody" style="max-height: none;">
          
        <div class="TableDiv" style="max-height: 50vh;">
          <table class="TableDefault">
          <thead>
            <tr><th>Тип события</th><th>№ Интервала</th><th>Интервал</th><th>Тип узла</th><th>Узел</th><th>Узел получатель</th><th>Обьём</th><th>Длительность</th><th>Поток</th><th>Технология</th><th>Эноргозатраты</th></tr>
          </thead>
          <tbody>
            <tr v-for="data, index in dataPrevrap" :key="index">
                <td>{{ data.typeEl }}</td><td>{{ data.interval }}</td>
                <td>{{ data.intervalTime.timeUnixstart.time+' - '+data.intervalTime.timeUnixend.time}}</td>
                <td>{{ data.objectName != undefined ? data.objectName.type : "Error" }}</td>
                <td>{{ data.objectName != undefined ? data.objectName.name : "Error" }}</td>
                <td>{{ data.to_objectName.name}}</td>
                <td>{{ data.volume }}</td><td>{{ (data.time != undefined ? this.TimeFormat(data.time) : '')}}</td>
                <td>{{ data.flow }}</td><td>{{ data.tech }}</td><td>{{ data.Consumption }}</td>
            </tr>
          </tbody>
          </table>
        </div>
        <div class="GrafDiv">
          <div id="plotlydiv">
            <!--Карта-->
          </div>
        </div>
        
      </div>
      </div>
</template>
  
  <script>
import Plotly from 'plotly.js-dist'
import { CreateDateTime, UnixToDtime } from '@/js/WorkWithDTime'
import XLSX from 'xlsx-js-style';

    export default {
      name: 'TableData',
      props: {
        dataTable:{
          type: Array
        },
      },
      data() {
        return {
            dataPrevrap: [],
        }
      },
      methods:
        {
          CloseTable(){
            this.$emit('closetable', true)
          },
          LoadXLSX(){
            const workbook = XLSX.utils.book_new();
            let data = [["Тип события","Интервал","Тип узла","Узел","Узел получатель","Обьём","Длительность","Поток","Технология"]]
            this.dataPrevrap.forEach(element => {
                let row = [element.typeEl,element.intervalTime.timeUnixstart.time+' - '+element.intervalTime.timeUnixend.time,element.objectName.type,
                   element.objectName.name,element.to_objectName.name,element.volume,(element.time != undefined ? this.TimeFormat(element.time) : ''),element.flow,element.tech
                ]
                data.push(row)
            });
            let worksheet = XLSX.utils.aoa_to_sheet(data); // Создаем таблицу в файле с данными из массива
            workbook.SheetNames.push('PlanPavlov'); // Добавляем лист с названием First list
            let style = {
                font: {
                name: 'Calibri',
                sz: 12,
                bold: true,
                    color: {rgb: '000000'} // red font
                },
                border: {
                bottom: { style: 'thin', color: { rgb: '000000' } }
                }}
            let keylist = Object.keys(worksheet)
            for (let keyid = 0; keyid < keylist.length; keyid++) {
                const key = keylist[keyid];
                console.log(worksheet[key].v, keylist, data[0])
                try {
                if (data[0].indexOf(worksheet[key].v) != -1) {
                    worksheet[key].s = style
                }
                } catch (error) {
                console.log(error)
                }
            }
            workbook.Sheets['PlanPavlov'] = worksheet;
            XLSX.writeFile(workbook, 'PlanPavlov.xlsx');
          },
          TimeFormat(time){
            
            let data = UnixToDtime(time,true)
            console.log(time, "Время", data)
            return data.time
          },
          CreatePlot(){
                document.getElementById("plotlydiv").innerHTML=''
                if(this.dataPrevrap.length < 1 ) return
                let dataPlotly = [
                      {
                        type: 'bar',name: "Хранение",y: [],x: [],
                        orientation: 'h',base: [],text:[],
                        marker: {
                          opacity: 0.1,color: "green",line: {width: 1}
                        }
                      },
                      {
                        type: 'bar',name: "Потери",y: [],x: [],
                        orientation: 'h',base: [],text:[],
                        marker: {
                          opacity: 0.5,color: "red",line: {width: 1}
                        }
                      },
                      {
                        type: 'bar',name: "Съёмка",y: [],x: [],
                        orientation: 'h',base: [],text:[],
                        marker: {
                          opacity: 0.9,color: "#086375",line: {width: 1}
                        }
                      },
                      {
                        type: 'bar',name: "Обработка",y: [],x: [],
                        orientation: 'h',base: [],text:[],
                        marker: {
                          opacity: 0.9,color: "orange",line: {width: 1}
                        }
                      },
                      {
                        type: 'bar',name: "Передача",y: [],x: [],
                        orientation: 'h',base: [],text:[],
                        marker: {
                          opacity: 0.8,color: "purple",line: {width: 1}
                        }
                      }
                    ]
                let interval = 0;
                let objectName = '';
                let timeLast = 0;
                let dataToPlot = this.dataPrevrap.slice(0)
                dataToPlot.sort((a,b) => {
                  if(a.interval == b.interval){
                    if(a.object == b.object) return 0
                    if(a.object < b.object) return -1
                    if(a.object > b.object) return 1
                  }
                  return a.interval - b.interval
                })
                dataToPlot.forEach(event => {
                  if(event.interval != interval || event.object!= objectName){
                    timeLast = event.intervalTime.timeStart; objectName = event.object; interval = event.interval
                  }
                  try {
                    for (let i = 0; i < dataPlotly.length; i++) {
                      const plot = dataPlotly[i];
                      if(plot.name == event.typeEl){
                        if(event.time != undefined){
                          plot.x.push(CreateDateTime(event.time, 2))
                          timeLast += event.time
                        }
                        else{plot.x.push(CreateDateTime((event.intervalTime.text - (timeLast - event.intervalTime.timeStart)) || 1, 2))}
                        
                        plot.base.push(CreateDateTime(timeLast, 1))
                        plot.y.push(event.objectName.name)
                        plot.text.push(event.volume)
                      }
                    }
                    } catch (error) {
                      this.$showToast('Некорректная отрисовка графика, прерываю...','error', 'Ошибка графика');
                    }
                })
                let annotations = []
                Plotly.newPlot("plotlydiv", dataPlotly, {annotations:annotations,barmode: 'stack', showlegend: true,height:150+(500), margin:{l:100,t:40,b:40,r:40}})
          },
      },
      mounted() {
        this.dataPrevrap = this.dataTable
        console.log(this.dataTable, "dewfe")
        this.CreatePlot()
      }
    }
  </script>
  
  
  <style lang="scss" scoped>
table{
      td{
        text-align: center !important;
      }
    }
  </style>