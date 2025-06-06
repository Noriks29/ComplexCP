import { adress  } from "./config_server";
const ShowFetchData = true


async function FetchPostFile(http,formData){
    //DisplayLoad(true)
    if(ShowFetchData) console.log(formData)
    let AcsessKey = localStorage.data
    let add = adress
    
    try {
        const response = await fetch('http://'+add+http+'?accessKey='+AcsessKey,{
          method:  'POST',
          mode: 'cors',
          body: formData
        })
        if (!response.ok) {
            let rezult = await response.json()
            if(ShowFetchData) console.log(http,rezult)
            throw new Error(rezult.MESSAGE);
        }
        else{
            let rezult = await response.json()
            if(ShowFetchData) console.log(http, rezult)
            //DisplayLoad(false)
            return rezult;
        }
        } catch (error) {
            console.log('Error save:', error);
            //DisplayLoad(false)
            return undefined;
        }

}


export{
    FetchPostFile
}