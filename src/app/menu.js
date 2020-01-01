
import { setPage, getPage } from './utilis';

export default class Menu{

  constructor(routes, pageRoot, viewTarget, onRouteChange){
    this.routes = routes.filter(route => route !== '404');
    this.pageRoot = pageRoot;
    this.viewTarget = viewTarget;
    this.onRouteChange = onRouteChange;
  }


  setRouteProps(subRoute, thisObj, thisRoute){

    this.onRouteChange();

    var template, data, route;

    console.log()

    if(Object.entries(window.blade.props.template).length === 0){
      template = subRoute[thisRoute].template || null;
      window.blade.props.template = template || null;
    }else{
      template = window.blade.props.template;
    }

    if(typeof(thisObj) === 'object'){
      route = Object.keys(thisObj)[0];
      data = thisObj[Object.keys(thisObj)[0]].data || window.blade.props.data;
    }else{
      route = thisRoute;
      data = {} || window.blade.props.data;
    }

    return {template, data, route}

  }

  addLinksSubRoute(targetRoute, subRoute){

    for(let i=0;i<subRoute.length;i++){

      var thisRoute = typeof(subRoute[i]) === 'string' ? subRoute[i].toLowerCase() : Object.keys(subRoute[i])[0];

      var thisLink = document.querySelector(`[data-blade-route='${targetRoute.toLowerCase()}-${thisRoute.toLowerCase()}']`);
      var thisLinkHref = thisLink.getAttribute('href')

          var route, data, selector;

          thisLink.addEventListener('click', (e) => {

            window.blade.props = {};
            window.blade.props.data = {};
            window.blade.props.template = {};

            var thisRoute2 = typeof(subRoute[i]) === 'string' ? subRoute[i].toLowerCase() : Object.keys(subRoute[i])[0];
            var thisLink2 = document.querySelector(`[data-blade-route='${targetRoute.toLowerCase()}-${thisRoute2.toLowerCase()}']`);
            var thisLinkHref2 = thisLink2.getAttribute('href')

            var template;

            // if(!window.blade.temp.template){
            //   template = subRoute[i][thisRoute2].template || null;
            //   window.blade.temp.template = template || null;
            // }else{
            //   template = window.blade.temp.template;
            // }


            window.blade.temp.subRoute = subRoute[i][thisRoute2].subRoute || null;

            var thisObj = subRoute[i];

            // if(typeof(thisObj) === 'object'){
            //   route = Object.keys(thisObj)[0];
            //   data = thisObj[Object.keys(thisObj)[0]].data || {};
            // }else{
            //   route = thisRoute2;
            //   data = {};
            // }

            e.preventDefault();

            history.pushState({}, '', thisLinkHref2);
            // selector = route.toLowerCase();

            const renderPage = async() => {
              var props = await this.setRouteProps(subRoute[i], thisObj, thisRoute2);
              window.blade.temp.template = props.template || null;
              var res = await getPage(thisLinkHref2, this.pageRoot, props.template);
              let content = await res.text();
              await setPage(content, this.viewTarget, props.data);
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

            window.blade.props = {};
            window.blade.props.data = {};
            window.blade.props.template = {};

            window.blade.temp.parentRoute = null;

            var thisRoute2 = Object.keys(this.routes[i])[0];

            var template;

            // if(!window.blade.props.template){
            //   template = this.routes[i][thisRoute2].template || null;
            // }else{
            //   template = window.blade.props.template;
            // }

            window.blade.temp.subRoute = this.routes[i][thisRoute2].subRoute || null;
            var thisObj = this.routes[i];

            if(typeof(thisObj) === 'object'){
              route = Object.keys(thisObj)[0];
              // data = thisObj[Object.keys(thisObj)[0]].data || {};
            }else{
              route = thisRoute;
              // data = {};
            }

            e.preventDefault();
            let page = `/${route}`;
            history.pushState({}, '', page);
            selector = page.substr(1, page.length).toLowerCase();

            const renderPage = async() => {
              var props = await this.setRouteProps(this.routes[i], thisObj, thisRoute2);
              console.log(props);
              window.blade.temp.template = props.template || null;
              var res = await getPage(`/${route}`, this.pageRoot, props.template);
              console.log(res);
              let content = await res.text();
              await setPage(content, this.viewTarget, props.data);
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
          this.addLinksSubRoute(`${Object.keys(this.routes[i])[0]}`, subRoute);
        }
      }

    }

  }


  renderSubRoutes(baseRoot, routes){

    var subRoutes = routes.map(route => {
      var page, icon, thisRoute = Object.keys(route)[0];

      var subRoutes_child = '';

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
          subRoutes_child = this.renderSubRoutes(`${baseRoot}/${page.toLowerCase()}`, subRoute);
        }
      }

      subRoutes = '';

      var bladeRoute = `${baseRoot}-${page.toLowerCase()}`

      return `
        <li class="menu-item ${subRoutes !== undefined ? 'has-submenu' : ''}">
          <div>
            <a class="nav-link" data-blade-route="${bladeRoute.replace(/\//g,'-')}" href="/${baseRoot}/${page.toLowerCase()}">${page}</a>
            ${subRoutes_child ? `<i class="fas fa-angle-right"></i>` : ''}
            ${subRoutes_child !== undefined ? subRoutes_child : ''}
          </div>
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
        <li class="menu-item ${subRoutes !== undefined ? 'has-submenu' : ''}">
          <div>
            <div class="icon-wrapper"><i class="fas ${icon}"></i></div>
            <a class="nav-link" data-blade-route="${page.replace(' ', '').toLowerCase()}" href="/${page.replace(' ', '').toLowerCase()}">${routeName}</a>
            ${subRoutes ? `<i class="fas fa-angle-right"></i>` : ''}
            ${subRoutes !== undefined ? subRoutes : ''}
          </div>
        </li>
      `;
    })

    const content = `
        <ul class="nav-container">
          ${items}
        </ul>
    `;

    document.querySelector('.nav').innerHTML = content.replace(/,/g,'');

    const openMenus = document.querySelectorAll('.menu-open');

    for(let menu of openMenus){
      menu.parentNode.nextElementSibling.style.display = 'none';
    }


    this.addLinks();

  }



}
