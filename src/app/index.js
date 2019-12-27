// import { settings } from './app/settings';

export default class App{

  beforeInit(callback){
    callback();
  }

  onInit(callback){
    callback();
  }

  afterInit(callback){
    callback();
  }

  setData(callback){
    console.log(callback)
  }

  data(callback){
    console.log(callback);
  }

}
