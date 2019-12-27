export default class Store{

  constructor(){
    this.hook = '';
  }

  initState(hook){
    this.hook = hook;
    window.blade.state = {};
    window.blade.props = {};
  }

  pushState(variable, value){
    if(typeof(variable) !== 'object'){
      try{
        if(!window.blade.state[variable]){
          this.hook();
          window.blade.state[variable] = value;
        }else{
          throw `State "${variable}" already exists`;
        }
      }
      catch(e){
        console.error(e)
      }
    }else{
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

    }

  }

  pullState(variable = null){
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

  }

  pullLocal(variable = null){
    try{
      if(Object.keys(window.blade.props).length > 0){
        return window.blade.props[variable] || window.blade.props;
      }else{
        throw `This page has no data`
      }
    }
    catch(e){
      console.error(e)
    }

  }

  destoryState(variable = null){
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
  }

  changeState(variable, value){
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

  }

}
