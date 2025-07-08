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
            <tr><th colspan="2">Показатели качества</th><th colspan="2">Значимость показателей</th></tr>
            <tr><th>Доставленные данные</th><th>Потерянные данные</th><th>Доставленные данные</th><th>Потерянные данные</th><th>Затраты энергии</th></tr>
          </thead>
          <tbody>
            <tr>
                <td>{{ summary.criterion.selector[0].value }}</td>
                <td>{{ summary.criterion.selector[1].value }}</td>
                <td>{{ summary.selectors.selector[1].sign }}</td>
                <td>{{ summary.selectors.selector[0].sign }}</td>
            </tr>
          </tbody>
          </table>
        </div>
        <div class="TableDiv">
          <table class="TableDefault">
          <thead>
            <tr><th>Узел</th><th>Тип узла</th><th>Обьём обработки</th><th>Время обработки</th><th>Объём передачи</th><th>Время передачи</th><th>Объём передачи в НП</th><th>Время передачи в НП</th><th>Потери</th></tr>
          </thead>
          <tbody>
            <tr v-for="data, index in dataPrevrap" :key="index">
                <td>{{ data.object.name}}</td>
                <td>{{ data.object.type }}</td>
                <td>{{ data.process.sumVolume }}</td><td>{{ TimeFormat(data.process.sumTime) }}</td>
                <td>{{ data.transport.sumVolume }}</td><td>{{ TimeFormat(data.transport.sumTime) }}</td>
                <td>{{ data.transportNP.sumVolume }}</td><td>{{ TimeFormat(data.transportNP.sumTime) }}</td>
                <td>{{ data.lost.sumVolume}}</td><td>{{ data.Consumption}}</td>
            </tr>
          </tbody>
          <tfoot><tr><td colspan="2">Сумма</td><td v-for="data,index in dataSum" :key="index">{{ data }}</td></tr></tfoot>
          </table>
        </div>
        <div class="GrafDiv">
        <div id="plotlydivAll">
            <!--Карта-->
          </div>
          <div id="plotlydiv">
            <!--Карта-->
          </div>
        </div>
        
      </div>
      </div>
</template>
  
  <script>
import Plotly from 'plotly.js-dist'
import XLSX from 'xlsx-js-style';
import { UnixToDtime } from '@/js/WorkWithDTime';


    export default {
      name: 'TableData',
      props: {
        dataTable:{
          type: Array
        },
        summary:{
          typr: Object
        }
      },
      data() {
        return {
            dataPrevrap: [],
            dataSum: {OsumVolume:0,OsumTime:0,TsumVolume:0,TsumTime:0,TNpsumVolume:0,TNpsumTime:0,lost:0,Consumption:0},
        }
      },
      methods:
        {
          CloseTable(){
            this.$emit('closetable', true)
          },
          CreatePlot(){
                document.getElementById("plotlydiv").innerHTML=''
                document.getElementById("plotlydivAll").innerHTML=''
                if(this.dataPrevrap.length < 1 ) return
            try {
              
            
            let dataPlotly = [
                      {
                        type: 'bar',name: "Обработка",y: [],x: [],text:[],
                        marker: {
                          opacity: 0.6,color: "orange",line: {width: 1}
                        }
                      },
                      {
                        type: 'bar',name: "Передача",y: [],x: [],text:[],
                        marker: {
                          opacity: 0.6,color: "purple",line: {width: 1}
                        }
                      },
                      {
                        type: 'bar',name: "Передача в НП",y: [],x: [],text:[],
                        marker: {
                          opacity: 0.6,color: "#9966CC",line: {width: 1}
                        }
                      },
                      {
                        type: 'bar',name: "Потери",y: [],x: [],text:[],
                        marker: {
                          opacity: 0.6,color: "rad",line: {width: 1}
                        }
                      },
                    ]
            
        
            let allLabels = [];
            let allValues = [
            [],[],[],[],[],[],[]
            ];
            this.dataPrevrap.forEach(node => {
                allLabels.push(node.object.name)
                allValues[0].push(node.process.sumVolume)
                allValues[1].push(node.process.sumTime)
                allValues[2].push(node.transport.sumVolume)
                allValues[3].push(node.transport.sumTime)
                allValues[4].push(node.transportNP.sumVolume)
                allValues[5].push(node.transportNP.sumTime)
                allValues[6].push(node.lost.sumVolume)

                dataPlotly[0].y.push(node.process.sumVolume)
                dataPlotly[0].x.push(node.object.name)
                dataPlotly[1].y.push(node.transport.sumVolume)
                dataPlotly[1].x.push(node.object.name)
                dataPlotly[2].y.push(node.transportNP.sumVolume)
                dataPlotly[2].x.push(node.object.name)
                dataPlotly[3].y.push(node.lost.sumVolume)
                dataPlotly[3].x.push(node.object.name)
            })
            Plotly.newPlot('plotlydivAll', dataPlotly, {barmode: 'stack'});

            var ultimateColors = [
            'rgb(56, 75, 126)', 'rgb(18, 36, 37)', 'rgb(34, 53, 101)', 'rgb(36, 55, 57)', 'rgb(6, 4, 4)',
            'rgb(177, 127, 38)', 'rgb(205, 152, 36)', 'rgb(99, 79, 37)', 'rgb(129, 180, 179)', 'rgb(124, 103, 37)',
            'rgb(33, 75, 99)', 'rgb(79, 129, 102)', 'rgb(151, 179, 100)', 'rgb(175, 49, 35)', 'rgb(36, 73, 147)',
            'rgb(146, 123, 21)', 'rgb(177, 180, 34)', 'rgb(206, 206, 40)', 'rgb(175, 51, 21)', 'rgb(35, 36, 21)'
            ];

            var data = [{
                values: allValues[0],
                labels: allLabels,
                type: 'pie',
                name: 'Обработка',
                marker: {colors: ultimateColors},
                domain: {row: 0,column: 0},
                hoverinfo: 'label+percent+name',
                hole: .4,
            },{
                values: allValues[1],
                labels: allLabels,
                type: 'pie',
                name: 'Обработка',
                marker: {colors: ultimateColors},
                domain: {row: 0,column: 1},
                hoverinfo: 'label+percent+name',
                hole: .4,
            },{
                values: allValues[2],
                labels: allLabels,
                type: 'pie',
                name: 'Обработка',
                marker: {colors: ultimateColors},
                domain: {row: 1,column: 0},
                hoverinfo: 'label+percent+name',
                hole: .4,
            },{
                values: allValues[3],
                labels: allLabels,
                type: 'pie',
                name: 'Обработка',
                marker: {colors: ultimateColors},
                domain: {row: 1,column: 1},
                hoverinfo: 'label+percent+name',
                hole: .4,
            },{
                values: allValues[4],
                labels: allLabels,
                type: 'pie',
                name: 'Обработка',
                marker: {colors: ultimateColors},
                domain: {row: 2,column: 0},
                hoverinfo: 'label+percent+name',
                hole: .4,
            },{
                values: allValues[5],
                labels: allLabels,
                type: 'pie',
                name: 'Обработка',
                marker: {colors: ultimateColors},
                domain: {row: 2,column: 1},
                hoverinfo: 'label+percent+name',
                hole: .4,
            },{
                values: allValues[6],
                labels: allLabels,
                type: 'pie',
                name: 'Обработка',
                marker: {colors: ultimateColors},
                domain: {row: 3,column: 0},
                hoverinfo: 'label+percent+name',
                hole: .4,
            }];

            var layout = {
                annotations: [
                    {font: {size: 20},showarrow: false,text: 'Обьём обработки',x: 0.3,y: 1},
                    {font: {size: 20},showarrow: false,text: 'Время обработки',x: 0.7,y: 1},
                    {font: {size: 20},showarrow: false,text: 'Обьём передачи',x: 0.3,y: 0.73},
                    {font: {size: 20},showarrow: false,text: 'Время передачи',x: 0.7,y: 0.73},
                    {font: {size: 20},showarrow: false,text: 'Обьём передачи в НП',x: 0.3,y: 0.46},
                    {font: {size: 20},showarrow: false,text: 'Время передачи в НП',x: 0.7,y: 0.46},
                    {font: {size: 20},showarrow: false,text: 'Потери',x: 0.3,y: 0.17},
                ],
                height: 800,
                grid: {rows: 4, columns: 2}
                };

            Plotly.newPlot('plotlydiv', data, layout); 
            } catch (error) {
              console.error(error)
              this.dataPrevrap= []
              this.$showToast('Некорректная отрисовка графика, прерываю...','error', 'Ошибка графика');
            }
          },
          TimeFormat(time){
            let data = UnixToDtime(time,true)
            return data.time
          },
          LoadXLSX(){
            const workbook = XLSX.utils.book_new();
            let data = [["Узел","Тип узла","Обьём обработки","Время обработки","Объём передачи","Время передачи","Объём передачи в НП","Время передачи в НП","Потери"]]
            this.dataPrevrap.forEach(element => {
                let row = [element.object.name, element.object.type,element.process.sumVolume,this.TimeFormat(element.process.sumTime),
                element.transport.sumVolume,this.TimeFormat(element.transport.sumTime),element.transportNP.sumVolume,this.TimeFormat(element.transportNP.sumTime),element.lost.sumVolume]
                data.push(row)
            });
            data.push(["Сумма",'',this.dataSum.OsumVolume,this.dataSum.OsumTime,this.dataSum.TsumVolume,this.dataSum.TsumTime,this.dataSum.TNpsumVolume,this.dataSum.TNpsumTime,this.dataSum.lost])
            let worksheet = XLSX.utils.aoa_to_sheet(data); // Создаем таблицу в файле с данными из массива
            workbook.SheetNames.push('NodeLoad'); // Добавляем лист с названием First list
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
            workbook.Sheets['NodeLoad'] = worksheet;
            XLSX.writeFile(workbook, 'NodeLoad.xlsx');
          },
          DataPrevrap(){
            this.dataTable.forEach(event => {
                let id = null
                for (let index = 0; index < this.dataPrevrap.length; index++) {
                    const Node = this.dataPrevrap[index];
                    if(event.object == Node.object.id){
                        id = index
                        break;
                    }
                }
                if(id == null){
                    this.dataPrevrap.push({
                        object: event.objectName,
                        process: {sumVolume: 0, sumTime: 0, data: []},
                        transport: {sumVolume: 0, sumTime: 0, data: []},
                        transportNP: {sumVolume: 0, sumTime: 0, data: []},
                        lost: {sumVolume: 0, data: []},
                        Consumption: 0
                    })
                    id = this.dataPrevrap.length-1
                }
                switch (event.typeEl) {
                    case 'Передача':
                        if(event.to_objectName.type == "НП"){
                            this.dataPrevrap[id].transportNP.sumVolume += event.volume
                            this.dataPrevrap[id].transportNP.sumTime += event.time
                        }
                        else{
                            this.dataPrevrap[id].transport.sumVolume += event.volume
                            this.dataPrevrap[id].transport.sumTime += event.time
                        }
                        this.dataPrevrap[id].Consumption += event.Consumption
                        break;
                    case 'Обработка':
                        this.dataPrevrap[id].process.sumVolume += event.volume
                        this.dataPrevrap[id].process.sumTime += event.time
                        this.dataPrevrap[id].Consumption += event.Consumption
                        break;
                    case 'Потери':
                        this.dataPrevrap[id].lost.sumVolume += event.volume
                        break;
                
                    default:
                        break;
                }
            })
            this.CreatePlot()
            this.dataPrevrap.forEach(event => {
                this.dataSum.OsumTime+=event.process.sumTime
                this.dataSum.OsumVolume+=event.process.sumVolume
                this.dataSum.TsumTime+=event.transport.sumTime
                this.dataSum.TsumVolume+=event.transport.sumVolume
                this.dataSum.TNpsumTime+=event.transportNP.sumTime
                this.dataSum.TNpsumVolume+=event.transportNP.sumVolume
                this.dataSum.lost+=event.lost.sumVolume
                this.dataSum.Consumption+=event.Consumption
            })
            this.dataSum.TNpsumTime = this.TimeFormat(this.dataSum.TNpsumTime)
            this.dataSum.TsumTime = this.TimeFormat(this.dataSum.TsumTime)
            this.dataSum.OsumTime = this.TimeFormat(this.dataSum.OsumTime)
          }
      },
      mounted() {
        this.DataPrevrap()
        console.log(this.summary)
      }
    }
  </script>
  
  
  <style lang="scss" scoped>
    .DataTable .DataBody {
        max-height: none;
    }
    table{
      td{
        text-align: center !important;
      }
    }
  </style>