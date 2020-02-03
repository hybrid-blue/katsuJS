import { setPage, getPage } from './app/utilis';

export default class Router{

  constructor(pageRoot, viewTarget, defaultPage = "", routes, onRouteChange, template = "", templateUrl = ""){
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

    console.log(thisLevelRoutes)

    var template;
    const routes = selector.split('/');
    for(let thisRoute of thisLevelRoutes){

        let route = routes[level];
        console.log(Object.keys(thisRoute))
        console.log(Object.values(thisRoute))
        // if(thisRoute[route]){
        //   if(thisLevelRoutes.length > 0){
            // level++
            // this.findRoute(selector, thisRoute[route].subRoute, level);
          // }else{
            console.log(thisRoute)
            console.log(window.blade.view[Object.values(thisRoute)[0]].template)

            if(window.blade.view[Object.values(thisRoute)[0]].template){
              this.selectedRoute = {
                template: window.blade.view[Object.values(thisRoute)[0]].template || '',
                templateUrl: window.blade.view[Object.values(thisRoute)[0]].templateUrl || '',
                style: window.blade.view[Object.values(thisRoute)[0]].style || '',
                styleUrl: window.blade.view[Object.values(thisRoute)[0]].styleUrl || '',
                props: window.blade.view[Object.values(thisRoute)[0]].props || '',
                controller: window.blade.view[Object.values(thisRoute)[0]].controller || ''
            }

            this.selectedRouteObj = thisRoute[route];
            this.obj = thisRoute;

            break;
          // }
        }

    }

  }

  renderLoading(){
    document.querySelector(this.viewTarget).innerHTML = `<h2 id="blade-loading">Loading<span></span></h2>`;
  }


  // setRouteProps(route, thisObj, thisRoute){
  //
  //   // this.onRouteChange();
  //
  //   var template, data;
  //
  //   if(Object.entries(window.blade.props.template).length === 0){
  //     template = this.selectedRouteObj.template || null;
  //     window.blade.props.template = template || null;
  //   }else{
  //     template = window.blade.props.template;
  //   }
  //
  //   if(typeof(thisObj) === 'object'){
  //     route = Object.keys(route)[0];
  //     data = this.selectedRouteObj.data || window.blade.props.data;
  //   }else{
  //     route = thisRoute;
  //     data = {} || window.blade.props.data;
  //   }
  //   return {template, data, route}
  //
  // }



  renderPage(selector, afterAppInit = () => {}){

    this.renderLoading();

    // var thisLink = document.querySelector(`[data-blade-route='${selector.replace(/\//g,'-', '-')}']`);
    var type = this.findRoute(selector, this.routes);

    // var thisLinkHref = thisLink.getAttribute('href');
    var template = this.selectedRoute || null;
    // var data = this.selectedRouteObj.data || {};

    const render = async(template) => {
      // var props = await this.setRouteProps(this.obj, this.obj, selector);
      // window.blade.temp.template = props.template || null;

      var res = await getPage(`/${selector}`, this.pageRoot, this.selectedRoute.templateUrl);
      // const statusCode = await res.status;
      // if(statusCode === 404){
      //   let content = '<h1>404</h1><h2>Page was not found</h2>'
      //   await setPage(content, this.viewTarget, this.selectedRoute);
        // await afterAppInit()
      // }else{
        // let content = await res.text();
        await setPage(this.viewTarget, this.selectedRoute);
        // await afterAppInit()
      // }
    }

    render(template);
  }

  defaultRoute(afterAppInit, onRouteInit){
    // onRouteInit();

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
