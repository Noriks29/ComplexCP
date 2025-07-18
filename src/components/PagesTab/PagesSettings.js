
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
    },
    created(){
        document.addEventListener('keydown', (event) => {
            if (event.code == 'Escape') {
                this.SelectComponent('TemplateComponent')
            }
          });
    }
}

export {
    PagesSettings
} 