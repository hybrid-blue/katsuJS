import './style.css';

import App from './app/';
import Router from './router';
import { template } from './layout';
import Menu from './app/menu';
import Api from './app/api';
import Dom from './app/dom';

export class Blade extends Api{
  constructor(viewName){
    super();

    this.viewName = viewName;

    window.blade = {};
    window.blade.temp = {};
    window.blade.view = {};
    window.blade.route = [];
    window.blade.data = {};

    window.blade.view[this.viewName] = {};

  }

  view(template){

      // const dependencies = arr;
      // const obj = dependencies.pop();
      // const {template, templateUrl, style, styleUrl, props, controller} = obj;

      window.blade.view[this.viewName].template = template;

      // window.blade.view[name] = {
      //   template: template,
      //   templateUrl: templateUrl,
      //   style: style,
      //   styleUrl: styleUrl,
      //   props: props,
      //   controller: controller
      // }

      // this.initApi(onAppUpdate);
  }

  data(state){
    window.blade.data = state;
  }

  controller(func){
    window.blade.view[this.viewName].controller = func;
  }

  updateData(data){
    window.blade.data = Object.assign({}, window.blade.data, data);

    let domparser = new DOMParser();
    const root = document.querySelector('#root').innerHTML
    var htmlObject = domparser.parseFromString(root, 'text/html').querySelector('body').innerHTML;
    const app = new Dom();
    const htmlContent = app.virtualDom(window.blade.view[this.viewName].template);
    window.blade.view[this.viewName].vDomNew = htmlContent;
    const targetElm = document.querySelector('#root');

    // console.log('=================')
    // console.log(targetElm)
    // console.log(window.blade.view[this.viewName].vDomNew[0])
    // console.log(window.blade.view[this.viewName].vDomPure[0])
    // console.log(window.blade.data)
    // console.log('=================')

    app.updateDom(targetElm, window.blade.view[this.viewName].vDomNew[0], window.blade.view[this.viewName].vDomPure[0]);

    // var controller = window.blade.view[this.viewName].controller
    // let extScript = () => {eval(controller(parms))}
    // let event = new Event('executeScript');
    // window.addEventListener('executeScript', extScript)
    // window.dispatchEvent(event)
    // window.removeEventListener('executeScript', extScript);

  }

  render(target){

    const $data = data => this.updateData(data);

    var template = window.blade.view[this.viewName].template;
    const app = new Dom();
    const htmlContent = app.virtualDom(template);
    window.blade.view[this.viewName].vDomPure = htmlContent;

    let domparser = new DOMParser();
    var htmlObject = domparser.parseFromString(template, 'text/html').querySelector('body');
    const targetElm = document.querySelector(target);

    app.updateDom(targetElm, htmlContent[0]);
    window.blade.view[this.viewName].oldDom = domparser.parseFromString(template, 'text/html').querySelector('body');

    const parms = {
      $data: $data
    }

    var controller = window.blade.view[this.viewName].controller
    let extScript = () => {eval(controller(parms))}
    let event = new Event('executeScript');
    window.addEventListener('executeScript', extScript)
    window.dispatchEvent(event)
    window.removeEventListener('executeScript', extScript);

    // const expresion = new Compiler();
    // const compiled = expresion.compile(htmlContent)

    // document.getElementById('root').innerHTML = template;

    // const router = new Router(this.pageRoot, this.target, this.defaultRoute, window.blade.route);
    // router.defaultRoute(this.afterAppInit, this.onRouteInit);
    // router.defaultRoute();
    // router.handleBrowserNavigation(this.pages, this.onRouteChange);
    // router.handleBrowserNavigation(this.pages);

  }



  route(route, view){
//           "aaron":{
//             template: "layout-1",
//             data: {
//               name: "Aaron",
//               description: "I am the developer behind bladeJS",
//               text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus sagittis posuere."
//             },

    var obj = {
      [route]: view,
    }

    window.blade.route.push(obj)

  }


  // render(hook){
  //   const {onAppInit, afterAppInit, onRouteInit, onAppUpdate, onRouteChange} = hook;
  //   window.blade = {};
  //   window.blade.temp = {};
  //   this.initApi(onAppUpdate);
  //
  //   onAppInit();
  //
  //   const menu = new Menu(this.routes, this.pageRoot, this.target, onRouteChange);
  //   const router = new Router(this.pageRoot, this.target, this.defaultRoute, this.routes, onRouteChange);
  //   document.getElementById('root').innerHTML = template[this.layout];
  //   menu.render();
  //   router.defaultRoute(afterAppInit, onRouteInit);
  //   router.handleBrowserNavigation(this.pages, onRouteChange);
  //
  // }

}
