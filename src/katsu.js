    // Service Proxy
    const serviceHandler = {
      get(target, prop, receiver) {
        return target[prop]
      }
    }

    const $service = (selector) => {
      return new Proxy(window.blade.view[selector].service, serviceHandler)
    }
    window.blade.view[viewName].service = {};

      $service: $service(viewName),
          if(mod.service){
            window.blade.view[viewName].service[options[i].name] = mod.service();
          }else{
            console.error(`Class ${err} is not a valid block`)
            return false;
          }
