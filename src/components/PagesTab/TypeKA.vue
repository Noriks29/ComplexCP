<template>
  <div class="main_contain RowSection">
      <div>
          <button class="ToMenuButtonDiv" @click="SelectComponent('TemplateComponent')">
            <img src="../../assets/exit.svg">
          </button>
        </div>
      <div class="ContentDiv">
          <div class="Panel Select LeftPanel" >
              <div style="display: flex; align-items: center;">
                <label for="">Выбор КА</label>
                <SelectDiv :dataOption="KatypeList" :valueS="SelectKA" style="flex: 1;"  @valueSelect="ChangeKA"/>
              </div>
          </div>
          <div class="Panel RightPanel">
          <div>
              <div class="TableDiv" style="max-height: 60vh;">
                  <table class="TableDefault" @change="ChangeParamKa">
                    <tbody v-if="SelectKA.select == undefined">
                      <tr><th colspan="3">Параметры разворота</th></tr>
                          <tr><td>Ускорение / замедление КА</td><td><input type="number" v-model="SelectKA.value.operatingParameter.acceleration"></td><td>гр/с<sup>2</sup></td></tr>
                          <tr><td>Максимальная скорость вращения КА</td><td><input type="number" v-model="SelectKA.value.operatingParameter.maxRotationSpeed"></td><td>гр/с</td></tr>
                          <tr><td>Время стабилизации</td><td><input type="number" v-model="SelectKA.value.operatingParameter.stabilizationTime"></td><td>с</td></tr>
                      <tr><th colspan="3">Скорость передачи данных</th></tr>
                          <tr><td>Скорость передачи данных КА - КА</td><td><input type="number" v-model="SelectKA.value.operatingParameter.dataTransferSatSat"></td><td>Мб/с</td></tr>
                          <tr><td>Скорость передачи данных КА - НП</td><td><input type="number" v-model="SelectKA.value.operatingParameter.dataTransferEarthSat"></td><td>Мб/с</td></tr>
                      <tr><th colspan="3">Максимальные углы съемки</th></tr>
                          <tr><td>Крен</td><td><input type="number" v-model="SelectKA.value.operatingParameter.lurch"></td><td>Гр.</td></tr>
                          <tr><td>Тангаж</td><td><input type="number" v-model="SelectKA.value.operatingParameter.pitch"></td><td>Гр.</td></tr>
                      <tr><th colspan="3">Солнечные панели</th></tr>
                          <tr><td>Генерируемая мощность при ориентации на Солнце</td><td><input type="number" v-model="SelectKA.value.operatingParameter.maxPowerGenerated"></td><td>Вт/м<sup>2</sup></td></tr>
                          <tr><td>Средняя генерируемая мощность</td><td><input type="number" v-model="SelectKA.value.operatingParameter.averagePowerGenerates"></td><td>Вт/м<sup>2</sup></td></tr>
                          <tr><td>Площадь солнечных панелей</td><td><input type="number" v-model="SelectKA.value.operatingParameter.squareSolarPanels"></td><td>м<sup>2</sup></td></tr>
                          <tr><td>КПД солнечных панелей</td><td><input type="number" v-model="SelectKA.value.operatingParameter.efficiencySolarPanels"></td><td>%</td></tr>                     
                      <tr><th colspan="3">Аккумуляторная батарея</th></tr>
                          <tr><td>Емкость</td><td><input type="number" v-model="SelectKA.value.operatingParameter.accCapacity"></td><td>А-ч</td></tr>
                          <tr><td>Напряжение</td><td><input type="number" v-model="SelectKA.value.operatingParameter.voltage"></td><td>В</td></tr>
                          <tr><td>Порог минимального разряда</td><td><input type="number" v-model="SelectKA.value.operatingParameter.minCharge"></td><td>%</td></tr>
                      <tr><th colspan="3">Электромагниты</th></tr>
                          <tr><td>Максимальная потребляемая мощность</td><td><input type="number" v-model="SelectKA.value.operatingParameter.maxPowerOfElectromagnet"></td><td>Вт-ч</td></tr>
                          <tr><td>Максимальный создаваемый магнитный момент</td><td><input type="number" v-model="SelectKA.value.operatingParameter.maxMagneticMoment"></td><td>А·м<sup>2</sup></td></tr>
                      <tr><th colspan="3">Маховики</th></tr>
                          <tr><td>Максимальный управляющий момент маховика</td><td><input type="number" v-model="SelectKA.value.operatingParameter.maxControlMomentOfWheels"></td><td>Н·м</td></tr>
                          <tr><td>Максимальный момент инерции маховика</td><td><input type="number" v-model="SelectKA.value.operatingParameter.maxInertiaMomentOfWheels"></td><td>Н·м·с</td></tr>
                          <tr><td>Момент инерции ротора маховика (не активно)</td>
                          <td><input type="number" :value="0"></td><td>кг·м<sup>2</sup></td></tr>     
                      <tr><th colspan="3">Память</th></tr>
                          <tr><td>Объем памяти КА</td><td><input type="number" v-model="SelectKA.value.operatingParameter.memory"></td><td>ГБ</td></tr>
                        <tr><td>Объем заявки</td><td><input type="number" v-model="SelectKA.value.operatingParameter.shootingDataVolume"></td><td>ГБ</td></tr>
                      <tr><th colspan="3">Сенсоры</th></tr>
                          <tr><td>typeSensor</td><td><input type="number" v-model="SelectKA.value.operatingParameter.typeSensor"></td><td>??</td></tr>
                          <tr><td>Продолжительность сьёмки</td><td><input type="number" v-model="SelectKA.value.operatingParameter.durationShooting"></td><td>сек.</td></tr>
                  </tbody></table>
              </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import SelectDiv from '../SelectDiv.vue';
import { PagesSettings } from './PagesSettings.js';

export default {
  name: 'KAInfo',
  mixins: [PagesSettings],
  data(){
      return{
          dataJson: [],
          KatypeList: [],
          SelectKA: {
            select: false,
            value:{
                description: ""
            },
          }
      }
  },
  components:{
      SelectDiv
  },
  methods:{
      async ChangeKA(data){
          if(data.value == "add"){
            await this.$FetchGet("/api/v1/modelsat/add")
            this.ReFerchKA(undefined)
          }
          else{
            this.SelectKA = {lable: data.value.modelName, value: data.value}
            this.SelectKA.value.devCatalogs.forEach(device => {
              device.use = 0;
              this.SelectKA.value.devices.forEach(deviceUse => {
                if(deviceUse.devCatalog.id == device.id) device.use = 1
              })
            })
            alert("Ошибка построения зарядов")
          }
      },
      async ChangeParamKa(){
        await this.$FetchPost("/api/v1/modelsat/update/parameters", this.SelectKA.value.operatingParameter)
      },
      async ReFerchKA(index){
        let result = await this.$FetchGet('/api/v1/modelsat/all')
        this.KatypeList = []
        result.forEach(element => {this.KatypeList.push({lable: element.modelName, value: element})})
        this.KatypeList.push({lable:"Добавить модель", value: "add"})
        if(index != undefined){
          this.KatypeList.forEach(KA => {if(KA.value.id == index) this.SelectKA = KA})
        }
        else{this.SelectKA = this.KatypeList[0]}
        
        this.SelectKA.value.devCatalogs.forEach(device => {
              device.use = 0;
              this.SelectKA.value.devices.forEach(deviceUse => {
                if(deviceUse.devCatalog.id == device.id)
                  device.use = 1
              })
            })
      },
  },
  mounted(){
    this.ReFerchKA(undefined)
  }
}
</script>

<style lang="scss" scoped>
  .Panel{
      .ButtonCommand{
        &.SelectPage{
            background-color: #80808053;
        }
      }
      &.Select{
        text-align: left;
      }
  }
#TableChargeKA{
  .null{
    background-color: #ff000063;
  }
}

</style>


  
