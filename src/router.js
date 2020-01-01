import { setPage, getPage } from './app/utilis';

export default class Router{

  constructor(pageRoot, viewTarget, defaultPage = "", routes, onRouteChange){
    this.pageRoot = pageRoot;
    this.viewTarget = viewTarget;
    this.defaultPage = defaultPage;
    this.routes = routes;
    this.onRouteChange = onRouteChange;
    this.selectedRoute;
    this.selectedRouteObj;
    this.obj;
  }


  findRoute(selector, thisLevelRoutes, level = 0){
    var template;
    const routes = selector.split('/');
    for(let thisRoute of thisLevelRoutes){

        let route = routes[level];

        if(thisRoute[route]){

          if(thisRoute[route].subRoute && level < routes.length - 1){
            level++
            this.findRoute(selector, thisRoute[route].subRoute, level);
          }else{


            if(thisRoute[route].template && !window.blade.temp.template){
              template = thisRoute[route].template
              this.selectedRoute = template;
            }else{
              this.selectedRoute = window.blade.temp.template;
            }

            this.selectedRouteObj = thisRoute[route];
            this.obj = thisRoute;

            break;
          }
        }

    }

  }

  renderLoading(){
    document.querySelector(this.viewTarget).innerHTML = `<h2 id="blade-loading">Loading<span></span></h2>`;
  }


  setRouteProps(route, thisObj, thisRoute){

    this.onRouteChange();

    var template, data;

    if(Object.entries(window.blade.props.template).length === 0){
      template = this.selectedRouteObj.template || null;
      window.blade.props.template = template || null;
    }else{
      template = window.blade.props.template;
    }

    if(typeof(thisObj) === 'object'){
      route = Object.keys(route)[0];
      data = this.selectedRouteObj.data || window.blade.props.data;
    }else{
      route = thisRoute;
      data = {} || window.blade.props.data;
    }
    return {template, data, route}

  }



  renderPage(selector, afterAppInit = () => {}){

    this.renderLoading();

    var thisLink = document.querySelector(`[data-blade-route='${selector.replace(/\//g,'-', '-')}']`);
    var type = this.findRoute(selector, this.routes);

    var thisLinkHref = thisLink.getAttribute('href');
    var template = this.selectedRoute || null;
    var data = this.selectedRouteObj.data || {};

    const render = async(template) => {
      var props = await this.setRouteProps(this.obj, this.obj, selector);
      window.blade.temp.template = props.template || null;

      var res = await getPage(`/${selector}`, this.pageRoot, template);
      const statusCode = await res.status;
      if(statusCode === 404){
        let content = '<h1>404</h1><h2>Page was not found</h2>'
        await setPage(content, this.viewTarget, props.data);
        await afterAppInit()
      }else{
        let content = await res.text();
        await setPage(content, this.viewTarget, props.data);
        await afterAppInit()
      }
    }

    render(template);
  }

  defaultRoute(afterAppInit, onRouteInit){
    onRouteInit();

    var selector;
    if(window.location.pathname === '/'){
      selector = this.defaultPage
      this.renderPage(selector, afterAppInit);
    }else{
      let page = window.location.pathname;
      selector = page.substr(1, page.length).toLowerCase();
      let found = false;
      for(let route of this.routes){
        if(typeof(route) === 'object'){
          if(route.page === selector){
            found = true;
            break;
          }
        }else{
          if(route === selector){
            found = true;
            break;
          }
        }

      }
      history.pushState(null, '', page);
      this.renderPage(selector, afterAppInit);
    }

  }

  handleBrowserNavigation(routes, onRouteChange){
    window.addEventListener('popstate', (event) => {
      console.log('Pressed Navigation');
      window.blade.props = {};
      window.blade.temp = {};
      this.selectedRoute = null;
      this.selectedRouteObj = null;
      let page = event.path[0].location.pathname;
      let selector = page.substr(1, page.length).toLowerCase();
      this.renderPage(selector);
    })
  }

  // handle404error(selector){
  //   history.pushState(null, '', selector);
  //   this.renderPage('404');
  // }

};
