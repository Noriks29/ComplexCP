<template>
    <div class="main_contain RowSection">
          <div>
            <button class="ToMenuButtonDiv" @click="SelectComponent('TemplateComponent')">
              <img src="../../assets/exit.svg">
            </button>
          </div>
    <div class="ContentDiv">

    <div class="Panel RightPanel">
      <DefaultTable2  :dataTable="dataTable" :settings="{showIndex:true,deleteMode: true,editAccess:true}" @changeT="ChangeParamTable" @addRow="AddRow(0,0)" @DeletedRow="DeleteRow"/>
   </div> 
  </div>
  </div>
</template>
  
<script>
import { NPList, ChangeNP} from '@/js/GlobalData.js'; 
import { PagesSettings } from './PagesSettings.js';
import DefaultTable2 from '../DefaultTable2.vue';

  export default {
    name: 'NP',
    mixins: [PagesSettings],
    data(){
      return{
        dataJson: [], // локальное хранилище нп
        dataTable: {label:[
          {param: 'nameEarthPoint', name: 'Название', tag: {name: "input"}},
          {param: 'latitude', name: 'Широта', tag: {name: "input", type: "number"}},
          {param: 'longitude', name: 'Долгота', tag: {name: "input", type: "number"}},
        ],data:[]}
      }
    },
    components:{
      DefaultTable2
    },
    methods: {
        async AddRow(lng=0,lat=0){
          this.dataJson.push({'nameEarthPoint' : "", 'longitude' : lng, 'latitude' : lat, 'deleted': false});   
          this.dataJson = await ChangeNP(this.dataJson)
          this.ShowTable()
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
        ChangeParamTable(data){
          this.dataJson[data.id][data.param] = data.value
          this.ChangeParam(data.id)
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
            this.ShowTable()
        },
        ShowTable(){
          this.dataTable.data = this.dataJson
        },
    },
    async mounted() {
      this.dataJson = await NPList
      this.ShowTable()
    }
  }
  </script>

<style lang="scss" scoped>
</style>
