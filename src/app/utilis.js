const fetchPage = async(route, root, template) =>{
  var res;

  if(!template){
    res = await fetch(`http://localhost:8080/${root}/${route}.html`);
  }else{
    res = await fetch(`http://localhost:8080/template/${template}.html`);
  }

  const string = await res;
  return string;
}


export const setPage = (content, target, data) => {

  document.querySelector(target).innerHTML = content;
  const scripts = document.querySelectorAll('script');

  if(Object.entries(data).length === 0){
    window.blade.props.data = null;
  }else{
    window.blade.props.data = data;
  }


  let pageScript = [...scripts].map((script) => {
    if(script.dataset.script){
      return script;
    }
  }).filter(item => item);

  if(pageScript[0]){
    let script = pageScript[0].innerHTML
    let extScript = () => {eval(script)}
    let event = new Event('executeScript');
    window.addEventListener('executeScript', extScript)
    window.dispatchEvent(event)
    window.removeEventListener('executeScript', extScript);
  }

}

export const getPage = async(defaultRoute, pageRoot, template) => {
  var res = await fetchPage(defaultRoute, pageRoot, template);
  return res;
}
