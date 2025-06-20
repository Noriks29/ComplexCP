<template>
    
    
    <div class="SectionMenu">
      <div class="HeadersSction">
        <div class="PanelMenu">
          <SystemWindow :modellingStatus="false" @updateParentComponent="ChangeComponents" :systemStatus="system" />
        </div>
        <transition mode="out-in">
          <div class="ModellingDiv PanelMenu">
            <component :is="ComponentModellingList[system.typeWorkplace]" :systemStatus="system" :ExperimentStatus="false"></component>  
          </div>
        </transition> 
      </div>
      <div class="FooterSection">
        <div class="workpage">
          <transition name="translate" mode="out-in" v-if="activeComponent != ''">
            <div class="ComponentSelect">
              <component :is="activeComponent" :modellingStatus="false" @updateParentComponent="ChangeComponents" :systemStatus="system" ></component> 
            </div>
          </transition>
        </div>
        <div class="FlexMenuSection">
        <div class="ButtonSection" v-if="system.typeWorkplace in {3:null}">
          <div class="ButtonList PanelMenu">
            <h1>Получение ИД</h1>
            <button class="ButtonCommand GetData"  @click="GetDataToModule(1)"><span>План без НКУ</span></button>
            <button class="ButtonCommand GetData"  @click="GetDataToModule(2)"><span>План с НКУ</span></button>
          </div>
        </div>
        <div class="ButtonSection">
            <!--rgb(0 34 108)
            <span @click="this.$showToast('This is a global success message!','info', 'TestTitle');">-1-</span>
            <span @click="this.$showToast('This is a global success message!','warning', 'TestTitle');">-1-</span>
            <span @click="this.$showToast('This is a global success message!','error', 'TestTitle');">-1-</span>
            <span @click="this.$showToast('This is a global success message!','success', 'TestTitle');">-1-</span>
            <span @click="this.$showToast('This is a global success message!','process', 'TestTitle');">-1-</span>
            <span @click="this.$showToast('This is a global success message!','test', 'TestTitle');">-1-</span>-->
            <div class="ButtonList">
              <h1>КС</h1>
              <button class="buttonType1" :class="activeComponent=='NP'? 'select':''" @click="SelectComponent('NP')"><span>НП</span></button>
              <button class="buttonType1" :class="activeComponent=='OG'? 'select':''" @click="SelectComponent('OG')"><span>КА и ОГ</span></button>
              <button class="buttonType1" :class="activeComponent=='TypeKA'? 'select':''" @click="SelectComponent('TypeKA')"><span>Модели КА</span></button>
            </div>   
          </div>
          <div class="ButtonSection">
            <div class="ButtonList">
              <h1>Исходные данные</h1>
              <button class="buttonType1" :class="activeComponent=='TargetDZZ'? 'select':''" @click="SelectComponent('TargetDZZ')"><span>Заявки</span></button>
            </div>
          </div>
          <div class="ButtonSection" v-if="system.typeWorkplace in {3:null}">
            <div class="ButtonList">
              <h1>Связь</h1>
              <button class="buttonType1" :class="activeComponent=='EarthConstellation'? 'select':''" @click="SelectComponent('EarthConstellation')"><span>КА - НП</span></button>
              <button class="buttonType1" :class="activeComponent=='LeaderConstellationConstellation'? 'select':''"  @click="SelectComponent('LeaderConstellationConstellation')"><span>КА - КА</span></button>
            </div>
          </div>        
        </div>
      </div>
      
    </div>
</template>

<script>

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
        activeComponent: "MapContainer",
        system: {typeWorkplace: -1},
        ComponentModellingList: [null,"KA1","KAGordeev","KAPavlov",null]
    }
  },
  methods: {
      SelectComponent(nameComponent) {
        if(this.activeComponent == nameComponent){
          this.activeComponent = 'MapContainer'
          return
        }
        this.activeComponent = nameComponent
      },
      async ChangeComponents() {
        this.activeComponent = 'MapContainer'
        this.system = await this.$SystemObject()
      },
      async GetDataToModule(moduleL){
        this.$showLoad(true);
        await this.$FetchPost('/api/v1/workplace/replace', moduleL)
        this.$showToast('Данные получены','process', 'НП');
        this.$showToast('Данные получены','process', 'ОГ');
        this.$showToast('Данные получены','process', 'Заявки');
        this.$showLoad(false);
        this.$emit('reload')
      },
    },
    
    created(){
      this.ChangeComponents()
    },
}

</script>

<style lang="scss" scoped>
.PanelMenu{
  margin-left: 0px !important;
  .GetData{
    margin-right: 5px !important;
  }
}

</style>

<style lang="scss">
.SectionMenu{
    width: 99%;
    display: flex;
    flex-direction: column;
    margin: 0% 0% 0% 1%;
    flex-wrap: nowrap;
    overflow: auto;
    position: absolute;
    align-items: normal;
    top: 40px;
    height: calc(100% - 40px);

    .HeadersSction{
      display: flex;
      .ModellingDiv{ // далее смотри в глабольных стялях
        width: 100%;
        height: calc(100% - 46px);
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }
    .FooterSection{
      display: flex;
      flex: 1;
      flex-direction: row-reverse;
      overflow: hidden;
      .workpage{
        flex: 1;
        background-color: var(--color-bg-panel);
        border: 3px solid var(--color-border1);
        display: flex;
        border-top-left-radius: 10px;
        border-bottom: none;
        border-right: none;
        .ComponentSelect{
          display: flex;
          overflow-x: hidden;
          position: relative;
          flex: 1;
          z-index: 1;
          height: auto;
          background: none;
        }
      }
      .FlexMenuSection{
        flex-direction: column;
        height: auto ;
        width: fit-content ;
        align-items: normal ;
        display: flex;
        .ButtonSection{
          display: flex;
          flex-direction: column;
          flex-wrap: nowrap;
          transition: all 0.5s ease-out;
          position: relative;

          h1{
            margin: 5px;
            font-size: 18px;
            text-align: left;
            color: #777777;
          }
          .ButtonList{
            flex: 1;
            display: flex;
            justify-content: space-evenly;
            flex-direction: column;
            &.PanelMenu{
              margin: 0px 10px 0px 0px;
              padding: 5px;
            }
          }
          button{
            flex: 1;
            margin: 3px 0px 3px 0px;
            padding: 10px 0px 10px 5px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            z-index: 2;
            span{
              padding-left: 8px;
            }
          }
        }
      }
  }




    
  }









</style>
