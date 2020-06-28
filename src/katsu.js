        receive: (name, func) => {
          window.blade.view[selector].emit[name] = func;
        }
    const $emit = (selector) => {
      return{
        send: (data) => {
          let views = window.blade.view
          var parent = window.blade.view[selector].parent
          console.log(window.blade.view[selector])
          let func = window.blade.view[parent].emit[selector];
          func(data);

        }
      }
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

    var $data, $state;
    if(window.blade.store) $state = wrap(window.blade.store, 'state', console.log)
    if(window.blade.view[viewName].data) $data = wrap(window.blade.view[viewName].data, 'data', console.log)
      $emit: $emit(viewName),
      $service: $service(viewName),
      $state: $state
    }
          if(mod.service){
            window.blade.view[viewName].service[options[i].name] = mod.service();
          }else{
            console.error(`Class ${err} is not a valid block`)
            return false;
          }
