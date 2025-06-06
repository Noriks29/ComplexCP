<template>
    
    
    <div class="SectionMenu" :class="system.typeWorkplace == -1 ? 'hide' : 'show'">
      <div class="HeadersSction">
        <div class="PanelMenu"><SystemWindow :modellingStatus="ExperimentStatus" @updateParentComponent="ChangeComponents" :systemStatus="system" /></div>
        <transition name="ComponentModelling" mode="out-in">
          <div class="ModellingDiv PanelMenu">
            <component :is="ComponentModellingList[system.typeWorkplace]" :systemStatus="system" :ExperimentStatus="ExperimentStatus" @ChangeExperimentStatus="ChangeExperimentStatus"></component>  
          </div>
        </transition> 
      </div>
      <div class="FooterSection">
        <div class="workpage">
          <MapContainer v-if="activeComponent == ''"/>
          <transition name="translate" mode="out-in" v-if="activeComponent != ''">
            <div class="ComponentSelect">
              <component :is="activeComponent" :modellingStatus="ExperimentStatus" @updateParentComponent="ChangeComponents" :systemStatus="system" ></component> 
            </div>
          </transition>
        </div>
        <div class="FlexMenuSection">
        <div class="ButtonSection second" v-if="system.typeWorkplace in {3:null}">
          <h1>Получение ИД</h1>
          <div class="ButtonList">
            <button class="ButtonCommand"  @click="GetDataToModule(1)"><span>Планирование без НКУ</span></button>
            <button class="ButtonCommand"  @click="GetDataToModule(2)"><span>Планирование с НКУ</span></button>
          </div>
        </div>
          <div class="ButtonSection first">
            <h1>КС</h1>
            <!--rgb(0 34 108)
            <span @click="this.$showToast('This is a global success message!','info', 'TestTitle');">-1-</span>
            <span @click="this.$showToast('This is a global success message!','warning', 'TestTitle');">-1-</span>
            <span @click="this.$showToast('This is a global success message!','error', 'TestTitle');">-1-</span>
            <span @click="this.$showToast('This is a global success message!','success', 'TestTitle');">-1-</span>
            <span @click="this.$showToast('This is a global success message!','process', 'TestTitle');">-1-</span>
            <span @click="this.$showToast('This is a global success message!','test', 'TestTitle');">-1-</span>-->
            <div class="ButtonList">
              <button class="buttonType1" :class="activeComponent=='NP'? 'select':''" @click="SelectComponent('NP')"><span>НП</span></button>
              <button class="buttonType1" :class="activeComponent=='OG'? 'select':''" @click="SelectComponent('OG')"><span>КА и ОГ</span></button>
              <button class="buttonType1" :class="activeComponent=='TypeKA'? 'select':''" @click="SelectComponent('TypeKA')"><span>Модели КА</span></button>
            </div>   
          </div>
          <div class="ButtonSection second" v-if="system.typeWorkplace in {3:null}">
            <h1>Связь</h1>
            <div class="ButtonList">
              <button class="buttonType1" :class="activeComponent=='EarthConstellation'? 'select':''" @click="SelectComponent('EarthConstellation')"><span>КА - НП</span></button>
              <button class="buttonType1" :class="activeComponent=='LeaderConstellationConstellation'? 'select':''"  @click="SelectComponent('LeaderConstellationConstellation')"><span>КА - КА</span></button>
            </div>
          </div>
          <div class="ButtonSection third" >
            <h1>Исходные данные</h1>
            <div class="ButtonList">
              <button class="buttonType1" :class="activeComponent=='TargetDZZ'? 'select':''" @click="SelectComponent('TargetDZZ')"><span>Заявки</span></button>
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
        system: {typeWorkplace: -1},
        ExperimentStatus: false,
        ComponentModellingList: [null,"KA1","KAGordeev","KAPavlov",null]
    }
  },
  methods: {
      SelectComponent(nameComponent) {
        if(this.activeComponent == nameComponent){
          this.activeComponent = ''
          return
        }
        this.activeComponent = nameComponent
      },
      ChangeExperimentStatus(status){
        this.ExperimentStatus = status.status
        this.$emit('changeExperimentStatus', this.ExperimentStatus)
      },
      async ChangeComponents() {
        this.activeComponent = ''
        this.system = await this.$SystemObject()
      },
      async GetDataToModule(moduleL){
        
        this.$showLoad(true);
        await this.$FetchPost('/api/v1/workplace/replace', moduleL)
        alert("На данный момент лучше перезагружать сайт после этого запроса")
        this.$showToast('На данный момент лучше перезагружать сайт после этого запроса','info', 'В разработке');
        this.$showLoad(false);
      },
    },
    
    created(){
      this.ChangeComponents()
    },
}

</script>

<style lang="scss">
.ModellingTitle{
      font-size: 20px;
      margin: 10px;
      font-weight: bold;
      text-align: left;
    }
.SectionMenu{
  align-items: normal !important;
  top: 40px !important;
  height: calc(100% - 40px) !important;
  .ModellingDiv{
    height: calc(100% - 46px) !important;
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    
    .PanelWork{
      flex:1;
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
    flex: 1;
    z-index: 1 !important;
    height: auto !important;
    background: none !important;
    .ContentDiv{
      flex-direction: column !important;
      .LeftPanel{
        flex: none !important;
        margin-left: 60px;
        .FlexColumn{
          display: flex;
          flex-wrap: wrap;
          flex-direction: row !important;
          div{
            width: auto;
            flex: 1;
            &.ButtonApprovedDiv button{
              width: 160px !important;
              margin: 0px !important;
              padding: 5px;
            }
            .ButtonCommand{
              white-space: nowrap;
            }
          }
        }
        .OGList{
          max-height: 20vh;
          overflow-y: auto;
        }
        
      }
    }

    .ToMenuButtonDiv{
      position: absolute !important;
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
        div{
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 20px;
          &.approved{
            background-color: rgb(0, 139, 0);
            box-shadow: inset 0px 0px 6px rgb(0 239 0);
          }
          &.Notapproved{
            background-color: red;
            box-shadow: inset 0px 0px 6px #fe1a1a;
          }
        }
      }
    }
  }
}
.PanelMenu{
  animation: 1s ease-out 0s 1 slideInFromTop;
}

.HeadersSction{
  display: flex;
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
    }
}

</style>
