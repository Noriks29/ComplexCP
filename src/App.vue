
<template>
    <AlertToast /><LoadProcess />
    <div id="backgroundDiv"></div>
    <div class="headerSelectMode" :class="login !== undefined && systemStatus.typeWorkplace == -1 ? 'show' : ''">
      <div v-for="data, index in workplaceList" :key="index"
        class="SelectMode"
      ><button class="ButtonSelectMode" :class="systemStatus.typeWorkplace == data.type ? 'active' : ''" @click="ChangetypeWorkplace(data.type)">{{ data.name }}</button></div>
    </div>
    <div class="idSesion" :class="login !== undefined ? systemStatus.typeWorkplace !== -1?'show WokspaceSelect':'show':''">
        <div class="ModuleTitle" :class="titleModule==''?'hide':''">{{ titleModule }}</div>
        <div class="flexdiv" >login: {{ login }} {{ SystemObject }}
          <button class="Menubutton"  :class="systemStatus.typeWorkplace !== -1 ? 'show' : ''" @click="ChangetypeWorkplace(-1)"><svg enable-background="new 0 0 32 32" id="Editable-line" version="1.1" viewBox="0 0 32 32" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><circle cx="5" cy="6" fill="none" id="XMLID_303_" r="1" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/><circle cx="5" cy="16" fill="none" id="XMLID_305_" r="1" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/><circle cx="5" cy="26" fill="none" id="XMLID_304_" r="1" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/><line fill="none" id="XMLID_29_" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" x1="10" x2="28" y1="6" y2="6"/><line fill="none" id="XMLID_30_" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" x1="10" x2="28" y1="16" y2="16"/><line fill="none" id="XMLID_31_" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" x1="10" x2="28" y1="26" y2="26"/></svg></button>
          <button class="logoutbutton"  @click="Log_out">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g id="logout"><line class="cls-1" x1="15.92" x2="28.92" y1="16" y2="16"/><path d="M23.93,25v3h-16V4h16V7h2V3a1,1,0,0,0-1-1h-18a1,1,0,0,0-1,1V29a1,1,0,0,0,1,1h18a1,1,0,0,0,1-1V25Z"/><line class="cls-1" x1="28.92" x2="24.92" y1="16" y2="20"/><line class="cls-1" x1="28.92" x2="24.92" y1="16" y2="12"/><line class="cls-1" x1="24.92" x2="24.92" y1="8.09" y2="6.09"/><line class="cls-1" x1="24.92" x2="24.92" y1="26" y2="24"/></g></svg>
            Выйти</button>
        </div>
      </div>
    
    <div :class="login == undefined ? 'show' : ''" class="ModalLoginBack PanelMenu2">
      <div class="ModalLoginPanel">
        <h1>Вход в систему</h1>
        <div class="ModalLoginForm">
          <div>
            <label for="login">Логин: </label>
            <input type="text" id="login" class="inputType1" placeholder="Введите логин...">
          </div>
          <div>
            <label for="password">Пароль: </label>
            <input type="password" id="password" class="inputType1" placeholder="Введите пароль...">
          </div>
          <div class="FormSubmit">
            <button @click="StartLogin" class="ButtonCommand login">Войти <img src="./assets/arrow2.png" alt=""></button>
          </div>
        </div>
      </div>
    </div>
    <TemplateComponent v-if="systemStatus.typeWorkplace != -1" @reload="ReloadTemplate"/>
    <div class="ChangeViewMode" @click="ChangeColor"><svg fill="none" height="24" stroke-width="1.5" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 12L23 12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 2V1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 23V22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 20L19 19" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 4L19 5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 20L5 19" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 4L5 5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 12L2 12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
   
    

</template> 
<script>
import TemplateComponent from './components/TemplateComponent.vue'
import LoadProcess from './components/LoadProcess.vue'
import GlobalStyle from './style/GlobalStyle.scss'
import GlobalElementStyle from '@/style/GlobalElementStyle.scss'
import AlertToast from './components/AlertToast.vue'

import NET from 'vanta/dist/vanta.net.min'
import * as THREE from 'three'

export default {
  name: 'App',
  css:{
    GlobalStyle,
    GlobalElementStyle
  },
  data() {
    return{
      systemStatus: {typeWorkplace: -1},
      titleModule: ' ',
      login: undefined,
      errorLogin: false,
      workplaceList: [],
      SystemObject: null
    }
  },
  methods: {
      StartLogin(){
        const login = document.getElementById('login').value
        const password = document.getElementById('password').value
        let data = {
            "nameUser": login,
            "email": login,
            "password": password
        }     
        this.VerifyWorkSapce(data)
      },
      async VerifyWorkSapce(data){
        this.$showLoad(true);
        this.workplaceList = []
        let result = await this.$FetchPost("/api/v1/authentication/user/login",data,null,false)
        if(result == undefined){
          this.errorLogin = true
          this.$showToast('Неудачная попытка входа','warning', 'Login');
        }
        else if(result.length > 0){
          this.$showToast('Добро пожаловать '+data.nameUser,'success', 'Login');
          result.sort((a,b) => {return a.type - b.type})
          this.workplaceList = result
          this.errorLogin = false
          localStorage.setItem('nameUser', data.nameUser);
          localStorage.setItem('email',  data.email);
          localStorage.setItem('password',  data.password);
          this.login = data.nameUser
        }
        this.$showLoad(false);
      },
      Log_out(){
        localStorage.removeItem('nameUser')
        localStorage.removeItem('data')
        localStorage.removeItem('email')
        localStorage.removeItem('password')
        this.workplaceList = []
        this.login = undefined
        this.systemStatus = {typeWorkplace: -1}
        this.$ClearGlobalData()
      },
      async StartSystem(data){
        this.$ClearGlobalData()
        this.$showLoad(true);
        await localStorage.setItem('data', data.accessKey)
        this.titleModule = data.name
        await this.$InitGlobalData()
        this.systemStatus = this.$SystemObject()
        this.$showLoad(false);
      },
      ChangetypeWorkplace(mode){
        this.titleModule = ''
          this.workplaceList.forEach(workplace => {
            if(workplace.type == mode){
              this.StartSystem(workplace)
              return
            }
          })
          this.systemStatus = {typeWorkplace: -1}
          this.$ClearGlobalData()
      },
      async ReloadTemplate(){
        let tWP = this.systemStatus.typeWorkplace
        this.systemStatus = {typeWorkplace: -1}
        await this.ChangetypeWorkplace(tWP)
      },
      ChangeColor(){
        localStorage.viewMode = Number(!Number(localStorage.viewMode || 0) || 0)
        if (localStorage.viewMode == true) {
          document.getElementById("app").className = "whiteMode";
        }
        else{
          document.getElementById("app").classList.remove("whiteMode");
        }
      }
    },
  async mounted() {
    this.$showLoad(true);
  try {
    NET({
      el: "#backgroundDiv",
      THREE: THREE, // Убедитесь, что THREE правильно импортирован
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 500.00,
      minWidth: 500.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x15eb,       // Цвет точек
      backgroundColor: 0x000000, // Фон (чёрный)
      points: 7.00,
      maxDistance: 27.00,
      spacing: 20.00,
    })
  } catch (error) {
    this.$showToast('Не удалось загрузить фон','warning', 'Фон');
  }
   
    this.workplaceList = []
    if(localStorage.nameUser != undefined && localStorage.email != undefined && localStorage.password != undefined){
      let data = {
            "nameUser": localStorage.nameUser,
            "email": localStorage.email,
            "password": localStorage.password,
      }
      this.VerifyWorkSapce(data)
    }
    localStorage.viewMode = localStorage.viewMode || 0
    try {
      if (localStorage.viewMode == true) {
        document.getElementById("app").className = "whiteMode";
      }
    } catch (error) {
      console.log(error)
    }
    this.$showLoad(false);
  },
  components: {
    TemplateComponent,
    LoadProcess,
    AlertToast
  }
}
</script>

<style lang="scss" scoped>

#backgroundDiv{
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    z-index: 0;
}

  .ModalLoginBack{
    position: relative;
    z-index: 3;
    height: 100vh;
    min-width: 500px;
    max-width: 30vw;
    transform: translate(-100%, 0px);
    transition: all 0.5s ease-in-out;
    border-bottom: none;
    border-top: none;
    &.show{
      transform: translate(0%, 0px);
    }
    .ModalLoginPanel{
      font-size: var(--font-size);
      padding: 20px;
      

      .ModalLoginForm{
        div{
          padding: 10px 5px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          label{
            margin: 5px;
          }
          input{
            padding: 15px;
            width: 90%;
          }
          &.FormSubmit{
            padding: 15px;
            align-items: flex-end;
            button{
              padding-right: 40px;
              img{
                height: 60%;
                position: absolute;
                top: 20%;
                right: 0px;
                bottom: 20%;
              }
            }
          }
        }
      }
    }
  }

.ChangeViewMode{
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  z-index: 10;
  width: 30px;
}


.idSesion{
  color: var(--color-Main);
  position: fixed;
  right: 10px;
  top: 6px;
  transform: translate(0px, -150%);
  transition: all 0.5s ease-in-out;
  width: calc(100% - 20px);
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  overflow: hidden;
  z-index: 2;
  &.show{
    transform: translate(0px, 0%);
  }
  &.WokspaceSelect{
    .flexdiv{
      justify-content: flex-end;
    }
    .ModuleTitle{
      transform: translate(0px, 0px);
      box-shadow: 0px 3px 4px -4px var(--box-shadow-Pabel2);
    }
  }
  .ModuleTitle{
    flex: 1;
    text-align: left;
    border-bottom: 2px solid;
    transform: translate(150%, 0px);
    transition: all 1s ease-out;
    font-size: larger;
    font-weight: bold;
  }
    .flexdiv{
      display: flex;
      align-items: center;
      box-shadow: 0px 3px 4px -4px var(--box-shadow-Pabel2);
      border-bottom: 2px solid;
      .Menubutton{
        background: none;
        border: none;
        position: relative;
        margin: 0px 10px;
        transform: translate(0%, -150%);
        transition: all 0.5s ease-in-out;
        &.show{
          transform: translate(0%, 0px);
        }
        svg{
          width: 30px;
        }
      }
      .logoutbutton{
        position: relative;
        background: none;
        color: var(--color-Main);
        border: none;
        margin: 5px 25px 10px 5px;
        svg{
          width: 25px;
          position: absolute;
          right: -25px;
          top: -3px;
        }
      }
    }
    svg{
      fill: var(--color-Main);
      *{
        stroke: var(--color-Main);
      }
    }
}

.headerSelectMode{
    width: 35%;
    margin-left: 65%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    position: fixed;
    z-index: 1;
    flex-direction: column;
    height: 95vh;
    padding: 5vh 0px 0px;
    transform: translate(100%, 0px);
    transition: all 0.5s ease-in-out;
    &.show{
      transform: translate(0%, 0px);
    }

    .SelectMode{
    flex: 1;
    width: 100%;
    .ButtonSelectMode{
      overflow: hidden;
      position: relative;
      font-size: 20px;
      width: 100%;
      height: 100%;
      border: none;
      background: none;
      color: var(--color-Main);
      pointer-events: all;
      background-color: var(--background-Button1);
      padding: 20px;
      transition: all 0.2s;
      border-bottom: 2px solid var(--background-Button1);
        &:hover{
          background-color: var(--background-Button2);
          border: 2px solid var(--border-button);
          transform: translate(4px, -4px);
          box-shadow: -4px 4px 2px var(--box-shadow-button);
        }
        &:active{
            background-color: var(--background-Button3);
            border: 2px solid var(--border-button2);
            transform: translate(0px, 1px);
            box-shadow: 0px 0px 11px 2px var(--box-shadow-button);
       }

  }
  }
} 
</style>

