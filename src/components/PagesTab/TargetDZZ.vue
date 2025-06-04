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
              <div v-if="!(systemStatus.typeWorkplace in {3:null})"><button @click="viewmode=0" class="ButtonCommand">Заявки ДЗЗ</button></div>
              <div v-if="!(systemStatus.typeWorkplace in {3:null})"><button @click="viewmode=1" class="ButtonCommand">Каталог целей</button></div>
              <div v-if="!(systemStatus.typeWorkplace in {3:null})"><button @click="viewmode=2" class="ButtonCommand">Данные по заявкам</button></div>
              <div v-if="!(systemStatus.typeWorkplace in {1:null,2:null})"><button @click="GetRequestFromDB(1)" class="ButtonCommand">Мультиагенты</button></div>
              <div v-if="!(systemStatus.typeWorkplace in {1:null,2:null})"><button @click="GetRequestFromDB(2)" class="ButtonCommand">Оптимизация</button></div>
            </div>
        </div>
        <div class="Panel RightPanel" >
          <div v-if="viewmode == 0" class="TableDiv" style="max-height: 60vh; min-height: 60vh;">
            <table class="TableDefault">
              <thead><tr><th>Цель</th><th>Широта</th><th>Долгота</th><th>Высота</th><th>НП</th><th>Критерий</th><th>Приоритет</th><th>Время появления</th><th>Срок выполнения</th><th v-if="systemStatus.typeWorkplace in {3:null,4:null}">Признак</th><th></th></tr></thead>
              <tbody><tr
              v-for="data, index in requestJson"
                :key="index"
              >
              <td><SelectDiv  :dataOption="arr" :valueS="{value:data.catalog, lable:data.catalog.goalName}" :id="String(index)" @valueSelect="SelectChange($event, 'catalog')"/></td>
              <td>{{ data.catalog.lat }}</td>
              <td>{{ data.catalog.lon }}</td><td>{{ data.catalog.alt }}</td>
              <td><SelectDiv  :dataOption="arrNP" :valueS="{value:data.earthPoint, lable:data.earthPoint.nameEarthPoint}" :id="String(index)" @valueSelect="SelectChange($event, 'earthPoint')"/></td>
              <td><SelectDiv  :dataOption="choiceCriteriaArr" :valueS="choiceCriteriaArr[data.choiceCriteria-1]" :id="String(index)" @valueSelect="SelectChange($event, 'choiceCriteria')"/></td>
              <td><input type="number" v-model="data.priory" @change="ChangeParamRequest"></td>
              <td><DateTime :valueUnix="data.time" :id="String(index)" :name="'time'" @valueSelect="ChangeTime"/></td>
              <td><DateTime :valueUnix="data.term" :id="String(index)" :name="'term'"  @valueSelect="ChangeTime"/></td>
              <td v-if="systemStatus.typeWorkplace in {3:null}"><SelectDiv  :dataOption="TypeRequest" :valueS="TypeRequest[data.type]" :id="String(index)" @valueSelect="SelectChange($event, 'type')"/></td>
              <td :id="index" @click="DeleteRowRequest(index)" class="delete"><img class="iconDelete" src="../../assets/delete.svg" alt="-"></td>
              </tr>
              <tr class="addRowButton">
                <td colspan="9"><button @click="AddRowRequest(catalogJson[0])"><img src="../../assets/add.png" alt="" class="addButtonIcon">Добавить заявку</button></td>
                <td v-if="systemStatus.typeWorkplace in {3:null,4:null}"></td>
                <td v-if="requestJson.length > 0"><button @click="LoadXLSX('request')" class="LoadExel"><img src="../../assets/excel.png"><span>&#8203;</span></button></td>
              </tr>   
            </tbody></table>
          </div>

          <div v-if="viewmode == 1" class="TableDiv" style="max-height: 60vh; min-height: 60vh;">
          <table class="TableDefault">
          <thead><tr><th>Цель</th><th>Заявки</th><th>Широта</th><th>Долгота</th><th>Высота</th><th></th></tr></thead>
          <tbody><tr v-for="data, index in catalogJson"
              :key="index"
              @change="ChangeParam"
              v-show="!(data.deleted==true)">
              <td><input type="text" v-model="data.goalName"></td>
              <td style="display: flex;align-items: center;justify-content: space-around;"><span>{{data.countRequest}}</span><img @click="AddRowRequest(data)" src="../../assets/add.png" alt="" class="addButtonIcon"></td>
              <td><input @keydown.ctrl.v="TryParceLatLng(index)" type="number" v-model="data.lat"></td>
              <td><input @keydown.ctrl.v="TryParceLatLng(index)" type="number" v-model="data.lon"></td>
              <td><input type="number" v-model="data.alt"></td>
              <td :id="index" @click="DeleteRow(index)" class="delete"><img class="iconDelete" src="../../assets/delete.svg" alt="-"></td>
            </tr>
            <tr class="addRowButton">
              <td colspan="6"><button @click="AddRow"><img src="../../assets/add.png" alt="" class="addButtonIcon">Добавить</button></td>
            </tr> 
          </tbody></table>
        </div>
        <div v-if="viewmode == 2" class="TableDiv" style="max-height: 60vh; min-height: 60vh;">
          <table class="TableDefault">
            <thead><tr><th>Имя</th><th>МКА</th><th>Объём, Мбайт</th><th>Приоритет</th><th>Время появления</th><th></th></tr></thead>
            <tbody><tr v-for="data, index in datarequest"
              :key="index"
              @change="ChangeParamdatarequest"
              v-show="!(data.deleted==true)"
            >
              <td><input type="text" v-model="data.name"></td>
              <td><SelectDiv  :dataOption="datarequestКАList" :valueS="{lable: data.satellite.name, value: data.satellite.nodeId}" :id="index" @valueSelect="ChangeKadatarequest"/></td>
              <td><input type="number" v-model="data.capacity"></td>
              <td><input type="number" v-model="data.priority"></td>
              <td><DateTime :valueUnix="data.time" :id="String(index)" :name="'timedatarequest'" @valueSelect="ChangeTimedatarequest"/></td>
              <td :id="index" @click="DeleteRowdatarequest(index)" class="delete"><img class="iconDelete" src="../../assets/delete.svg" alt="-"></td>
            </tr></tbody>
            <tfoot><tr class="addRowButton">
              <td colspan="5"><button @click="CreateNewdatarequest"><img src="../../assets/add.png" alt="" class="addButtonIcon">Добавить</button></td>
              <td v-if="datarequest.length > 0"><button @click="LoadXLSX('datarequest')" class="LoadExel"><img src="../../assets/excel.png"><span>&#8203;</span></button></td>
            </tr> 
            </tfoot></table>
        </div>

        </div>  
    </div>
  </div>
</template>
  
  <script>

import { PagesSettings } from './PagesSettings';
import { OGList, NPList } from '@/js/GlobalData.js';
import SelectDiv from '../SelectDiv.vue'
import DateTime from '../DateTime.vue';
import XLSX from 'xlsx-js-style';

  export default {
    name: 'TargetDZZ',
    mixins: [PagesSettings],
    components:{
      SelectDiv,
      DateTime
    },
    data(){
      return{
        viewmode: 0,
        catalogJson: [],
        selectCatalog: null,

        datarequest: [],
        datarequestКАList: [],
        requestJson: [],
        choiceCriteriaArr: [{value: 1, lable: 'Время'},{value: 2, lable: 'Разворот'},{value: 3, lable: 'Качество'}],
        TypeRequest: [{value: 0, lable: 'в НП'},{value: 1, lable: 'Лидером'}],
        arr: [],
        arrNP: [],
      }
    },
    methods: {
      ChangeTime(obgtime){
        this.requestJson[obgtime.id][obgtime.name] = obgtime.time
        this.SatartSave('request')
      },
      TryParceLatLng(id){
        try {
          navigator.clipboard.readText().then(text => {
            try {
              let textParce = JSON.parse(text)
              this.catalogJson[id].lat = textParce.lat
              this.catalogJson[id].lon = textParce.lng
            }catch{
              console.error('')
            }
          })
        }catch{
          console.error("")
        }
      },
      async GetRequestFromDB(mode){
        if(mode == 1){
          await this.$FetchGet('/api/v1/smao/requests')
        }
        else if(mode==2){
          await this.$FetchGet('/api/v1/route/requests')
        }
        await this.ReFetch()
      },
      SelectChange(e, param){
        this.requestJson[e.id][param] = e.value
        this.SatartSave('request')
      },
      AddRowRequest(catalog){
        if(this.catalogJson.length < 1){
          alert("Нет целей в каталоге, пожалуйста создайте")
          return;
        }
        var addedRow = {
                      "requestId": undefined,
                      "catalog": catalog,
                      "orderId": this.requestJson.length + 1,
                      "priory": 3,
                      "term": this.systemStatus.modelingEnd,
                      "time": this.systemStatus.modelingBegin,
                      "earthPoint": this.arrNP[0].value,
                      "choiceCriteria": 1,
                      "filter": false,
                      "deleted": null, 'role': "newRow"
                };
        if(this.systemStatus.typeWorkplace in {3:null,4:null}){
          addedRow.type = 0
        }
            this.requestJson.push(addedRow);   
            this.SatartSave('request')
      },
      DeleteRowRequest(index){
              this.requestJson[index].deleted = true
              this.SatartSave('request')
          },
      ChangeParamRequest(){
        this.SatartSave('request')
      },
      ChangeTimedatarequest(e){  // изменение времени в данных по заявкам
        this.datarequest[e.id].time = e.time
        this.SatartSave('datarequest')
      },
      ChangeKadatarequest(e){ // изменение выбранного ка в данных по заявкам
        this.datarequest[e.id].satellite.id = e.value
        this.SatartSave('datarequest')
      },
      CreateNewdatarequest(){ // Данные по заявкам добавление
        var addedRow = {
                    "capacity": 100,
                    "priority": 3,
                    "time" : this.systemStatus.modelingBegin,
                    "satellite":  {id: this.datarequestКАList[0].value},
                    "deleted": null
                };
        this.datarequest.push(addedRow)
        this.SatartSave('datarequest')
      },
      DeleteRowdatarequest(index){ //удаление из данные по заявкам
        this.datarequest[index].deleted = true
        this.SatartSave('datarequest')
      },
      ChangeParamdatarequest(){ // this.datarequest изменении параметров данных по заявкам
          this.SatartSave('datarequest')
      },
      CreateSelectArr(){
        this.arr = []
        for (let i = 0; i < this.catalogJson.length; i++) {
          const element = this.catalogJson[i];
          this.arr.push({value: element, lable: element.goalName })
        }
      },
      AddRow(){
            var addedRow = {
                    'goalId' : 0,
                    'goalName' : "", 'lat' : 0,
                    'lon' : 0, 'alt' : 0,
                    'deleted': false, 'role': "newRow"
                };
            this.catalogJson.push(addedRow);   
            this.SatartSave('catalog')
          },
      ChangeParam(){
        this.SatartSave('catalog')
      },
      DeleteRow(index){
              this.catalogJson[index].deleted = true
              this.SatartSave('catalog')
          },
      async SatartSave(target){
        if(target == 'catalog'){await this.$FetchPost("/api/v1/satrequest/catalog/update", this.catalogJson)}
        if(target == 'request'){await this.$FetchPost("/api/v1/satrequest/request/update", this.requestJson)}
        if(target == 'datarequest'){await this.$FetchPost("/api/v1/satrequest/data/update", this.datarequest)}
        await this.ReFetch()
      },
      
      async ReFetch(){
        this.datarequest = await this.$FetchGet('/api/v1/satrequest/data/get/all') || []
        this.catalogJson = await this.$FetchGet('/api/v1/satrequest/catalog/get/all') || []
        for (let index = 0; index < this.catalogJson.length; index++) {
          this.catalogJson[index].countRequest = 0;
        }
        this.requestJson = await this.$FetchGet('/api/v1/satrequest/request/get/all') || []
        for (let index = 0; index < this.requestJson.length; index++) {
          const element = this.requestJson[index].catalog.goalId
          for (let indexii = 0; indexii < this.catalogJson.length; indexii++) {
            if(element == this.catalogJson[indexii].goalId){
              this.catalogJson[indexii].countRequest++;
              break
            }
          }
        }
        this.CreateSelectArr()
        },
        LoadXLSX(mode='request'){
          const workbook = XLSX.utils.book_new();
          let data = []
          if(mode == 'request')
          {
            data = [["Цель","Широта","Долгота","Высота","НП","Критерий","Приоритет","Время появления","Срок выполнения"]]
            if(this.systemStatus.typeWorkplace in {3:null,4:null}){
              data[0].push("Признак")
            }
            this.requestJson.forEach(element => {
              let crit = "Время"
              if(element.choiceCriteria == 2) crit = "Разворот"
              if(element.choiceCriteria == 3) crit = "Качество"
              let row = [element.catalog.goalName, element.catalog.lat, element.catalog.lon, element.catalog.alt,
                element.earthPoint.nameEarthPoint, crit, element.priory, this.CreateDateTime(element.time), this.CreateDateTime(element.term)
              ]
              if(this.systemStatus.typeWorkplace in {3:null,4:null}){
                row.push(this.TypeRequest[element.type].lable)
              }
              data.push(row)
            });
          }
          else{
            data = [["Имя","МКА","Объём, Мбайт","Приоритет","Время появления"]]
            this.datarequest.forEach(element => {
              data.push([element.name,element.satellite.name,element.capacity,element.priority,this.CreateDateTime(element.time)])
            });
          }
          let worksheet = XLSX.utils.aoa_to_sheet(data); // Создаем таблицу в файле с данными из массива
          workbook.SheetNames.push('Data'); // Добавляем лист с названием First list
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
            try {
              if (data[0].indexOf(worksheet[key].v) != -1) {
                worksheet[key].s = style
              }
            } catch (error) {
              console.log(error)
            }
          }
          workbook.Sheets['Data'] = worksheet;
          XLSX.writeFile(workbook, 'dataRequest.xlsx');
        },
    },
    
    async mounted() {
      if(this.systemStatus.typeWorkplace in {3:null}){
        this.viewmode = 2
      }
      NPList.forEach(element => {
        this.arrNP.push({value: element, lable: element.nameEarthPoint })
      })
      await this.ReFetch()
      this.datarequestКАList = []
      OGList.forEach(OG => {
        OG.satellites.forEach(element =>{
          this.datarequestКАList.push({value: element.satelliteId, lable: element.name })
        })
      });
    },
  }
  </script>

<style lang="scss" scoped>

.ChangeViewMode{
  position: fixed;
  padding: 0px;
  border: none;
  background: none;
  
  top: 50%;

  &.Left{
    left: 20px;
  }
  &.Right{
    right: 20px;
  }
  img{
    width: 30px;
  }
}
#map{
  background-color: #2b2b2b;
  position: relative;
    outline-style: none;
    height: 75vh;
  margin: 10px;
  .leaflet-map-pane{
            pointer-events: none;
        }
}

#DrawKARoad{
  display: flex;
  align-items: center;
  padding: 5px 20px;
  margin: 0px 40px;

  #inputColorKa{
  height: 50px;
  width: 100px;
  padding: 0px;
  margin: 5px 40px;
  }
  .ButtonCommand{
    margin: 5px 40px;
  }
}

.LoadExel{
  padding: 0px !important;
  width: fit-content !important;
  height: fit-content !important;
  img{
    width: 30px;
  }
}

</style>
