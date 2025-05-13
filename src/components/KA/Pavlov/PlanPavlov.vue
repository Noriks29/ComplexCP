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
            <tr><th>Тип события</th><th>interval</th><th>Интервал</th><th>Тип узла</th><th>Узел</th><th>Узел получатель</th><th>text</th><th>to_text</th><th>Поток</th><th>Технология</th></tr>
          </thead>
          <tbody>
            <tr v-for="data, index in dataPrevrap" :key="index">
                <td>{{ data.typeEl }}</td><td>{{ data.interval }}</td>
                <td>{{ dataTable.time[data.interval].timeUnixstart.time+' - '+dataTable.time[data.interval].timeUnixend.time}}</td>
                <td>{{ (data.object != undefined) ? objectList[data.object].type : ''}}</td>
                <td>{{ (data.object != undefined) ? objectList[data.object].name : ''}}</td>
                <td>{{ (data.to_object != undefined) ? objectList[data.to_object].name : ''}}</td>
                <td>{{ data.text }}</td><td>{{ data.to_text }}</td>
                <td>{{ data.flow }}</td><td>{{ data.tech }}</td>
            </tr>
          </tbody>
          </table>
        </div>
        
      </div>
      </div>
</template>
  
  <script>

import { NPList } from '@/js/GlobalData'
import { OGList } from '@/js/GlobalData'

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
            objectList: {},
        }
      },
      methods:
        {
          CloseTable(){
            this.$emit('closetable', true)
          },
          PrevrapData(){
            console.log(this.dataTable, NPList,OGList)
            NPList.forEach(GS => {
                this.objectList[GS.id] = {id: GS.id, name: GS.nameEarthPoint, type: 'GS'}
            })
            OGList.forEach(OG => {
                OG.satellites.forEach(SAT => {
                    this.objectList[SAT.tleId] = {id: SAT.tleId, name: SAT.name, type: 'SAT'}
                })
            })
            
            console.log(this.objectList)
            let process = this.dataTable.process
            let toprocess = this.dataTable.to_process
            process.forEach(el => {
                el.typeEl = "Обработка";
                for (let i = 0; i < toprocess.length; i++) {
                    const element = toprocess[i];
                    if(el.interval == element.interval && element.object == el.object){
                        el.to_text = element.text
                        break
                    }
                }
                this.dataPrevrap.push(el)
            })
            try {
                let lost = this.dataTable.lost
                lost.forEach(el => {
                    el.typeEl='Потери'; this.dataPrevrap.push(el);
                })
            } catch (error) {
                console.log("Потерь нет")//Переделать это под не возможность потерь и отображение
            }
            this.dataTable.storage.forEach(el => {
               el.typeEl='Хранение';this.dataPrevrap.push(el);
            })
            let transport = this.dataTable.transport
            let to_transport = this.dataTable.to_transport
            transport.forEach(el => {
               el.typeEl='Передача'; 
               for (let i = 0; i < to_transport.length; i++) {
                    const element = to_transport[i];
                    if(el.interval == element.interval && element.object == el.object){
                        el.to_text = element.text
                        break
                    }
                }
               
               this.dataPrevrap.push(el);
            })




            this.dataPrevrap.sort((a,b) => {return a.interval - b.interval})
          },
      },
      mounted() {
        this.PrevrapData()
      }
    }
  </script>
  
  
  <style lang="scss" scoped>

  </style>