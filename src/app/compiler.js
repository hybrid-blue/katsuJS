export default class Compiler{
  construction(){

    this.expressStr = '';

  }

  expressions(content, target){

    var regex = /(?<={{)(.*?)(?=\s*}})/g;
    let expressions = content.match(regex);

    var data = content;

    for(let exp of expressions){
      if(window.blade.view[target].data[exp] !== null){
        data = data.replace(`{{${exp}}}`, window.blade.view[target].data[exp]);
      }
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




  directives(node, viewName, virtualDom){

    if(node.attributes){
      [...node.attributes].forEach((attr) => {
        switch(attr.name){
          case 'data-blade-for':
            this.directiveFor(attr.value, node, viewName)
          break;

          case 'data-blade-switch':
            window.blade.switch = attr.value;
          break;

          case 'data-blade-case':
            this.directiveCase(attr.value, node);
            let switchVal = window.blade.switch;
            let comment = document.createComment('case-element');
            if(attr.value !== window.blade.view[viewName].data[switchVal]){
              node = comment;
            }else{
              switchCase = true;
            };
          break;

          case 'data-blade-default':
            if(switchCase){
              let comment = document.createComment('case-element');
              node = comment;
            }
          break;

          case 'data-blade-click':
            setTimeout(() => {
              let target = document.querySelector(`[data-blade-click="${attr.value}"]`);

              if(!target.getAttribute('data-blade-listening')){
                target.setAttribute('data-blade-listening', 'true');
                target.addEventListener('click', (e) => {

                  let regex = /(?<=\()(.*?)(?=\s*\))/g;
                  let arg = attr.value.match(regex)

                  let func = window.blade.events[attr.value.split('(')[0]];

                  var newArgs = [];

                  let args = arg[0].split(',')

                  for(let i = 0;i<args.length;i++){
                    if(/\'(.*?)\'/g.test(args[i])){
                      let val = args[i].trim();
                      let trimed = val.substr(1, val.length-2);
                      newArgs.push(trimed)
                    }else{
                      newArgs.push(window.blade.view[viewName].data[args[i].trim()])
                    }
                  }

                  var obj = {this: e.target, args: newArgs}

                  func(newArgs);
                })
              }

            },10)

          break;
          case 'data-blade-bind':

            setTimeout(() => {
              let target = document.querySelector(`[data-blade-bind="${attr.value}"]`);

              if(!target.getAttribute('data-blade-listening')){
                target.setAttribute('data-blade-listening', 'true');

                var eventType;

                if(target.getAttribute('type') === 'input'){
                  eventType = 'keydown';
                }else if(target.getAttribute('type') === 'checkbox'){
                  eventType = 'click';
                }

                target.addEventListener(eventType, (e) => {

                  setTimeout(() => {
                    var eventValue = eventType === 'keydown' ? e.target.value : e.target.checked;
                    let data = {};
                    data[attr.value] = eventValue;
                    let view = window.blade.module
                    window.blade.view[viewName].data = Object.assign({}, window.blade.view[viewName].data, data);
                    let domparser = new DOMParser();
                    const root = document.querySelector('#root').innerHTML
                    var htmlObject = domparser.parseFromString(root, 'text/html').querySelector('body').innerHTML;

                    const htmlContent = virtualDom(window.blade.view[view].template);

                    window.blade.view[view].vDomNew = htmlContent;
                    const targetElm = document.querySelector('#root');

                    this.updateDom(targetElm, window.blade.view[view].vDomNew[0], window.blade.view[view].vDomPure[0]);

                    window.blade.view[view].vDomPure = window.blade.view[view].vDomNew


                  }, 10)

                })

              }

            }, 10);

          break;
          case 'data-blade-class':
            setTimeout(() => {

              const target = document.querySelector(`[data-blade-class="${attr.value}"]`);

              if(attr.value.indexOf('{') > -1){
                var stringObj = attr.value;
                stringObj = stringObj.substr(1, attr.value.length);
                stringObj = stringObj.substr(0, attr.value.length - 2);
                var classNameArray = [];
                var newClassNameArray = [];
                let objArray = stringObj.split(',');
                var bladeClasses = [];

                for(let items of objArray){
                  let array = items.split(':')

                  classNameArray.push(array);
                }

                for(let item of classNameArray){
                  let a, b;
                  for(let i=0;i<item.length;i++){
                    if(i === 0){
                      a = item[i].trim()
                    }else{
                      b = item[i].trim()
                    }
                  }


                  bladeClasses.push(a)
                  newClassNameArray.push(JSON.parse(`{"${a}": "${b}"}`));
                }


                target.classList.add(node.classList.value);

                var nameArray = [];

                for(let className of newClassNameArray){
                  let key = Object.keys(className);
                  let value = Object.values(className);


                  let data = window.blade.view[viewName].data[value]

                  let nodeClass = node.classList.value.split(' ');
                  let targetClass = target.classList.value.split(' ');

                  if(window.blade.view[viewName].data[value]){
                    nameArray.push(key[0])
                  }


                }

                let nodeClass = node.classList.value.split(' ');
                let targetClass = target.classList.value.split(' ');

                console.log(bladeClasses)
                console.log(nameArray)


                let newClasses = nameArray.filter(item => {
                  console.log(item)
                  var classArray = [];
                  for(let thisClass of bladeClasses){
                    console.log(thisClass)
                    classArray.push(item !== thisClass);
                  }
                  return classArray;
                })

                let currentClasses = targetClass.filter(item => {
                  for(let thisClass of nodeClass){
                    return item !== thisClass;
                  }
                })

                if(JSON.stringify(newClasses) !== JSON.stringify(currentClasses)){

                  var removedClasses;

                  if(newClasses.length > 0){
                    removedClasses = currentClasses.filter(item => {
                      for(let thisClass of newClasses){
                        return item !== thisClass;
                      }
                    })
                  }else{
                    removedClasses = currentClasses
                  }

                  for(let item of removedClasses){
                    target.classList.remove(item);
                  }

                  let targetClassArr = node.classList.value.split(', ');
                  let classArray = targetClassArr.concat(newClasses);
                  for(let className of classArray){
                    target.classList.add(className);
                  }

                }

              }else{

                let nodeClass = node.classList.value.split(' ');
                let targetClass = target.classList.value.split(' ');

                let newClasses = targetClass.filter(item => {
                  for(let thisClass of nodeClass){
                    return item !== thisClass;
                  }
                })

                let data = window.blade.view[viewName].data[attr.value];

                console.log(JSON.stringify(newClasses));
                console.log(JSON.stringify([data]));

                if(JSON.stringify(newClasses) !== JSON.stringify([data])){

                  for(let item of newClasses){
                    target.classList.remove(item);
                  }

                  let classArray = [node.classList.value, data];

                  for(let className of classArray){
                    target.classList.add(className);
                  }
                }

              }

            }, 10)
          break;
          case 'data-blade-src':
            setTimeout(() => {
              document.querySelector(`[data-blade-src="${attr.value}"]`).src = window.blade.view[viewName].data[attr.value]
            }, 10)
          break;
        }
      });
    }

  }










}
