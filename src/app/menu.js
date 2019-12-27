
import { setPage, getPage } from './utilis';

export default class Menu{

  constructor(routes, pageRoot, viewTarget, onRouteChange){
    this.routes = routes.filter(route => route !== '404');
    this.pageRoot = pageRoot;
    this.viewTarget = viewTarget;
    this.onRouteChange = onRouteChange;
  }

  addLinksSubRoute(targetRoute, subRoute){

    for(let i=0;i<subRoute.length;i++){

      var thisRoute = typeof(subRoute[i]) === 'string' ? subRoute[i].toLowerCase() : Object.keys(subRoute[i])[0];

      var thisLink = document.querySelector(`[data-blade-route='${targetRoute.toLowerCase()}-${thisRoute.toLowerCase()}']`);
      var thisLinkHref = thisLink.getAttribute('href')

          var route, data, selector;

          thisLink.addEventListener('click', (e) => {

            var thisRoute2 = typeof(subRoute[i]) === 'string' ? subRoute[i].toLowerCase() : Object.keys(subRoute[i])[0];
            var thisLink2 = document.querySelector(`[data-blade-route='${targetRoute.toLowerCase()}-${thisRoute2.toLowerCase()}']`);
            var thisLinkHref2 = thisLink2.getAttribute('href')

            console.log(thisRoute2);
            console.log(thisLink2);
            console.log(thisLinkHref2);

            var thisObj = subRoute[i];
            if(typeof(thisObj) === 'object'){

              route = Object.keys(thisObj)[0];
              data = thisObj[Object.keys(thisObj)[0]].data || {};
            }else{
              route = thisRoute2;
              data = {};
            }

            e.preventDefault();
            // let page = `/${route}`;
            history.pushState({}, '', thisLinkHref2);
            selector = route.toLowerCase();

            const renderPage = async() => {
              var res = await getPage(thisLinkHref2, this.pageRoot);
              let content = await res.text();
              await this.onRouteChange();
              await setPage(content, this.viewTarget, data);
            }

            renderPage();

          })


          if(typeof(subRoute[i]) !== 'string'){

            if(subRoute[i][thisRoute].subRoute !== undefined){
              if(subRoute[i][thisRoute].subRoute.length > 0){
                var thisSubRoute;
                if(typeof(subRoute[i][thisRoute].subRoute) === 'object'){
                  thisSubRoute = subRoute[i][thisRoute].subRoute;
                }else{
                  // subRoute = route.subRoute;
                }
                this.addLinksSubRoute(`${targetRoute}-${Object.keys(subRoute[i])[0]}`, thisSubRoute);
              }
            }

          }


    }

  }

  addLinks(){

    for(let i=0;i<this.routes.length;i++){

      var thisRoute = Object.keys(this.routes[i])[0];
      var thisLink = document.querySelector(`[data-blade-route='${thisRoute}']`);

          var route, data, selector;

          thisLink.addEventListener('click', (e) => {

            var thisObj = this.routes[i];
            if(typeof(thisObj) === 'object'){
              route = Object.keys(thisObj)[0];
              data = thisObj[Object.keys(thisObj)[0]].data || {};
            }else{
              route = thisRoute;
              data = {};
            }

            e.preventDefault();
            let page = `/${route}`;
            history.pushState({}, '', page);
            selector = page.substr(1, page.length).toLowerCase();

            const renderPage = async() => {
              var res = await getPage(`/${route}`, this.pageRoot);
              let content = await res.text();
              await this.onRouteChange();
              await setPage(content, this.viewTarget, data);
            }

            renderPage();

          })


      if(this.routes[i][thisRoute].subRoute !== undefined){
        if(this.routes[i][thisRoute].subRoute.length > 0){
          var subRoute;
          if(typeof(this.routes[i][thisRoute].subRoute) === 'object'){
            subRoute = this.routes[i][thisRoute].subRoute;
          }else{
            // subRoute = route.subRoute;
          }
          console.log(subRoute);
          this.addLinksSubRoute(`${Object.keys(this.routes[i])[0]}`, subRoute);
        }
      }

    }

  }


  renderSubRoutes(baseRoot, routes){

    var subRoutes = routes.map(route => {
      var page, icon, thisRoute = Object.keys(route)[0];

      var subRoutes_x = '';

      if(typeof(route) === 'object'){
        page = thisRoute;
        icon = route[thisRoute].icon;
      }else{
        page = route;
      }

      if(route[thisRoute].subRoute !== undefined){
        if(route[thisRoute].subRoute.length > 0){
          var subRoute;
          if(typeof(route[thisRoute].subRoute) === 'object'){
            subRoute = route[thisRoute].subRoute;
          }else{
            // subRoute = route.subRoute;
          }
          subRoutes_x = this.renderSubRoutes(`${baseRoot}/${page.toLowerCase()}`, subRoute);
        }
      }

      subRoutes = '';

      var bladeRoute = `${baseRoot}-${page.toLowerCase()}`

      return `
      <li>
        <div>
          <a class="nav-link" data-blade-route="${bladeRoute.replace(/\//g,'-')}" href="/${baseRoot}/${page.toLowerCase()}">${page}</a>
        </div>
        ${subRoutes_x !== undefined ? subRoutes_x : ''}
      </li>`

    }).toString().replace(/,/g, '');

    return `<ul>${subRoutes}</ul>`;

  }

  render(){

    var subRoutes;

    const items = this.routes.map(item => {
      var page, icon, thisRoute = Object.keys(item)[0];
      if(typeof(item) === 'object'){
        page = thisRoute;
        icon = item[thisRoute].icon;
      }else{
        page = item;
      }
      var formatName = page.toString().replace(/,/g, '');
      var routeName = formatName.substr(0,1).toUpperCase() + formatName.substr(1,formatName.length);

      if(item[thisRoute].subRoute !== undefined){
        if(item[thisRoute].subRoute.length > 0){
          var subRoute;
          if(typeof(item[thisRoute].subRoute) === 'object'){
            subRoute = item[thisRoute].subRoute;
          }else{
            subRoute = item[thisRoute].subRoute;
          }
          subRoutes = this.renderSubRoutes(page, subRoute);
        }

      }

      return `
        <li>
          <div>
            <div class="icon-wrapper"><i class="fas ${icon}"></i></div>
            <a class="nav-link" data-blade-route="${page.replace(' ', '').toLowerCase()}" href="/${page.replace(' ', '').toLowerCase()}">${routeName}</a>
          </div>
          ${subRoutes !== undefined ? subRoutes : ''}
        </li>
      `;
    })

    const content = `
        <ul class="nav-container">
          ${items}
        </ul>
    `;

    document.querySelector('.nav').innerHTML = content.replace(/,/g,'');

    this.addLinks();

  }



}
