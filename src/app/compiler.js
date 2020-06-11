export default class Compiler{
  construction(){

    this.expressStr = '';

  }

  expressions(content, target){
    // console.log(content)
    var regex = /(?<={{)(.*?)(?=\s*}})/g;
    let val = regex.exec(content)[0]

    var data;
    // console.log(window.blade.view[target].data[val])
    if(window.blade.view[target].data[val]){
      // data = window.blade.data[val];
      data = window.blade.view[target].data[val]
    }else{
      // console.log(window.blade.component[target])
      data = window.blade.component[target].data[val];
    }

    return data;
  }

  generateExp(obj, key){
    if(typeof obj[key] === 'object'){
      this.expressStr += `${key}.`;
      this.generateExp(obj[key], Object.keys(obj[key])[0]);
    }else{
      this.expressStr += key;
    }
    return this.expressStr;
  }

  directiveIf(dom, node){

  }

  directiveFor(value, node, target){


    let selector = value.split(' ').pop();
    let exp = value.split(' ')[0];

    const replaceExp = (html, item, expression) => {
      var values = expression;

      if(typeof item === 'object'){

        let expKeys = Object.keys(item);
        let expVals = Object.values(item);

        for(let key of expKeys){

          this.expressStr = '';
          var childObject = this.generateExp(item, key);
          var selector = `${expression}.${childObject}`;
          var itemValue;

          if(/[\.]/g.test(childObject)){
            let paths = childObject.split('.');
            function getValue(paths, item, i = 0){
              if(typeof Object.values(item[paths[i]])[0] === 'string'){
                return Object.values(item[paths[i]])[0];
              }else{
                i++
                getValue(paths, item[paths[i]], i)
              }
            }
            itemValue = getValue(paths, item)
          }else{
            itemValue = item[key]
          }
          html = html.replace(`{{${selector}}}`, `{{${key}}}`);
          html = html.replace(`{{${key}}}`, itemValue);
        }
        html;
      }else{
        html.replace(`{{${expression}}}`, item)
      }
      return html;

    }

    const cleanExp = (html, item, expression) => {

      var values = expression;
      var newHtml;

      if(typeof item === 'object'){

        let expKeys = Object.keys(item);
        let expVals = Object.values(item);

        for(let key of expKeys){

          function removeExp(html, dataArray, expArray){
            var newHtml = html;
            for(let exp of expArray){
              var isMissing = true;
              for(let data of Object.keys(dataArray)){
                if(exp.indexOf(data) > -1) isMissing = false;
              }
              if(isMissing){
                newHtml = newHtml.replace(exp, '');
              }else{
                newHtml = newHtml;
              }
            }
            return newHtml;
          }

          const regex = new RegExp(`{{${expression}(.*?)}}`, "g");
          const expArray = html.match(regex);
          newHtml = removeExp(html, item, expArray);
          // console.log(selector);
          // console.log(html)
          // console.log(html.includes(selector));
          // newHtml = html.replace(`{{${selector}}}`, `{{${key}}}`);
          // htmlHtml = html.replace(`{{${key}}}`, itemValue);
        }
      }else{
        // newHtml = html.replace(`{{${expression}}}`, item)
      }
      return newHtml
    }

    const htmlContent = node.innerHTML
    // let items = window.blade.data[selector];


    let items = window.blade.view[target].data[selector]

    const func = (html, items, exp) => {
      console.log(target);
      console.log(selector);
      console.log(items)
      return items.map((item, i) => {
        let htmlContent = cleanExp(html, item, exp)
        return replaceExp(htmlContent, item, exp);
      }).join('');
    }
    let oldChildNode = document.createRange().createContextualFragment(node.innerHTML)
    // If statment
    // var newHTML = ifFunc(htmlContent, items, exp)
    // For statment
    var newHTML =  func(htmlContent, items, exp);
    node.innerHTML = '';
    node.appendChild(document.createRange().createContextualFragment(newHTML))
  }

  directiveSwitch(value, node){
    // window.blade.switch = value;
  }

  directiveCase(value, node){
    // let switchVal = window.blade.switch;
    // let comment = document.createComment('case-element')
    // if(value !== window.blade.data[switchVal]){
    //   console.log(node.parentNode)
    //   node.parentNode.replaceChild(comment, node);
    // }
  }

  directiveBind(value){
    // setTimeout(() => {
    //   let target = document.querySelector(`[data-blade-bind="${value}"]`);
    //   target.addEventListener('keydown', (e) => {
    //     setTimeout(() => {
    //       let data = {};
    //       data[value] = e.target.value;
    //       return data[value];
    //     }, 10)
    //   })
    // }, 10);
  }


  compile(htmlContent){

  }

}
