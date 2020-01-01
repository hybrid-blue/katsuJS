import './style.css';

import App from './app/';
import Router from './router';
import { template } from './layout';
import Menu from './app/menu';
import Api from './app/api';

export class Blade extends Api{
  constructor(settings){
    super();
    console.log(settings)
    this.target = settings.target;
    this.routes = settings.router;
    this.pageRoot = settings.pageRoot || './pages';
    this.defaultRoute = settings.defaultRoute || '/';
    this.layout = settings.layout || 'vertical';
  }

  render(hook){
    const {onAppInit, afterAppInit, onRouteInit, onAppUpdate, onRouteChange} = hook;
    window.blade = {};
    window.blade.temp = {};
    this.initApi(onAppUpdate);

    onAppInit();

    const menu = new Menu(this.routes, this.pageRoot, this.target, onRouteChange);
    const router = new Router(this.pageRoot, this.target, this.defaultRoute, this.routes, onRouteChange);
    document.getElementById('root').innerHTML = template[this.layout];
    menu.render();
    router.defaultRoute(afterAppInit, onRouteInit);
    router.handleBrowserNavigation(this.pages, onRouteChange);

  }

}
