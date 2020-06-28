import './style.css';

import App from './app/';
import Api from './app/api';
import Dom from './app/dom';

export default class Blade{
  constructor(viewName){

    this.viewName;
    this.targetElement;

    window.blade = {};
    window.blade.temp = {};
    window.blade.view = {};
    window.blade.route = [];
    window.blade.data = {};
    window.blade.elements = {};
    window.blade.events = {};
    window.blade.emit = {};
    window.blade.module = {};
    window.blade.switch;
    window.blade.nodes = {};
    window.blade.controller = {};
    window.blade.component = {};
    window.blade.hiddenElements = [];
    window.blade.forLoop = [];
    window.blade.store = {};

  }

  module(data, options){

      const mod = new data();

      this.viewName = data.name;

      window.blade.view[this.viewName] = {};

      window.blade.view[this.viewName].template = mod.view();

      mod.data ? window.blade.view[this.viewName].data = mod.data() : window.blade.view[this.viewName].data = {};

      mod.controller ? window.blade.view[this.viewName].controller = mod.controller  : window.blade.view[this.viewName].controller = null;

      options ? window.blade.view[this.viewName].options = options : window.blade.view[this.viewName].options = null;


  }

  state(e){
    if(typeof e === 'object'){
      window.blade.store = e;
    }else{
      return window.blade.store;
    }
  }

  updateData(data, target, child, type = 'data'){

    if(type === 'data'){
      window.blade.view[target].data = Object.assign({}, window.blade.view[target].data, data);
    }else{
      this.state = Object.assign({}, this.state, data);
    }

    let domparser = new DOMParser();

    const root = child ? document.querySelector(`[data-blade-component="${target}"]`).innerHTML : document.querySelector(window.blade.view[target].root).innerHTML;

    var htmlObject = domparser.parseFromString(root, 'text/html').querySelector('body').innerHTML;

    const app = new Dom(target);

    const htmlContent = app.virtualDom(window.blade.view[target].template);

    window.blade.view[target].vDomNew = htmlContent;

    const targetElm = child ? document.querySelector(`[data-blade-component="${target}"]`) : document.querySelector(window.blade.view[target].root);

    app.updateDom(targetElm, window.blade.view[target].vDomNew[0], window.blade.view[target].vDomPure[0]);

    window.blade.view[target].vDomPure = window.blade.view[target].vDomNew;

  }


  render(name, target, childComponent = false, parent = null){

    var viewName;

    if(childComponent){
      viewName = target;
      window.blade.view[viewName].parent = parent
    }else{
      viewName = name;
    }

    window.blade.view[viewName].root = target;

    const $event = (selector) => {
      return{
        on: (name, func) => {
          window.blade.view[selector].events[name] = func;
        },
        receive: (name, func) => {
          window.blade.view[selector].emit[name] = func;
        }
      }

    }

    const $emit = (selector) => {
      return{
        send: (data) => {
          let views = window.blade.view
          var parent = window.blade.view[selector].parent
          console.log(window.blade.view[selector])
          let func = window.blade.view[parent].emit[selector];
          func(data);

        }
      }

    }


    // Service Proxy
    const serviceHandler = {
      get(target, prop, receiver) {
        return target[prop]
      }
    }

    const $service = (selector) => {
      return new Proxy(window.blade.view[selector].service, serviceHandler)
    }


    //Overhaul with setter and getter

    const updateData = this.updateData

    window.blade.view[viewName].targetData = {};
    window.blade.view[viewName].events = {};
    window.blade.view[viewName].emit = {};
    window.blade.view[viewName].service = {};

    var dataPathStr = '';
    var dataPathArray = [];


    var trueTypeOf = function (obj) {
      return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    };


    function wrap(o, type, fn, scope = []){

      const handler = {
        get(target, prop, receiver) {
          // fn('get value in scope: ', scope.concat(prop))

          if (['object', 'array'].indexOf(trueTypeOf(target[prop])) > -1) {
            return new Proxy(target[prop], handler);
          }

          return target[prop]
        },
        set(target, prop, value, receiver) {
          // fn('set value in scope: ', scope.concat(prop))
          target[prop] = value
          // console.log(value)

          var obj = {};
          let pathArray = scope.concat(prop);

          if(pathArray.length > 1){
            for(let i=0;i<pathArray.length;i++){
              if(i === (pathArray.length - 1)){
                let thisObj = {}
                thisObj[pathArray[(i)]] = value;
                obj[pathArray[(i - 1)]] = thisObj;
              }else if(i === 0){
                obj[pathArray[i]] = {}
              }else{
                obj[pathArray[(i - 1)]] = {}
              }
            }
          }else{
            obj[pathArray[0]] = value
          }

          updateData(obj, viewName, childComponent, type);

          return true
        },
        // ownKeys() {
        //   fn('keys in scope: ', scope)
        //   return Reflect.ownKeys(o)
        // }
      }

      return new Proxy(
        Object.keys(o).reduce((result, key) => {
          if (isObject(o[key])) {
            result[key] = wrap(o[key], fn, scope.concat(key))
          } else {
            result[key] = o[key]
          }
          return result
        }, {}),
        handler
      )

    }

    function isObject(obj) {
      return typeof obj === 'object' && !Array.isArray(obj)
    }

    var $data, $state;

    if(window.blade.store) $state = wrap(window.blade.store, 'state', console.log)
    if(window.blade.view[viewName].data) $data = wrap(window.blade.view[viewName].data, 'data', console.log)

    // Set params

    const params = {
      $data: $data,
      $event: $event(viewName),
      $emit: $emit(viewName),
      $service: $service(viewName),
      $state: $state
    }

    if(window.blade.view[viewName].options && window.blade.view[viewName].options.length > 0){
      const options = window.blade.view[viewName].options;

      window.blade.view[viewName].components = []

      for(let i = 0;i<options.length;i++){

        let mod = new options[i]();


        try{

          if(mod.view){

            window.blade.view[options[i].name] = {};

            window.blade.view[options[i].name].template = mod.view();

            if(mod.data){

              let props = {};

              let componentElm = document.querySelectorAll(`[data-blade-component="${options[i].name}"]`)[0];

              console.log(componentElm)

              let attrProps = componentElm.getAttribute('props');

              props[attrProps] = window.blade.view[viewName].data[attrProps];

              mod.data ? window.blade.view[options[i].name].data = mod.data(props) : window.blade.view[options[i].name].data = null;
            }

            mod.controller ? window.blade.view[options[i].name].controller = mod.controller  : window.blade.view[options[i].name].controller = null;

            window.blade.view[viewName].components.push(options[i].name)

          }else{

            throw(options[i].name)

          }

        }
        catch(err){
          if(mod.service){
            window.blade.view[viewName].service[options[i].name] = mod.service();
          }else{
            console.error(`Class ${err} is not a valid block`)
            return false;
          }

        }

      }

    }


    // Generate View
    var template = window.blade.view[viewName].template;
    const app = new Dom(viewName);
    const htmlContent = app.virtualDom(template);

    window.blade.view[viewName].vDomPure = htmlContent;

    let domparser = new DOMParser();
    var htmlObject = domparser.parseFromString(template, 'text/html').querySelector('body');

    const targetElm = document.querySelector(target) || document.querySelectorAll(`[data-blade-component="${viewName}"]`)[0];

    app.updateDom(targetElm, htmlContent[0]);

    window.blade.view[viewName].oldDom = domparser.parseFromString(template, 'text/html').querySelector('body');


    // Apply Controller
    var controller = window.blade.view[viewName].controller;

    if(controller){
      let extScript = () => {eval(controller(params))}
      let event = new Event('executeScript');
      window.addEventListener('executeScript', extScript)
      window.dispatchEvent(event)
      window.removeEventListener('executeScript', extScript);
    }

    // Render Child Components
    if(window.blade.view[viewName].components.length > 0) this.render(options[i].name, options[i].name, true, viewName)


  }

}
