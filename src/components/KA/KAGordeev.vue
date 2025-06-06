<template>
    <div class="main_contain">
      <DefaultTable v-if="ShowDefaultTable" :dataLableName="dataLableName" :dataTable="dataTable" @closetable="ShowDefaultTable = false" :prevrap="PreWrapDefaultTable"/>
      <div class="ContentDiv">
        <div class="FlexRow Panel">
          <div class="ButtonModelling">
             <button  @click="StartModelling" class="ButtonCommand rightPadding"><img src="../../assets/start.png" alt="" class="iconButton">Старт планирования</button>
          </div>
          <div class="PanelWork" v-if="!modellingSettings.experimentEddit">
          <table class="colum">
            <tbody>
              <tr>
                <td><button class="ButtonCommand LIghtPoint" @click="ShowRezult" :class="(modellingRezult.data.length < 1) ? 'disable' : ''">План съёмок</button></td>
                <td><button @click="console.log" :class="(true) ? 'disable' : ''" class="ButtonCommand icon"><img src="../../assets/instructions.png" alt="smaoResponse"></button></td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
</template>
  
<script>

import DefaultTable from '../DefaultTable.vue';

import { KaSettings } from './KaSettings';
  export default {
    name: 'KA2',
    mixins: [KaSettings],
    data(){
      return{
        modellingRezult: {
          data: []
        },
        modellingSettings:{
          experimentEddit: false
        },
        interSatellite: true,
        dataTable: [],
        dataLableName: [],
        ShootingData: [],
        PreWrapDefaultTable: false,
        ShowDefaultTable: false
      }
    },
    components:{
      DefaultTable
    },
    methods: {
      Experiment(status){
          this.modellingRezult= {
            data: [],
          }
        this.$emit('ChangeExperimentStatus', {status})
      },
      async StartModelling(){
        this.$showLoad(true);
        this.modellingRezult.data = await this.$FetchGet("/api/v1/route", true, "Расчёт Route окончен") || []
        this.ShootingData = []
        this.$showLoad(false);
      },
      async GetRezultGordeev(){
        this.modellingRezult.data = await this.$FetchGet("/api/v1/route/all") || []
        this.ShootingData = []
      },
      ShowRezult(){
        this.dataTable = []
        this.dataLableName = [
          {lable: "Цель", nameParam: "targetName"},
          {lable: "КА", nameParam: "nodeName"},
          {lable: "Начало видимости", nameParam: "zoneVisio"},
          {lable: "Окончание видимости", nameParam: "id"},
          {lable: "Разворот", nameParam: "transition"},
          {lable: "Начало съёмки", nameParam: "id"},
          {lable: "Окончаниие съёмки", nameParam: "id"},
          {lable: "Тангаж", nameParam: "pitch"},
          {lable: "Крен", nameParam: "roll"}
        ]
        let dataT = this.modellingRezult.data
        for (let index = 0; index < dataT.length; index++) {
          const element = dataT[index];
          element.roll = Math.floor(element.deltaB*1000)/1000
          element.pitch = Math.floor(element.deltaL*1000)/1000
          element.targetName = element.namePoint
          element.nodeName = element.rootSatellite
          element.transition = 0
          this.dataTable.push(element) 
        }
        this.ShowDefaultTable = true
      }
    },
    async mounted(){
      this.GetRezultGordeev()

    }
  }
  </script>


<style lang="scss" scoped>
.LIghtPoint{

  div{
    position: absolute;
    width: 10px;
    height: 10px;
    top: 20%;
    left: 10px;
    border-radius: 20px;

    &.approved{
      background-color: rgb(0, 139, 0);
      box-shadow: 0px 0px 5px rgb(11, 167, 11);
    }
    &.Notapproved{
      background-color: red;
      box-shadow: 0px 0px 5px #fe1a1a;
    }
  }


}
</style>