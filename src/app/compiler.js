export default class Compiler{
  construction(){

  }

  expressions(content){
    let val = content.substr(2, content.length - 4);
    console.log('#################');
    console.log(window.blade.data[val])
    console.log('#################');
    return window.blade.data[val];
  }

  directives(){

  }

  compile(htmlContent){
    console.log(htmlContent)

  }

}
