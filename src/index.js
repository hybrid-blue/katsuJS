import './style.css';

import App from './app/';
import Api from './app/api';
import Dom from './app/dom';

// import Module from './app/module';

export class Blade{
  constructor(viewName){

    this.module = class{
      constructor(viewName){
        this.viewName = viewName;
        window.blade.module = viewName;
        window.blade.view[this.viewName] = {};
        this.targetElement;
      }

      view(template){
          window.blade.view[this.viewName].template = template;
      }

      data(state){
        window.blade.view[this.viewName].data = state;
      }

      controller(func){
        window.blade.view[this.viewName].controller = func;
      }

      updateData(data, target){
        window.blade.view[target].data = Object.assign({}, window.blade.view[target].data, data);
        let domparser = new DOMParser();
        const root = document.querySelector(this.targetElement).innerHTML
        var htmlObject = domparser.parseFromString(root, 'text/html').querySelector('body').innerHTML;
        const app = new Dom(target);
        const htmlContent = app.virtualDom(window.blade.view[target].template);
        window.blade.view[target].vDomNew = htmlContent;
        const targetElm = document.querySelector(this.targetElement);
        app.updateDom(targetElm, window.blade.view[target].vDomNew[0], window.blade.view[target].vDomPure[0]);

      }

      event(name, func){
        window.blade.events[name] = func;
      }

      render(target){

        this.targetElement = target;

        const $event = {
          on: (name, func) => this.event(name, func)
        }
        const $data = data => this.updateData(data, this.viewName);

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

      // renderChildComponent(componentName){
      //   const $event = {
      //
      //     on: (name, func) => this.event(name, func)
      //   }
      //   const $data = data => this.updateData(data, componentName);
      //
      //   var template = window.blade.component[componentName].template;
      //   console.log('==== 1 ====')
      //   console.log(template);
      //
      //   const app = new Dom(componentName);
      //   const htmlContent = app.virtualDom(template);
      //
      //   window.blade.component[componentName].vDomPure = htmlContent;
      //
      //   let domparser = new DOMParser();
      //   var htmlObject = domparser.parseFromString(template, 'text/html').querySelector('body');
      //
      //   const targetElm = document.querySelector(componentName);
      //
      //   app.updateDom(targetElm, htmlContent[0]);
      //   window.blade.component[componentName].oldDom = domparser.parseFromString(template, 'text/html').querySelector('body');
      //
      //   const parms = {
      //     $data: $data,
      //     $event: $event
      //   }
      //
      //   var controller = window.blade.component[componentName].controller;
      //   if(controller){
      //     let extScript = () => {eval(controller(parms))}
      //     let event = new Event('executeScript');
      //     window.addEventListener('executeScript', extScript)
      //     window.dispatchEvent(event)
      //     window.removeEventListener('executeScript', extScript);
      //   }
      //
      // }
      //
      // renderComponent(){
      //   window.blade.component[this.viewName] = {
      //     template: window.blade.view[this.viewName].template,
      //     data: window.blade.view[this.viewName].data,
      //     controller: window.blade.view[this.viewName].controller,
      //     // rendered: false
      //   };
      // }

    }

    // this.viewName = viewName;
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
    window.blade.controller = {};
    window.blade.component = {};
    // window.blade.module = viewName
    // window.blade.view[window.blade.module] = {};

  }

  service(){

  }

}
