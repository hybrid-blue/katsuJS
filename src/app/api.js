// What can be done with the API

// app.state('pull');
// app.state('pull', 'title');
// app.state('push', {title: 'Xenoblade Chronicles 2'});
// app.state('destory');
// app.state('destory', 'title');
// app.state('change', {title: 'Octopath Traveler'});
// app.get('data');
// app.get('route');
// app.get('template');
// app.get('subRoute');
// app.set('data', {title: 'Octopath Traveler'});
// app.set('template', 'layout-2')


export default class Api{

  constructor(){
    this.hook = '';
  }

  initApi(hook){
    console.log('##### initApi #####')
    this.hook = hook;
    window.blade.state = {};
    window.blade.props = {};
    window.blade.props.data = {};
    window.blade.props.template = {};
  }

  state(type, variable){

    switch(type){
      case 'push':
        try{
          Object.keys(variable).forEach((state) => {
            if(window.blade.state[state]){
              throw `State "${variable[state]}" already exists`
            }else{
              window.blade.state[state] = variable[state];
            }
          })
          this.hook();
        }
        catch(e){
          console.error(e)
        }
      break;
      case 'pull':
        try{
          if(Object.keys(window.blade.state).length > 0){
            return window.blade.state[variable] || window.blade.state;
          }else{
            throw `State is Empty`
          }
        }
        catch(e){
          console.error(e)
        }
      break;
      case 'destory':
        try{
          if(variable){
            try{
              if(window.blade.state[variable]){
                this.hook();
                delete window.blade.state[variable];
              }else{
                throw `State "${variable}" does not exist`;
              }
            }
            catch(e){
              console.error(e)
            }
          }else{
            window.blade.state = {}
          }
        }
        catch(e){
          console.error(e)
        }
      break;
      case 'change':
        try{
          if(window.blade.state[variable]){
            this.hook();
            window.blade.state[variable] = value;
          }else{
            throw `State "${variable}" does not exist`;
          }
        }
        catch(e){
          console.error(e)
        }
      break;

    }
  }

  pushState(variable, value){}

  pullState(variable = null){}

  destoryState(variable = null){}

  changeState(variable, value){}

  pullLocal(variable = null){ }

  get(type, variable){

    var res;
    var data;

    console.log('Get - Variable')
    console.log(variable)
    console.log(window.blade.props)

    switch(type){
      case 'route':
        res = window.location.pathname;
        break;
      case 'template':
        res = window.blade.temp.template;
        break;
      case 'subRoute':
        res = window.blade.temp.subRoute;
        break;
      case 'fullRoute':
        res = window.blade.temp.fullRoute;
        break;
      case 'data':
        try{
          if(Object.keys(window.blade.props).length > 0){
            console.log(window.blade.props.data);
            if(variable){
              data = window.blade.props.data[variable];
            }else{
              data = window.blade.props.data;
            }
            return data;

          }else{
            throw `This page has no data`
          }
        }
        catch(e){
          console.error(e)
        }
      break;
    }
    return res;
  }

  set(type, variable){
    console.log('Set - Variable')
    console.log(variable)
    switch(type){
      case 'data':
        try{
          Object.keys(variable).forEach((state) => {
            window.blade.props.data = variable;
          })
          this.hook();
        }
        catch(e){
          console.error(e)
        }
      break;
      case 'template':
        window.blade.props.template = variable;
      break;
    }

  }

}
