const $exp = (exp) => {
  window.blade.expressions = exp;
}

const fetchPage = async(route, root, templateUrl) =>{
  var res;

  if(templateUrl){
    res = await fetch(`http://localhost:8080/${templateUrl}.html`);
  }

  const string = await res;
  return string;
}

export const setPage = (target, obj) => {

  var content;
  var prams = {$exp: $exp}
  window.blade.expressions = {};
  var templateStyle = document.createElement('style');
  templateStyle.innerHTML = obj.style;
  document.querySelector('head').appendChild(templateStyle);

  console.log(obj.props)

  if(obj.controller){
    let extScript = () => {eval(obj.controller(prams))}
    let event = new Event('executeScript');
    window.addEventListener('executeScript', extScript)
    window.dispatchEvent(event)
    window.removeEventListener('executeScript', extScript);

  }

  document.querySelector(target).innerHTML = obj.template;

    // setLogic();
    // setExpressions();
    // setModal();
}

export const getPage = async(defaultRoute, pageRoot, template) => {
  var res = await fetchPage(defaultRoute, pageRoot, template);
  return res;
}
