import './style.css';

import App from './app/';
import Api from './app/api';
import Dom from './app/dom';

// import Module from './app/module';

export class Blade{
  constructor(viewName){

    this.viewName = viewName;
    window.blade = {};
    window.blade.temp = {};
    window.blade.view = {};
    window.blade.route = [];
    window.blade.data = {};
    window.blade.elements = {};
    window.blade.events = {};
    window.blade.module = {};
    window.blade.switch;
    window.blade.nodes = {};
    window.blade.module = viewName
    window.blade.view[window.blade.module] = {};

  }

  view(template){
      window.blade.view[this.viewName].template = template;
  }

  data(state){
    window.blade.data = state;
  }

  controller(func){
    window.blade.view[this.viewName].controller = func;
  }

  component(){

  }

  service(){

  }

  updateData(data){
    window.blade.data = Object.assign({}, window.blade.data, data);

    let domparser = new DOMParser();
    const root = document.querySelector('#root').innerHTML
    var htmlObject = domparser.parseFromString(root, 'text/html').querySelector('body').innerHTML;
    const app = new Dom(this.viewName);
    const htmlContent = app.virtualDom(window.blade.view[this.viewName].template);
    // console.log(htmlContent)
    window.blade.view[this.viewName].vDomNew = htmlContent;
    const targetElm = document.querySelector('#root');
    app.updateDom(targetElm, window.blade.view[this.viewName].vDomNew[0], window.blade.view[this.viewName].vDomPure[0]);

  }

  event(name, func){
    window.blade.events[name] = func;
  }

  render(target){

    console.log(target)

    const $event = {
      on: (name, func) => this.event(name, func)
    }
    const $data = data => this.updateData(data);

    var template = window.blade.view[this.viewName].template;
    const app = new Dom(this.viewName);
    const htmlContent = app.virtualDom(template);

    window.blade.view[this.viewName].vDomPure = htmlContent;

    let domparser = new DOMParser();
    var htmlObject = domparser.parseFromString(template, 'text/html').querySelector('body');
    const targetElm = document.querySelector(target);

    app.updateDom(targetElm, htmlContent[0]);
    window.blade.view[this.viewName].oldDom = domparser.parseFromString(template, 'text/html').querySelector('body');

    const parms = {
      $data: $data,
      $event: $event
    }

    var controller = window.blade.view[this.viewName].controller
    let extScript = () => {eval(controller(parms))}
    let event = new Event('executeScript');
    window.addEventListener('executeScript', extScript)
    window.dispatchEvent(event)
    window.removeEventListener('executeScript', extScript);

  }



  route(route, view){

    var obj = {
      [route]: view,
    }

    window.blade.route.push(obj)

  }

}
