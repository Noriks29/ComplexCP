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
          <div>
            <button class="ButtonCommand" :class="!approved? '' : 'disable'"  @click="PageSettings.status=(PageSettings.status+1)%2">
              <img src="@/assets/add.png" alt="" class="addButtonIcon">{{ (PageSettings.status == 1) ? 'Прекратить' : 'Добавить орбитальную группировку' }}
            </button>
          </div>
        </div>
        <div class="OGList">
        <div v-for="data, index in dataJson"
          :key="index"
          v-show="!(data.deleted==true)"
          class="ElementCol"
        >
          <div  @click="SelectOGFromList(data)" type="name">{{ data.constellationName }}</div>
          <div  @click="SelectOGFromList(data)" type="type">{{ OGType[data.inputType] }}</div>
          <div class="iconDelete" @click="DeleteRowOG(data)" type="icon"><img  src="@/assets/delete.svg" alt="Удалить"></div>
        </div>
        </div>
    </div>


    <div class="Panel RightPanel">
      <DefaultTable2 :dataTable="dataTable" :settings="{showIndex:true}" @changeT="ChangeParamTable" @addRow="AddRow(0,0)" @DeletedRow="DeleteRow"/>
          <div v-if="PageSettings.status == 0 && selectOG != null" style="height: 93%;">
            <div class="TableDiv" style="max-height: 100%; height: 90%;">
            <table class="TableDefault">
              <thead>
                <tr><th>Модель КА</th><th>Имя КА</th>
                  <th>Расчёт TLE</th>
                  <th>Большая полуось</th>
                  <th>Эксцентриситет</th><th>Наклон</th><th>Долгота восходящего узла</th><th>Аргумент широты перигея</th>
                  <th>Истинная аномалия</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(data, index) in selectOG.satellites" :key="index"
                  :class="!abilityEdit ? 'disable' :''"
                  @change="ChangeParam"
                  v-show="!(data.deleted==true)"
                >
                  <td :class="!abilityEdit ? 'disable' : ''"><SelectDiv  :dataOption="KaModels" :valueS="{lable: KaLableId[data.modelSat.id], value: data.modelSat}" :id="String(index)" @valueSelect="SelectChangeKA" /></td>
                  <td><input type="text" v-model="data.name"></td>
                  <td>{{ CreateDateTime(data.tleTime) }}</td>
                  <td><input type="number" v-model="data.altitude"></td>
                  <td><input type="number" v-model="data.eccentricity"></td>
                  <td><input type="number" v-model="data.incline"></td>
                  <td><input type="number" v-model="data.longitudeAscendingNode"></td>
                  <td><input type="number" v-model="data.perigeeWidthArgument"></td>
                  <td><input type="number" v-model="data.trueAnomaly"></td>
                </tr></tbody><tfoot>
              </tfoot>
            </table>
          </div>
          </div>
          <div v-if="PageSettings.status == 1">
            <div class="flexrow">
              <div class="SelectDivInFlex">
                <SelectDiv  
                    :dataOption="[]" 
                    :valueS="{lable: OGType[OG_Param.inputType]}"
                    @valueSelect="OG_Param.inputType=$event.value"/>
              </div>
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
import {DisplayLoad, FetchGet, FetchPost, FetchPostFile} from '@/js/LoadDisplayMetod'
import { PagesSettings } from './PagesSettings.js';
import { OGList, ChangeOG, SystemObject, ChangeSystemObject} from '@/js/GlobalData';
import SelectDiv from '../SelectDiv.vue';
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
        selectOG: undefined, //выбранная группировка ог
        abilityEdit: false, // доступ к редактированию

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
      SelectDiv,
      DefaultTable2
    },
    methods: {
      CreateDateTime(time){
        return CreateDateTime(time)
      },
      SelectOGFromList(data){
        this.selectOG = data
        this.dataTable.data = data.satellites
        if(this.selectOG.inputType in {1:null, 2:null} && !this.approved){
          this.abilityEdit = true
        }
        this.OGTimePrevrap()
      },
      OGTimePrevrap(){
        this.selectOG.satellites.forEach(element => {
          element.timeTLE = CreateDateTime(element.tleTime)
        });
      },
      async DeleteRowOG(data){
        if(!this.approved){
          await FetchPost('/api/v1/constellation/delete/byId',{},'id='+data.id)
          this.selectOG = undefined
          this.dataJson = await FetchGet('/api/v1/constellation/get/list') || []
          ChangeOG(this.dataJson)
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

        AddRow(){
            var addedRow = {
                    'altitude' : 0, 'eccentricity' : 0,
                    'incline' : 0, 'longitudeAscendingNode' : 0,
                    'perigeeWidthArgument' : 0, 'trueAnomaly' : 0,
                    'phaseShift': null, plane:null, position:null,
                    'deleted': false, 'satelliteId': undefined,
                    "modelSat": {"id": this.KaModels[0].value},
                    name: "none", role: 0
                };
            this.selectOG.satellites.push(addedRow);  
            this.SaveOGChange()
        },
        ChangeParam(){
            this.SaveOGChange()
          },
          SelectChangeKA(data){
            this.selectOG.satellites[data.id].modelSat.id = data.value
            this.SaveOGChange()
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
              if(this.OG_Param.inputType == 1)
              {
                responce = await FetchPost('/api/v1/constellation/add',this.OG_Param) || {}
              }
              else if(this.OG_Param.inputType == 2) {
                responce = await FetchPost('/api/v1/constellation/calc/planar',this.OG_Param) || {}
              }
              else if(this.OG_Param.inputType == 3){
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
      DisplayLoad(true)
      this.approved = SystemObject.constellationStatus
      this.dataJson = OGList
      this.KaRole = []
      let result = await FetchGet('/api/v1/modelsat/all')
      this.KaModels = []
      for (let index = 0; index < result.length; index++) {
        this.KaModels.push({value:result[index].id, lable: result[index].modelName})
        this.KaLableId[result[index].id] = result[index].modelName
      }
      this.dataTable.label[0].tag.dataOption = this.KaModels
      DisplayLoad(false)
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






</style>
  
