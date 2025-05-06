<template>
    
    
    <div class="SectionMenu" :class="system.typeWorkplace == -1 ? 'hide' : 'show'">
      <transition name="ComponentModelling" mode="out-in" :class="system.typeWorkplace == -1 ? 'hide' : 'show'" v-if="activeComponent == ''">
        <div class="ModellingDiv">
          <p class="ModellingTitle">{{ TextTitleModellingName }}</p>
          <component :is="ComponentModellingList[system.typeWorkplace]" :systemStatus="system" :reload="reload" :ExperimentStatus="ExperimentStatus" @ChangeExperimentStatus="ChangeExperimentStatus"></component> 
          <MapContainer/>
        </div>
      </transition> 
      <transition name="translate" mode="out-in" v-if="activeComponent != ''">
        <div class="ComponentSelect">
          <component :is="activeComponent" :FillingDataStatus="FillingDataStatuss" :modellingStatus="ExperimentStatus" @updateParentComponent="ChangeComponents" :systemStatus="system" ></component> 
        </div>
      </transition> 
      <div class="FlexMenuSection">
        <div class="ButtonSection system" >
          <h1>Система</h1>
          <SystemWindow :FillingDataStatus="FillingDataStatuss" :modellingStatus="ExperimentStatus" @updateParentComponent="ChangeComponents" :systemStatus="system" />
        </div>
        <div class="ButtonSection first">
          <h1>КС</h1>
          <div class="ButtonList">
            <button class="active" @click="SelectComponent('NP')"><div :class="system.earthStatus ? 'approved' : 'Notapproved'"></div>НП</button>
            <button class="active" @click="SelectComponent('OG')"><div :class="system.constellationStatus ? 'approved' : 'Notapproved'"></div>КА и ОГ</button>
            <button :class="!ExperimentStatus > 0 ? 'active' : ''" @click="SelectComponent('TypeKA')">Модели КА</button>
          </div>   
        </div>
        <div class="ButtonSection second">
          <h1>Связь</h1>
          <div class="ButtonList">
            <button :class="FillingDataStatus && !ExperimentStatus > 0 ? 'active' : ''" @click="SelectComponent('EarthConstellation')"><div :class="system.earthSatStatus ? 'approved' : 'Notapproved'"></div>КА - НП</button>
            <button :class="FillingDataStatus && !ExperimentStatus > 0 ? 'active' : ''"  @click="SelectComponent('LeaderConstellationConstellation')"><div :class="system.satSatStatus ? 'approved' : 'Notapproved'"></div>КА - КА</button>
          </div>
        </div>
        <div class="ButtonSection third" >
          <h1>Исходные данные</h1>
          <div class="ButtonList">
            <button  :class="FillingDataStatus && !ExperimentStatus > 0 ? 'active' : ''" @click="SelectComponent('TargetDZZ')">Заявки</button>
          </div>
        </div>        
      </div>
    </div>
</template>

<script>
import { saveAs } from 'file-saver';
import {FetchGet, FetchPostFile, DisplayLoad} from '../js/LoadDisplayMetod'
import { NPList, OGList, SystemObject } from '@/js/GlobalData';

import KA1 from './KA/KA1.vue';
import KAGordeev from "./KA/KAGordeev.vue";
import KAPavlov from './KA/KAPavlov.vue';

import NP from "./PagesTab/NP.vue";
import OG from './PagesTab/OG.vue'
import TypeKA from './PagesTab/TypeKA.vue';
import SystemWindow from './PagesTab/SystemWindow.vue';
import TargetDZZ from './PagesTab/TargetDZZ.vue'
import EarthConstellation from './PagesTab/EarthConstellation.vue'
import LeaderConstellationConstellation from './PagesTab/LeaderConstellationConstellation.vue';
import MapContainer from './MapContainer.vue';

export default {
  name: 'TemplateComponent',
  emits: ['changeExperimentStatus'],
  components: {
    NP,
    OG,
    TypeKA,
    SystemWindow,
    TargetDZZ,
    EarthConstellation,
    LeaderConstellationConstellation,

    KA1,
    KAGordeev,
    KAPavlov,
    MapContainer
  },
  data(){
      return{
        activeComponent: "",
        TextTitleModellingName: '',
        FillingDataStatus: 0,
        system: {typeWorkplace: -1},
        reload: 0,
        ExperimentStatus: false,
        ComponentModellingList: [null,"KA1","KAGordeev","KAPavlov",null]
    }
  },
  methods: {
    SelectComponent(nameComponent) {
        this.activeComponent = nameComponent
      },
      ChangeExperimentStatus(status){
        this.ExperimentStatus = status.status
        this.$emit('changeExperimentStatus', this.ExperimentStatus)
        this.reload++
      },
      ChangeComponents() {
        this.activeComponent = ''
        this.system = SystemObject
        this.ChengeFillingDataStatus()
        if(!this.ExperimentStatus){
          this.reload++
        }
      },
      async SaveWorkplace(){
        DisplayLoad(true)
        let dataLoad = {}
        dataLoad.modelSat = await FetchGet('/api/v1/modelsat/all')
        let result = NPList
        for (let index = 0; index < result.length; index++) {
          let new_data = result[index];
          new_data.id = undefined
          new_data.idNode = undefined
          result[index] = new_data
        }
        dataLoad.earth = result
        result = await FetchGet('/api/v1/system/get')
        result.systemId = undefined
        dataLoad.system = result

        result = OGList
        for (let index = 0; index < result.length; index++) {
          const element = result[index];
          element.id = undefined
          for (let jindex = 0; jindex < element.satellites.length; jindex++) {
            const j_element = element.satellites[jindex];
            j_element.idNode = undefined
            j_element.satelliteId = undefined
            element.satellites[jindex] = j_element
          }
          result[index] = element 
        }
        dataLoad.constellation = result

        result = await FetchGet('/api/v1/satrequest/catalog/get/all') || []
        for (let index = 0; index < result.length; index++) {
          const element = result[index];
          element.goalId = undefined
          result[index] = element
        }
        dataLoad.catalog = result

        dataLoad.satRequestData = await FetchGet('/api/v1/satrequest/data/get/all') || []

        result = await FetchGet('/api/v1/satrequest/request/get/all') || []
        for (let index = 0; index < result.length; index++) {
          const element = result[index];
          element.orderId = undefined
          element.requestId = undefined
          element.deleted = undefined
          result[index] = element
        }
        dataLoad.request = result

        var fileName = 'myData.json';
        var fileToSave = new Blob([JSON.stringify(dataLoad, null, 2)], {
            type: 'application/json'
        });
        saveAs(fileToSave, fileName);
        DisplayLoad(false)
      },
      async LoadFile(data){
        if (data.target.files[0]) {
          var file = data.target.files[0];
          const formData = new FormData();
          formData.append('file', file);
          await FetchPostFile("/api/v1/workplace/upload/file", formData)
        }
      },
      ChengeFillingDataStatus(){
        this.TextTitleModellingName = localStorage.getItem('modname')
      if(this.system.constellationStatus && this.system.earthStatus){
        this.FillingDataStatus = 1
      }
      else{
        this.FillingDataStatus = 0
      }
    },
    },
    
    created(){
      this.system = SystemObject
      this.ChengeFillingDataStatus()
    },
}

</script>

<style lang="scss">
.SectionMenu{
  flex-direction: row-reverse !important;
  .ModellingDiv{
    height: 100vh !important;
    width: 75vw !important;
    overflow-y: auto;
    .ModellingTitle{
      font-size: 20px;
      margin: 10px;
      font-weight: bold;
      text-align: left;
    }
    .main_contain{
      padding: 5px 0px 10px !important;
      /*height: calc(100% - 85px) !important;*/
      height: fit-content !important;
      .ContentDiv{
        display: flex !important;
        height: 100% !important;
        align-items: stretch !important;
        .FlexRow{
          width: auto !important;
        }
      }
    }
  }
  .ComponentSelect{
    position: relative !important;
    width: 75vw !important;
    z-index: 1 !important;
    background: none !important;

    .ToMenuButtonDiv{
      position: absolute !important;
    }
  }
  .FlexMenuSection{
    flex-direction: column !important;
    height: 100vh !important;
    width: 25vw !important;
    align-items: normal !important;
    .ButtonSection{
      height: auto !important;
      &.third{
        flex: 2;
      }
      &.system{
        flex: 10;
        max-height: fit-content;
      }
      &.first{
        flex:4;
      }
      &.second{
        flex:3;
      }
    }
  }
}

</style>
