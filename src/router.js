import { setPage, getPage } from './app/utilis';

export default class Router{

  constructor(pageRoot, viewTarget, defaultPage = "", routes){
    this.pageRoot = pageRoot;
    this.viewTarget = viewTarget;
    this.defaultPage = defaultPage;
    this.routes = routes;
  }

  renderPage(selector, afterAppInit){
     const render = async(pageRoot, viewTarget) => {
      var res = await getPage(selector, this.pageRoot);
      const statusCode = await res.status;
      if(statusCode === 404){
        let content = '<h1>404</h1><h2>Page was not found</h2>'
        await setPage(content, this.viewTarget);
        await afterAppInit()
      }else{
        let content = await res.text();
        await setPage(content, this.viewTarget);
        await afterAppInit()
      }
    }
    render();
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
      onRouteChange()
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
