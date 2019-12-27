import './style.css';

import App from './app/';
import Router from './router';
import { template } from './layout';
import Menu from './app/menu';
import Store from './app/store';

export class Blade extends Store{
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
    this.initState(onAppUpdate);

    onAppInit();

    const menu = new Menu(this.routes, this.pageRoot, this.target, onRouteChange);
    const router = new Router(this.pageRoot, this.target, this.defaultRoute, this.routes);
    document.getElementById('root').innerHTML = template[this.layout];
    router.defaultRoute(afterAppInit, onRouteInit);
    router.handleBrowserNavigation(this.pages, onRouteChange);
    menu.render();

  }

  get(val){
    const selector = {
      route: () => {
        console.log('Get Route')
      }
    }

    return selector[val];
  }

  // beforePageLoad(callback){
  //   callback();
  // }
  //
  // onPageLoad(callback){
  //   callback();
  // }
  //
  // afterPageLoad(callback){
  //   callback();
  // }
  //
  // onPageUpdate(callback){
  //   callback();
  // }

}
