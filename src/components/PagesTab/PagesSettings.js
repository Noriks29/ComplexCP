import {UnixToDtime} from "../../js/WorkWithDTime.js";
let PagesSettings = {
    props:{
        systemStatus:{
            type: Object
        },
        modellingStatus:{
            type: Boolean
        }
    },
    methods: {
        SelectComponent(nameComponent) {
          this.$emit('updateParentComponent', {
              nameComponent: nameComponent
          })
        },
        CreateDateTime(time, mode = 0){
            if(mode == 2){
              let Dtime = UnixToDtime(time-10800)
              return Dtime.date + " " + Dtime.time
            }
            let Dtime = UnixToDtime(time) 
            return Dtime.date + " " + Dtime.time
          },
    }
}

export {
    PagesSettings
} 