<template>
    <div class="DataTable">
        <div class="closebutton"><button @click="CloseTable">
            <img src="../../../assets/close.svg"><span>&#8203;</span>
          </button>
          <button @click="LoadXLSX" class="LoadExel">
            <img src="../../../assets/excel.png"><span>&#8203;</span>
          </button>
        </div>
        
        <div class="DataBody">
          
        <div class="TableDiv">
          <table class="TableDefault">
          <thead>
            <tr><th>Тип события</th><th>№ Интервала</th><th>Интервал</th><th>Тип узла</th><th>Узел</th><th>Узел получатель</th><th>Обьём</th><th>Время</th><th>Поток</th><th>Технология</th></tr>
          </thead>
          <tbody>
            <tr v-for="data, index in dataPrevrap" :key="index">
                <td>{{ data.typeEl }}</td><td>{{ data.interval }}</td>
                <td>{{ data.intervalTime.timeUnixstart.time+' - '+data.intervalTime.timeUnixend.time}}</td>
                <td>{{ data.objectName.type }}</td>
                <td>{{ data.objectName.name}}</td>
                <td>{{ data.to_objectName.name}}</td>
                <td>{{ data.volume }}</td><td>{{ (data.time != undefined ? this.TimeFormat(data.time) : '')}}</td>
                <td>{{ data.flow }}</td><td>{{ data.tech }}</td>
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
            let data = [["Тип события","Интервал","Тип узла","Узел","Узел получатель","Обьём","Время","Поток","Технология"]]
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
            console.log(time)
            let data = UnixToDtime(time,true)
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
                          opacity: 0.3,color: "green",line: {width: 1}
                        }
                      },
                      {
                        type: 'bar',name: "Обработка",y: [],x: [],
                        orientation: 'h',base: [],text:[],
                        marker: {
                          opacity: 0.6,color: "orange",line: {width: 1}
                        }
                      },
                      {
                        type: 'bar',name: "Передача",y: [],x: [],
                        orientation: 'h',base: [],text:[],
                        marker: {
                          opacity: 0.6,color: "purple",line: {width: 1}
                        }
                      },
                      {
                        type: 'bar',name: "Потери",y: [],x: [],
                        orientation: 'h',base: [],text:[],
                        marker: {
                          opacity: 0.6,color: "rad",line: {width: 1}
                        }
                      },
                    ]
                this.dataPrevrap.forEach(event => {
                  console.log(event)
                    for (let i = 0; i < dataPlotly.length; i++) {
                      const plot = dataPlotly[i];
                      if(plot.name == event.typeEl){
                        if(event.time != undefined){plot.x.push(CreateDateTime(event.time, 2))}
                        else{plot.x.push(CreateDateTime(event.intervalTime.text, 2))}
                        plot.base.push(CreateDateTime(event.intervalTime.timeStart, 1))
                        plot.y.push(event.objectName.name)
                        plot.text.push(event.volume)
                      }
                    }
                })
                let annotations = []
                Plotly.newPlot("plotlydiv", dataPlotly, {annotations:annotations, showlegend: true,height:150+(dataPlotly.length*40), margin:{l:100,t:40,b:40,r:40}})
          },
      },
      mounted() {
        this.dataPrevrap = this.dataTable
        this.CreatePlot()
      }
    }
  </script>
  
  
  <style lang="scss" scoped>

  </style>