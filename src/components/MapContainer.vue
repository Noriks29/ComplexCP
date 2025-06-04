<template>
  <div class="MapContain">
   <div id="DrawKARoad">
            <div class="LatLng"><span>Точка: {{ LastLatLng.lat+', '+LastLatLng.lng }}</span><button @click="CopyLatLng"><img src="@/assets/copy.png" alt="Копировать"></button></div>
            <SelectDiv  :dataOption="KAArray" :valueS="KatoDraw" :id="'KA'+String(0)" @valueSelect="ChangeKaDraw"/>
            <input type="color" id="inputColorKa" value="#5900ff"><button class="ButtonCommand" @click="GetKARoad">Отрисовать маршрут</button>
            <button class="ButtonCommand" @click="ReloadMapContainer">Обновить карту</button>
          </div>
          <div id="map"></div>
    </div>
</template>

<script>
import { NPList, OGList } from '@/js/GlobalData';
import SelectDiv from './SelectDiv.vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';


export default {
  name: 'MapContain',

  data(){
      return{
        map: {},
        KatoDraw: {},
        KAArray: [],
        LastLatLng: {lat: 0, lng:0},
        requestJson: []
    }
  },
  components:{
      SelectDiv,
  },
  methods: {
      async CreateMap(){
          this.map = {}
          console.log(await document.getElementById("map"))
          this.map = L.map('map', {zoomAnimation: true}).setView(new L.LatLng(55, 60), 3);
          L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', 
          {
            minZoom: 1, 
            maxZoom: 5,
            attribution: ''
          }).addTo(this.map);
          let DefaultIcon = new L.icon({
                iconUrl: icon,
                shadowUrl: shadow,
                iconRetinaUrl: icon2x
          });
          L.Marker.prototype.options.icon = DefaultIcon;
          for (let i = 0; i < this.requestJson.length; i++) {
              const element = this.requestJson[i].catalog;
              L.circle([element.lat, element.lon], 21000, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.4
              }).addTo(this.map)
          }
          console.log(NPList)
          NPList.forEach(element => {
              L.circle([element.latitude, element.longitude], 30000, {
                color: 'green',
                fillColor: '#121100',
                fillOpacity: 0.4
              }).addTo(this.map)
          });
          this.map.on('click', (e) => {
              const { lat, lng } = e.latlng;
              this.LastLatLng = {lat: lat.toFixed(2), lng: lng.toFixed(2)}
              console.log(`Широта: ${lat}, Долгота: ${lng}`);
          });

        },
        ChangeKaDraw(e){
          this.KatoDraw = e.value
        },
        CopyLatLng(){
          console.log(this.LastLatLng, typeof this.LastLatLng)
          navigator.clipboard.writeText(JSON.stringify(this.LastLatLng))
          alert("Скопировано")
        },
        async GetKARoad(){
          this.$showLoad(true);
          let color = document.getElementById("inputColorKa")
          let colors = ['#ff0000','#00ff00','#0000ff','#ffff00','#00ffff','#990000','#009900','#999900','#000099','#ffcc00','#00ffcc','#cc0000','#00cc00','#cccc00','#0000cc','#ee0000','#00ee00','#eeee00','#00eeee','#aaaa00']
          if (this.KatoDraw.value == null) {
            let roads = await this.$FetchGet("/api/v1/pro42/gps/all") || []
            let colorid = 0
            roads.forEach(road => {
              let arrayPoint = [[]]
              let line_index = 0
              for (let index = 0; index < road.coordinates.length; index+=1) {
                const element = road.coordinates[index];
                if (arrayPoint[line_index].length > 0) {
                  if(arrayPoint[line_index][arrayPoint[line_index].length-1].lng * element.longitude < -1000){
                    line_index++
                    arrayPoint.push([])
                  }
                }
                arrayPoint[line_index].push({lat: element.latitude, lng: element.longitude})
              }
              arrayPoint.forEach(dataRoad => {
                L.polyline(dataRoad, {color: colors[colorid] + "d4", weight: 2}).addTo(this.map);
              })
              colorid++
            });

          }
          else{
            let road = await this.$FetchPost("/api/v1/pro42/gps/sat", {}, "satelliteId="+this.KatoDraw.satelliteId) || []
            let arrayPoint = [[]]
            let line_index = 0
            for (let index = 0; index < road.length; index+=1) {
              const element = road[index];
              if (arrayPoint[line_index].length > 0) {
                  if(arrayPoint[line_index][arrayPoint[line_index].length-1].lng * element.longitude < -1000){
                    line_index++
                    arrayPoint.push([])
                  }
                }
              arrayPoint[line_index].push({lat: element.latitude, lng: element.longitude})
            }
            L.polyline(arrayPoint, {color: color.value + "d4", weight: 2}).addTo(this.map);
          }
          this.$showLoad(false);
        },
        ReloadMapContainer(){
          this.map.off();
          this.map.remove();
          this.CreateMap()
        }

    },
    async mounted() {
      this.KAArray.push({value: null, lable: "Все КА" })
      OGList.forEach(OG => {
        OG.satellites.forEach(element =>{
          this.KAArray.push({value: element, lable: OG.constellationName + "-" + element.name })
        })
      });
      this.KatoDraw = this.KAArray[0]
      this.requestJson = await this.$FetchGet('/api/v1/satrequest/request/get/all') || []
      this.CreateMap()
    },
}

</script>

<style lang="scss" scoped>
.MapContain{
  position: relative;
  flex: 1;
}

#DrawKARoad{
  position: absolute;
  right: 0;
  top: 5px;
  z-index: 1;
  display: flex;
  align-items: center;
  padding: 5px 20px;

  #inputColorKa{
  height: 50px;
  width: 100px;
  padding: 0px;
  margin: 5px;
  }
  .ButtonCommand{
    margin: 5px;
  }
}
#map{
  background-color: var(--color-bg-panel);
  position: relative;
  outline-style: none;
  height: calc(100% - 20px);
  margin: 10px;
  z-index: 0;
  .leaflet-map-pane{
            pointer-events: none;
        }
  .leaflet-bottom {
    &.leaflet-right{
      display: none;
    }
  }
}
.LatLng{
    display: flex;
    align-items: center;
    background-color: var(--background-Button1);
    padding: 5px;
    border-radius: 10px;
    margin-right: 5px;
    span{
      white-space: nowrap;
      color: var(--color-Main);
    }
    button{
      border: none;
      background: none;
    }
}
</style>
