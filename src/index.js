import './style.css';

import App from './app/';
import Api from './app/api';
import Dom from './app/dom';

// import Module from './app/module';
// Replace SetTimeout with requestAnimationFrame

export class Blade{
  constructor(viewName){

    this.module = class{
      constructor(viewName, data = null){


        // if(data){
        //   console.log(data.view());
        //   console.log(data.data());
        //   console.log(data.controller);
        // }

        this.viewName = viewName;
        window.blade.module = viewName;
        window.blade.view[this.viewName] = {};
        this.targetElement;

        window.blade.view[this.viewName].template = data.view();

        window.blade.view[this.viewName].data = data.data();

        window.blade.view[this.viewName].controller = data.controller;

      }

      // view(template){
      //     window.blade.view[this.viewName].template = template;
      // }
      //
      // data(state){
      //   window.blade.view[this.viewName].data = state;
      // }
      //
      // controller(func){
      //   window.blade.view[this.viewName].controller = func;
      // }

      updateData(data, target){
        console.log('======= updateData ======')
        // window.blade.view[target].data = Object.assign({}, window.blade.view[target].data, data, obj);
        window.blade.view[target].data = Object.assign({}, window.blade.view[target].data, data);
        // console.log(window.blade.view[target].data)

        let domparser = new DOMParser();
        const root = document.querySelector(window.blade.view[target].root).innerHTML;
        var htmlObject = domparser.parseFromString(root, 'text/html').querySelector('body').innerHTML;
        const app = new Dom(target);

        const htmlContent = app.virtualDom(window.blade.view[target].template);


        window.blade.view[target].vDomNew = htmlContent;
        const targetElm = document.querySelector(window.blade.view[target].root);

        app.updateDom(targetElm, window.blade.view[target].vDomNew[0], window.blade.view[target].vDomPure[0]);

        window.blade.view[target].vDomPure = window.blade.view[target].vDomNew;

        // console.log(window.blade.view[target].vDomPure)

      }

      event(name, func){
        window.blade.events[name] = func;
      }

      render(target){

        window.blade.view[this.viewName].root = target;



        console.log(window.blade.view[this.viewName].template)

        console.log(window.blade.view[this.viewName].data)

        console.log(window.blade.view[this.viewName].controller)


        const $event = {
          on: (name, func) => this.event(name, func)
        }

        //Overhaul with setter and getter

        const updateData = this.updateData
        const viewName = this.viewName

        window.blade.view[this.viewName].targetData = {}

        // const $test = new Proxy(window.blade.view[this.viewName].targetData, {
        //
        //   get: function(target, prop, receiver){
        //     return window.blade.view[window.blade.module].data[prop];
        //   },
        //
        //   set: function(target, prop, value){
        //     window.blade.view[window.blade.module].data[prop] = value;
        //     console.log(value)
        //     console.log(window.blade.module)
        //     updateData(value, window.blade.module);
        //   }
        // })

        var dataPathStr = '';
        var dataPathArray = [];


        var trueTypeOf = function (obj) {
        	return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
        };


        function wrap(o, fn, scope = []){
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

              // console.log('+++++++++')
              // console.log(obj)
              // console.log('+++++++++')

              updateData(obj, window.blade.module);

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


        const $data = wrap(window.blade.view[this.viewName].data, console.log)

        // const handler = {
        //   get: function(target, key, scope = []){
        //     if(typeof target[key] === 'object' && target[key] !== null){
        //       return new Proxy(target[key], handler)
        //     }else{
        //       return target[key];
        //     }
        //   },
        //
        //   set: function(target, key, value){
        //     return true;
        //     // updateData(window.blade.view[this.viewName].data, window.blade.module);
        //   }
        // }




        // const $data = new Proxy(window.blade.view[this.viewName].data, handler)


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
    window.blade.hiddenElements = [];
    window.blade.forLoop = [];
    // window.blade.module = viewName
    // window.blade.view[window.blade.module] = {};

  }

  service(){

  }

}
