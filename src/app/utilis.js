const fetchPage = async(route, root) =>{
  console.log('................')
  console.log(root)
  console.log(route)
  console.log('................')
  const res = await fetch(`http://localhost:8080/${root}${route}.html`);
  const string = await res;
  return string;
}


export const setPage = (content, target, data) => {
  document.querySelector(target).innerHTML = content;

  const scripts = document.querySelectorAll('script');

  window.blade.props = data;

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

export const getPage = async(defaultRoute, pageRoot) => {
  var res = await fetchPage(defaultRoute, pageRoot);
  return res;
}
