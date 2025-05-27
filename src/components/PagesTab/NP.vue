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
      <div class="ButtonApprovedDiv" v-if="!modellingStatus">
          <button @click="ChangeApproved(!approved)" class="ButtonCommand" :class="approved? 'green' : 'red'">
          <span v-if="approved"><img src="../../assets/edit.svg"></span>
          <span v-else><img src="../../assets/approve.svg"></span>
          <span>{{ approved ?  'Редактировать' : 'Утвердить'}}</span>
        </button>
      </div>
      </div>
    </div>
    <div class="Panel RightPanel">
      <div class="TableDiv" style="height: 98%;">
      <table class="TableDefault">
        <thead>
          <tr>
            <th></th>
            <th>Название</th>
            <th>Широта</th>
            <th>Долгота</th>
            <th class="delete"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(data, index) in dataJson"
            :key="index"
            :class="approved || modellingStatus ? 'disable' :''"
            @change="ChangeParam(index)"
            @keydown.ctrl.v="TryParceLatLng(index)"
          >
            <td>{{ index+1 }}</td>
            <td><input v-model="data.nameEarthPoint"></td>
            <td><input @keydown.ctrl.v="TryParceLatLng(index)" type="number"  v-model="data.latitude"></td>
            <td><input @keydown.ctrl.v="TryParceLatLng(index)" type="number"  v-model="data.longitude" ></td>
            <td @click="DeleteRow(index)" class="delete" :class="!approved && !modellingStatus?'':'disable'"><img class="iconDelete" src="../../assets/delete.svg" alt="Удалить"></td>
          </tr>
        </tbody>
        <tfoot>
          <tr v-if="!approved && !modellingStatus" class="addRowButton">
            <td colspan="5"><button @click="AddRow(0,0)">
              <img src="../../assets/add.png" alt="" class="addButtonIcon">
              Добавить наземный пункт
            </button></td>
          </tr> 
        </tfoot>
      </table>
    </div>
   </div> 
  </div>
  </div>
</template>
  
<script>
import {DisplayLoad} from '../../js/LoadDisplayMetod.js'
import { NPList, ChangeNP, SystemObject, ChangeSystemObject} from '@/js/GlobalData.js'; 
import { PagesSettings } from './PagesSettings.js';

  export default {
    name: 'NP',
    mixins: [PagesSettings],
    data(){
      return{
        dataJson: [], // локальное хранилище нп
        approved: true,
      }
    },
    methods: {
        async AddRow(lng=0,lat=0){
          this.dataJson.push({'nameEarthPoint' : "", 'longitude' : lng, 'latitude' : lat, 'deleted': false});   
          this.dataJson = await ChangeNP(this.dataJson)
        },
        TryParceLatLng(id){
          console.log(id)
          try {
            navigator.clipboard.readText().then(text => {
              try {
                let textParce = JSON.parse(text)
                this.dataJson[id].latitude = textParce.lat
                this.dataJson[id].longitude = textParce.lng
              }catch{
                console.error('')
              }
            })
          }catch{
            console.error("")
          }
        },
        async ChangeParam(id){
          this.dataJson[id]
          let longitudecorrect = Number(this.dataJson[id].latitude)
            if(longitudecorrect < -90) longitudecorrect = -90
            if(longitudecorrect > 90) longitudecorrect = 90
            this.dataJson[id].latitude = longitudecorrect

          let latitudecorrect = Number(this.dataJson[id].longitude)
              if(latitudecorrect < -180) latitudecorrect = -180
              if(latitudecorrect > 180) latitudecorrect = 180
              this.dataJson[id].longitude = latitudecorrect

          await ChangeNP(this.dataJson, false)
        },
        async DeleteRow(index){
            this.dataJson[index].deleted = true
            this.dataJson = await ChangeNP(this.dataJson)
        },
        async ChangeApproved(status){
          await ChangeSystemObject('earthStatus', status)
          this.approved = status
        }
    },
    async mounted() {
      DisplayLoad(true)
      this.dataJson = await NPList
      this.approved = SystemObject.earthStatus

      DisplayLoad(false)
    }
  }
  </script>

<style lang="scss" scoped>
.delete{
  &.disable{
    opacity: 0;
    pointer-events: none;
  }
}
</style>
