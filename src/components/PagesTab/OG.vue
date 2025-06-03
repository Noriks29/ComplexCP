<template>
    <div class="main_contain RowSection">
          <div>
            <button class="ToMenuButtonDiv" @click="SelectComponent('TemplateComponent')">
              <img src="@/assets/exit.svg"><span>&#8203;</span>
            </button>
          </div>
    <div class="ContentDiv">
    <div class="Panel LeftPanel">
        <div class="FlexColumn">
          <div class="ButtonApprovedDiv" v-if="!modellingStatus">
          <button @click="ChangeApproved(!approved)" class="ButtonCommand" :class="approved? 'green' : 'red'">
          <span v-if="approved"><img src="../../assets/edit.svg"></span>
          <span v-else><img src="../../assets/approve.svg"></span>
          <span>{{ approved ?  'Редактировать' : 'Утвердить'}}</span>
          </button></div>
          <div class="OGList">
            <div v-for="data, index in dataJson"
              :key="index"
              class="ButtonCommand" :class="data.id==selectOG.id?'Select':''"
            >
              <div  @click="SelectOGFromList(data)" type="name">{{ data.constellationName }}</div>
              <div class="iconDelete" @click="DeleteRowOG(data)" type="icon"><img  src="@/assets/delete.svg" alt="Удалить"></div>
          </div>
            <button class="ButtonCommand" :class="!approved? '' : 'disable'"  @click="PageSettings.status=(PageSettings.status+1)%2">
              <img src="@/assets/add.png" alt="" class="addButtonIcon">{{ (PageSettings.status == 1) ? 'Прекратить' : 'Добавить орбитальную группировку' }}
            </button>
          </div>
        </div>
    </div>


    <div class="Panel RightPanel">
      <DefaultTable2 v-if="PageSettings.status == 0" :dataTable="dataTable" :settings="{showIndex:true}" @changeT="ChangeParamTable"/>

          <div v-if="PageSettings.status == 1">
            <div class="flexrow">
              <div class="inputdiv"><input type="text" v-model="OG_Param.constellationName" placeholder="Введите название"></div>

              <div v-if="OG_Param.inputType == 3">
                <label class="input-file">
                    <input type="file" name="file" id="file-Json" @change="LoadFile" enctype="multipart/form-data">		
                    <span>Загрузить файл</span>
                </label>
                Файл: {{ (OG_Param.file !== undefined) ? OG_Param.file.name : "Не выбран" }}
              </div>
              <div>
                <button @click="AddOG" class="ButtonCommand">Создать</button> 
              </div>
            </div>
            
          </div>
    </div>
</div>
</div>
</template>
  
  <script>
import {FetchGet, FetchPost, FetchPostFile} from '@/js/LoadDisplayMetod'
import { PagesSettings } from './PagesSettings.js';
import { OGList, ChangeOG, SystemObject, ChangeSystemObject} from '@/js/GlobalData';
import { CreateDateTime } from '@/js/WorkWithDTime';
import DefaultTable2 from '../DefaultTable2.vue';

  export default {
    name: 'OG',
    mixins: [PagesSettings],
    data() {
      return {
        OGType: {1: "Произвольное построение", 2:"Системное построение", 3:"Загруженно из TLE"}, //список типов созданий ог
        dataJson: [],
        PageSettings:{
          status: 0
        },
        dataTable: {label:[
          {param: 'modelSat', name: 'Модель КА', tag: {name: "SelectDiv", dataOption:null,valueS:"modelName"}},
          {param: 'name', name: 'Имя КА', tag: {name: "span"}},
          {param: 'timeTLE', name: 'Дата расчёта', tag: {name: "span"}},
          {param: 'altitude', name: 'Большая полуось', tag: {name: "input"}},
          {param: 'eccentricity', name: 'Эксцентриситет', tag: {name: "input"}},
          {param: 'incline', name: 'Наклон', tag: {name: "input"}},
          {param: 'longitudeAscendingNode', name: 'Долгота восходящего узла', tag: {name: "input"}},
          {param: 'perigeeWidthArgument', name: 'Аргумент широты перигея', tag: {name: "input"}},
          {param: 'trueAnomaly', name: 'Истинная аномалия', tag: {name: "input"}},
        ],data:[]},

        KaModels: [], //список моделей ка
        KaLableId: {}, // чисто для базового вывода имени ка
        selectOG: {id:null}, //выбранная группировка ог

        approved: true, //утверждено или нет
        
        //далее для добавления ог
        OG_Param:{
          constellationName: undefined,
          inputType: 3,
          arbitraryFormation: true,
          communicationsFormation: null,
          parametersCalculation: {},
          file: undefined
        },
      }
    },
    components:
    {
      DefaultTable2
    },
    methods: {
      CreateDateTime(time){
        return CreateDateTime(time)
      },
      ChangeParamTable(data){
        if(data.param == 'modelSat'){
          this.selectOG.satellites[data.data.id][data.param].id = data.data.value
        }
        this.SaveOGChange()
      },
      SelectOGFromList(data){
        this.selectOG = {id:null}
        if(data != undefined){
          this.selectOG = data
          this.dataTable.data = data.satellites
          if(this.selectOG.inputType in {1:null, 2:null} && !this.approved){
            this.abilityEdit = true
          }
          this.OGTimePrevrap()
        }
        else{
          this.dataTable.data = []
        }
      },
      OGTimePrevrap(){
        this.selectOG.satellites.forEach(element => {
          element.timeTLE = CreateDateTime(element.tleTime)
        });
      },
      async DeleteRowOG(data){
        if(!this.approved){
          await FetchPost('/api/v1/constellation/delete/byId',{},'id='+data.id)
          this.selectOG = {id:null}
          this.dataJson = await FetchGet('/api/v1/constellation/get/list') || []
          ChangeOG(this.dataJson)
          this.SelectOGFromList(this.dataJson[0])
        }
      },
      async ChangeApproved(stat){
          this.approved = stat
          this.abilityEdit = false
          try {
            if(this.selectOG.inputType in {1:null, 2:null} && !this.approved){
              this.abilityEdit = true
            }
          } catch (error) {
            this.abilityEdit = false
          }
          await ChangeSystemObject('constellationStatus', stat)
        },
          async SaveOGChange() { //сохранение изменения ог
            await FetchPost('/api/v1/constellation/update',this.selectOG)
            this.dataJson = await ChangeOG(await FetchGet('/api/v1/constellation/get/list') || [])
            for (let i = 0; i < this.dataJson.length; i++) {
              const element = this.dataJson[i];
              if(element.id == this.selectOG.id){
                this.selectOG = element
                this.OGTimePrevrap()
                break
              }              
            }

          },
          async AddOG(){
            if(this.OG_Param.constellationName != undefined)
            {
              let responce =  {}
              this.SelectOGFromList(undefined)
              if(this.OG_Param.inputType == 3){
                const formData = new FormData(); // Создаем FormData
                const file = this.OG_Param.file
                formData.append('file', file); // Добавляем файл
                formData.append('constellationName', this.OG_Param.constellationName); // Добавляем имя
                formData.append('inputType', 3);
                responce = await FetchPostFile("/api/v1/constellation/upload/tle", formData)
              }
              if(responce.type == "SUCCESS"){
                this.dataJson = await ChangeOG(await FetchGet('/api/v1/constellation/get/list') || [])
                this.PageSettings.status = 0
                this.SelectOGFromList(undefined)
              }
              else{
                alert("Ошибка добавления" + JSON.stringify(responce))
                console.log(responce)
              }
            }
            else{
              alert("Некоректные входные данные - '"+this.OG_Param.constellationName+"' - '"+this.OG_Param.inputType+"'")
            }
          },
          async LoadFile(data){
            if (data.target.files[0]) {
              var file = data.target.files[0];
              this.OG_Param.file = file
            }
          },
    },
    async mounted(){
      this.approved = SystemObject.constellationStatus
      this.dataJson = OGList
      let result = await FetchGet('/api/v1/modelsat/all')
      this.KaModels = []
      for (let index = 0; index < result.length; index++) {
        this.KaModels.push({value:result[index].id, lable: result[index].modelName})
      }
      this.dataTable.label[0].tag.dataOption = this.KaModels
      this.selectOG = OGList[0]
      this.SelectOGFromList(this.dataJson[0])
    },
  }
  </script>

<style lang="scss" scoped>

.ElementCol{
  display: grid;
  grid-template-columns: 4fr 3fr 1fr;
  background: var(--background-Button1);
  border: 1px solid var(--border-button);
  padding: 5px;
  border-radius: 5px;
  margin: 1px 5px;
  transition: all 0.2s;
  div{
    padding: 5px 10px;
  }
}

.flexrow{
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  .inputdiv input{
    border-bottom: 1px solid white;
  }
}


.OGList{
  display: flex;
  .ButtonCommand{
    padding: 10px 20px;
    display: flex;
    align-items: center;
    width: auto !important;
    flex: none !important;
    .addButtonIcon{
      top: auto;
    }
  }
}
.ButtonApprovedDiv{
  width: auto !important;
  flex: none !important;
  margin-right: 40px;
}



</style>
  
