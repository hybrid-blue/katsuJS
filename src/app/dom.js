// import Compiler from './compiler';

// export default class Dom extends Compiler{

export default class Dom{
  constructor(viewName){
    // super()
    this.viewName = viewName;
    this.dom = document.querySelector('#root');
    this.vDom = []
    this.expressStr = '';
    this.currentIndex = null;
    this.currentIteration;
    this.switchCase = null
  }

  // Expressions

  expressions(content, target){

    // console.log(content);
    // console.log(target);

    var regex = /(?<={{)(.*?)(?=\s*}})/g;
    let expressions = content.match(regex);

    // console.log(expressions)





    var data = content;


      for(let exp of expressions){

        if(exp.indexOf('.') > -1){

          let expArray = exp.split('.');

          var currentData = window.blade.view[target].data;

          for(let i=0;i<expArray.length;i++){

            if(i === (expArray.length - 1)){
              return data.replace(`{{${exp}}}`, currentData[expArray[i]]);
            }else{
              currentData = currentData[expArray[i]];
            }
          }
        }else{
          if(window.blade.view[target].data[exp] !== null){
            return data.replace(`{{${exp}}}`, window.blade.view[target].data[exp]);
          }
        }

      }
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

    var topSelector = selector;

    const replaceExp = (html, item, expression, index) => {
      var values = expression;
      var dataObj = []

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

            let obj = {};
            obj[selector] = itemValue;

            window.blade.view[target].data['temp'] = obj

        }
      }else{
        html.replace(`{{${expression}}}`, item)
      }


      html = `<!-- ${topSelector}[${index}] -->` + html + `<!-- END -->`

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
        }
      }else{
        // newHtml = html.replace(`{{${expression}}}`, item)
      }

      return newHtml
    }

    const htmlContent = node.outerHTML;

    let items = window.blade.view[target].data[selector]

    const func = (html, items, exp) => {
      return items.map((item, i) => {
        let htmlContent = cleanExp(html, item, exp)
        return replaceExp(htmlContent, item, exp, i);
      }).join('');
    }

    let oldChildNode = document.createRange().createContextualFragment(node.innerHTML)
    var newHTML =  func(htmlContent, items, exp);

    node.parentNode.replaceChild(document.createRange().createContextualFragment(newHTML), node);

  }

  poller(elm, index = null){
    return new Promise((resolve, reject) => {
      var i = 0;

      var selector = index ? 'document.querySelectorAll('+elm+')'+'['+index+']' : 'document.querySelectorAll('+elm+')'

        var pollerElm = setInterval(() => {
          if(selector || i === 1000){
            stopPoller()
            resolve(true);
          }else{
            i++;
          }
        },1);


      function stopPoller() {
        clearInterval(pollerElm);
      }
    })
  }

  pollerCase(elm){
    return new Promise((resolve, reject) => {
      var i = 0;

      var selector = 'elm.querySelectorAll("div")'

        var pollerElm = setInterval(() => {
          if(selector || i === 1000){
            stopPoller()
            resolve(elm);
          }else{
            i++;
          }
        },1);


      function stopPoller() {
        clearInterval(pollerElm);
      }
    })
  }


  directives(node, viewName, type = 'default', index = null, topObj = null){

    const virtualDom = this.virtualDom.bind(this);
    const updateDom = this.updateDom.bind(this);

    const getData = (data) => {
      var dataPath;

      let dataArray = data.split('.')

      const findRoot = () =>{

      }

      if(data.indexOf('.') > -1){
        for(let i = 0;i<dataArray.length;i++){
          if(i === 0){
            if(window.blade.view[viewName].data[topObj]){
              dataPath = window.blade.view[viewName].data[topObj][index];
            }else{

            }
          }else{
            dataPath = dataPath[dataArray[i]];
          }

        }
      }else{
        dataPath = window.blade.view[viewName].data[data];
      }

      return dataPath;
    }

    if(node.attributes){

      [...node.attributes].forEach((attr) => {

        switch(attr.name){

          case 'data-blade-for':
            this.directiveFor(attr.value, node, viewName);
          break;

          case 'data-blade-switch':

            window.blade.switch = attr.value;

            const hasCaseAttribute = (attrs, data) => {
              for(let nodeAttr of attrs){
                if(nodeAttr.name === 'data-blade-case' && nodeAttr.value !== data){
                  return true;
                }
              }
              return false;
            }

            const setCaseDirective = (node) => {
              let data = getData(window.blade.switch)
              let elms = node.childNodes;
              for(let i=0;i<elms.length;i++){
                if(elms[i].nodeType === 1){
                  if(hasCaseAttribute(elms[i].attributes, data)){
                    let iou = document.createComment('element-removed');
                    node.childNodes[i].replaceWith(iou)
                  }else{
                    this.switchCase = true;
                  };
                }
              }
            }

            setCaseDirective(node)

          break;

          // case 'data-blade-default':
          //
          //   const setCaseDefaultDirective = (elm) => {
          //     if(this.switchCase){
          //       // console.log('=== Set default for removal ===')
          //       elm.setAttribute('data-blade-remove', true);
          //     }
          //   }
          //
          //   this.poller(`[data-blade-default="${attr.value}"]`).then(res => {
          //     if(node.getAttribute("data-blade-default") === attr.value){
          //       var elm;
          //       if(type === 'for'){
          //         // elms = document.querySelectorAll(`[data-blade-default="${attr.value}"]`)[index];
          //         elm = node.parentNode.querySelector(`[data-blade-default="${attr.value}"]`);
          //         // for(let elm of elms){
          //         //   setCaseDefaultDirective(elm)
          //         // }
          //         setCaseDefaultDirective(elm)
          //       }else{
          //         elm = node.parentNode.querySelector(`[data-blade-default="${attr.value}"]`);
          //         // for(let elm of elms){
          //         //   setCaseDefaultDirective(elm)
          //         // }
          //         setCaseDefaultDirective(elm)
          //       }
          //     }
          //   })
          //
          // break;

          case 'data-blade-click':

          var temp, selectorAttr, tempVal;

            if(attr.value.indexOf('.') > -1){
              temp = window.blade.view[viewName].data['temp'];
              selectorAttr = Object.keys(temp)[0];

            }else{
              selectorAttr = attr.value
            }

            setTimeout(() => {
              // let target = document.querySelector(`[data-blade-click="${attr.value}"]`);

              const setClickEvent = (target) => {



                if(!target.getAttribute('data-blade-listening')){
                  target.setAttribute('data-blade-listening', 'true');
                  target.addEventListener('click', (e) => {

                    let regex = /(?<=\()(.*?)(?=\s*\))/g;
                    let arg = attr.value.match(regex);

                    let func = window.blade.events[attr.value.split('(')[0]];

                    var newArgs = {};

                    let args = arg[0].split(',')

                    for(let i = 0;i<args.length;i++){

                      if(/\'(.*?)\'/g.test(args[i])){

                        let val = args[i].trim();
                        let trimed = val.substr(1, val.length-2);

                        newArgs['args'] = trimed;


                      }else{
                        if(args[i].trim() === 'index'){

                          var foundIndex;

                          const findIndex = (parentNode, childNode) => {
                            // let elmTag = childNode.tagName;
                            let nodes = parentNode.children;
                            for(let i=0;i<nodes.length;i++){
                              if(nodes[i].isEqualNode(childNode)){
                                return i;
                              }
                            }
                          }

                          const findParent = (elm) => {

                            var parentNode, childNode;

                            if(elm.parentNode.getAttribute('data-blade-for')){
                              parentNode = elm.parentNode;
                              childNode = elm;
                              foundIndex = findIndex(parentNode, childNode);
                              newArgs['index'] = foundIndex;
                            }else{
                              findParent(elm.parentNode);
                            }

                          }

                          findParent(target);

                        }else{
                          newArgs['data'] = window.blade.view[viewName].data[args[i].trim()];
                        }

                      }
                    }

                    func(newArgs);

                  })
                }

              }




              if(node.getAttribute("data-blade-click") === attr.value){
                var elms;

                // console.log(type)

                // let data = type === 'for' ? Object.values(temp)[0] : window.blade.view[viewName].data[attr.value];
                if(type === 'for'){
                  elms = document.querySelectorAll(`[data-blade-click="${attr.value}"]`)[index];
                  setClickEvent(elms)
                }else{
                  elms = document.querySelectorAll(`[data-blade-click="${attr.value}"]`);
                  for(let elm of elms){
                    setClickEvent(elm)
                  }
                }
              }

            },1)

          break;
          case 'data-blade-bind':

          var temp, selectorAttr, tempVal;

            // if(attr.value.indexOf('.') > -1){
            //   temp = window.blade.view[viewName].data['temp'];
            //   selectorAttr = Object.keys(temp)[0];
            // }else{
            //   selectorAttr = attr.value
            // }

            function setBindEvent(target, type){

              // setTimeout(() => {

                console.log(target)
                console.log(type)
                if(!target.getAttribute('data-blade-listening')){
                  target.setAttribute('data-blade-listening', 'true');

                  var eventType;

                  if(target.getAttribute('type') === 'text'){
                    eventType = 'keydown';
                  }else if(target.getAttribute('type') === 'checkbox'){
                    eventType = 'click';
                  }else{
                    eventType = 'keydown';
                  }

                  // console.log(target)
                  // console.log(eventType)

                  target.addEventListener(eventType, function(e){

                      // console.log(e)
                      setTimeout(() => {

                        var eventValue = eventType === 'keydown' ? e.target.value : e.target.checked;
                        let view = window.blade.module
                        let data = {};
                        if(type !== 'for'){

                          data[attr.value] = eventValue;
                          window.blade.view[viewName].data = Object.assign({}, window.blade.view[viewName].data, data);

                        }else{

                          var dataArray = attr.value.split('.');
                          var targetParent;
                          var bladeData = window.blade.view[viewName].data
                          var bladeDataPath;
                          var obj;

                          function getParent(elm){
                            if(elm.parentNode.getAttribute('data-blade-for')){
                              targetParent = elm.parentNode
                            }else{
                              getParent(elm.parentNode)
                            }
                          }

                          for(let i=0;i<dataArray.length;i++){
                            if(i === 0){
                              getParent(target);
                              var baseProp = targetParent.getAttribute('data-blade-for').split(' ').pop();
                              obj = bladeData[baseProp];
                            }else{
                              obj[index][dataArray[i]] = eventValue;
                            }
                          }

                          data[attr.value] = eventValue;
                          window.blade.view[viewName].data = Object.assign({}, window.blade.view[viewName].data, obj);

                        }


                        let domparser = new DOMParser();
                        const root = document.querySelector('#root').innerHTML
                        var htmlObject = domparser.parseFromString(root, 'text/html').querySelector('body').innerHTML;
                        const htmlContent = virtualDom(window.blade.view[view].template);

                        window.blade.view[view].vDomNew = htmlContent;
                        const targetElm = document.querySelector('#root');
                        updateDom(targetElm, window.blade.view[view].vDomNew[0], window.blade.view[view].vDomPure[0]);

                        window.blade.view[view].vDomPure = window.blade.view[view].vDomNew

                        console.log(window.blade.view[view].vDomPure)

                      },1)

                    })

                }

              // },10)
              // let target = document.querySelector(`[data-blade-bind="${attr.value}"]`);


            }






            if(node.getAttribute("data-blade-bind") === attr.value){

              this.poller(`[data-blade-bind="${attr.value}"]`).then(res => {

                var elms;
                if(type === 'for'){
                  elms = document.querySelectorAll(`[data-blade-bind="${attr.value}"]`)[index];
                  setBindEvent(elms, type)
                }else{
                  elms = document.querySelectorAll(`[data-blade-bind="${attr.value}"]`);
                  for(let elm of elms){
                    setBindEvent(elm, type)
                  }
                }

            });


          }



          break;
          case 'data-blade-class':

            var temp, selectorAttr, tempVal;

            setTimeout(() => {

                const classBuilder = (target, data, type = 'default', index = null) => {

                  if(attr.value.indexOf('{') > -1){

                    var stringObj = attr.value;
                    stringObj = stringObj.substr(1, attr.value.length);
                    stringObj = stringObj.substr(0, attr.value.length - 2);
                    var classNameArray = [];
                    var newClassNameArray = [];
                    var bladeClasses = [];
                    let objArray = stringObj.split(',');


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

                      // console.log(value)
                      // let data = type === 'for' ? window.blade.view[viewName].data['temp'] : window.blade.view[viewName].data[value]
                      // console.log(data);

                      let nodeClass = node.classList.value.split(' ');
                      let targetClass = target.classList.value.split(' ');

                      if(window.blade.view[viewName].data[value]){
                        nameArray.push(key[0])
                      }


                    }

                    let nodeClass = node.classList.value.split(' ');
                    let targetClass = target.classList.value.split(' ');

                    let newClasses = nameArray.filter(item => {
                      // console.log(item)
                      var classArray = [];
                      for(let thisClass of bladeClasses){
                        // console.log(thisClass)
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
                        // console.log('~~~~~ Class 1 ~~~~~')
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

                    // let data = type === 'for' ? window.blade.view[viewName].data['temp'] : window.blade.view[viewName].data[attr.value];
                    // console.log(data)


                    if(type === 'boolean'){

                      for(let item of newClasses){
                        target.classList.remove(item);
                      }

                      var stringObj = JSON.stringify(data);

                      // console.log(stringObj)

                      stringObj = stringObj.substr(1, stringObj.length);
                      stringObj = stringObj.substr(0, stringObj.length - 1);
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

                        // console.log(a);
                        // console.log(b)

                        bladeClasses.push(a)
                        newClassNameArray.push(JSON.parse(`{${a}: ${b}}`));

                        // console.log(bladeClasses);
                        // console.log(newClassNameArray)
                      }

                      target.classList.add(node.classList.value);

                      var nameArray = [];

                      for(let className of newClassNameArray){

                        let key = Object.keys(className);
                        let value = Object.values(className);

                        // console.log(value)
                        // let data = type === 'for' ? window.blade.view[viewName].data['temp'] : window.blade.view[viewName].data[value]
                        // console.log(data);

                        // let nodeClass = node.classList.value.split(' ');
                        // let targetClass = target.classList.value.split(' ');
                        //
                        // console.log(nodeClass);
                        // console.log(targetClass);

                        // if(window.blade.view[viewName].data[key]){
                        //   nameArray.push(key[0])
                        // }

                        if(value[0]) nameArray.push(key[0])

                      }

                      let nodeClass = node.classList.value.split(' ');
                      let targetClass = target.classList.value.split(' ');

                      if(nameArray.length > 0){
                        nameArray.forEach(item => {
                          target.classList.add(item);
                        })
                      }


                      // console.log('====== 2 ======')

                      // let currentClasses = targetClass.filter(item => {
                      //   for(let thisClass of nodeClass){
                      //     return item !== thisClass;
                      //   }
                      // })
                      //
                      // console.log(currentClasses)

                      // console.log('====== 3 ======')

                      // if(JSON.stringify(newClasses) !== JSON.stringify(currentClasses)){

                        // console.log('====== 4 ======')

                        // var removedClasses;
                        //
                        // if(newClasses.length > 0){
                        //   removedClasses = currentClasses.filter(item => {
                        //     for(let thisClass of newClasses){
                        //       return item !== thisClass;
                        //     }
                        //   })
                        // }else{
                        //   removedClasses = currentClasses
                        // }
                        //
                        // for(let item of removedClasses){
                        //   target.classList.remove(item);
                        // }
                        //
                        // let targetClassArr = node.classList.value.split(', ');
                        // let classArray = targetClassArr.concat(newClasses);
                        // for(let className of classArray){
                        //   target.classList.add(className);
                        // }

                      // }







                    }else if(JSON.stringify(newClasses) !== JSON.stringify([data])){



                      for(let item of newClasses){
                        target.classList.remove(item);
                      }

                      let classArray = [node.classList.value, data];

                      for(let className of classArray){
                        // console.log('~~~~~ Class 2 ~~~~~')
                        // console.log(className)
                        target.classList.add(className);
                      }
                    }

                  }

                }

                // console.log('==== data-blade-class SUCCESS ====');
                // console.log(window.blade.view[viewName].data['temp'])
                // console.log(node.getAttribute("data-blade-class"))
                // console.log(selectorAttr)
                // const target = document.querySelector(`[data-blade-class="${attr.value}"]`);

                // console.log('[======================]')
                // console.log(node.getAttribute("data-blade-class"));
                // console.log(selectorAttr)
                // console.log('[======================]')

                if(node.getAttribute("data-blade-class") === attr.value){

                  var elms, data;

                  // if(attr.value.indexOf('{') > -1){
                    data  = attr.value;
                  // }

                  if(type === 'for'){
                    elms = document.querySelectorAll(`[data-blade-class="${attr.value}"]`)[index];

                    let classSelector = data.split('.').pop();
                    var bladeDataClass = data;

                    // find value
                    var bladeData = window.blade.view[viewName].data;
                    var dataArray = data.split('.')
                    var path;
                    var targetParent;

                    function getParent(elm){

                      if(elm.parentNode.getAttribute('data-blade-for')){
                        targetParent = elm.parentNode
                      }else{
                        getParent(elm.parentNode)
                      }

                    }

                    var bladeDataClass;

                    for(let i=0;i<dataArray.length;i++){
                      if(i === 0){
                        getParent(elms);
                        var baseProp = targetParent.getAttribute('data-blade-for').split(' ').pop();
                        let targetObj = bladeData[baseProp];
                        bladeDataClass = targetObj[index];
                      }else{
                        bladeDataClass = bladeDataClass[dataArray[i]]
                      }
                    }

                    if(typeof bladeDataClass === 'boolean'){
                      let thisSelector = attr.value.split('.').pop();
                      let obj = {};
                      obj[thisSelector] = bladeDataClass;
                      classBuilder(elms, obj, 'boolean', index);
                    }else{
                      for(let elm of elms){
                        if(!elm.classList.contains(data) && data) classBuilder(elm, data);
                      }
                    }

                  }else{
                    elms = document.querySelectorAll(`[data-blade-class="${attr.value}"]`);
                    for(let elm of elms){
                      let obj = {};
                      let data = getData(attr.value)
                      obj[attr.value] = data;

                      classBuilder(elm, data);
                    }
                  }
                }


            }, 1)





          break;
          case 'data-blade-src':

            var temp, selectorAttr, tempVal;

            // if(window.blade.view[viewName].data['temp'] !== null){
            // if(attr.value.indexOf('.') > -1){
            //   temp = window.blade.view[viewName].data['temp'];
            //   selectorAttr = Object.keys(temp)[0];
            // }else{
            //   selectorAttr = attr.value
            // }

            // setTimeout(() => {

            this.poller(`[data-blade-src="${attr.value}"]`).then(res => {
              if(node.getAttribute("data-blade-src") === attr.value){
                var elms;
                // let data = type === 'for' ? Object.values(temp)[0] : window.blade.view[viewName].data[attr.value];

                let data = getData(attr.value)

                if(type === 'for'){
                  elms = document.querySelectorAll(`[data-blade-src="${attr.value}"]`)[index];
                  if(!elms.src) elms.setAttribute('src', data);
                }else{
                  elms = document.querySelectorAll(`[data-blade-src="${attr.value}"]`);
                  for(let elm of elms){
                    if(!elm.src) elm.setAttribute('src', data);
                  }
                }
              }
            })



            // }, 1)



          break;


          case 'data-blade-if':

            // var temp, selectorAttr, tempVal;
            //
            //   const setIfDirective = function(elm){
            //
            //     var forSelector;
            //     var dataStr = null;
            //
            //     if(type === 'for'){
            //
            //         var dataStr = {};
            //         var dataObj = {};
            //         let selectorArray = attr.value.split('.');
            //
            //         forSelector = selectorArray.join('.');
            //
            //         var bladeData = window.blade.view[viewName].data
            //
            //         var forSelectorArray = forSelector.split('.')
            //
            //         for(let i=0;i<forSelectorArray.length;i++){
            //           if(i === 0){
            //             var baseProp = forSelectorArray[0];
            //             dataStr = bladeData[topObj][index]
            //             dataObj = dataStr
            //           }else{
            //             let prop = forSelectorArray[i]
            //             dataStr = dataStr[prop]
            //
            //           }
            //         }
            //
            //         if(typeof dataStr === 'boolean'){
            //           if(!dataStr){
            //             elm.setAttribute('data-blade-remove', true);
            //           }
            //         }
            //
            //     }else{
            //
            //       if(typeof window.blade.view[viewName].data[attr.value] === 'boolean'){
            //         if(!window.blade.view[viewName].data[attr.value]){
            //           elm.setAttribute('data-blade-remove', true);
            //         }
            //       }
            //
            //     }
            //
            //   }
            //
            //
            //   this.poller(`[data-blade-if="${attr.value}"]`).then(res => {
            //
            //     if(node.getAttribute("data-blade-if") === attr.value){
            //
            //       var elms;
            //
            //       let data = getData(attr.value)
            //
            //       if(type === 'for'){
            //
            //         elms = document.querySelectorAll(`[data-blade-if="${attr.value}"]`)[index];
            //
            //         if(elms) setIfDirective(elms)
            //
            //       }else{
            //         elms = document.querySelectorAll(`[data-blade-if="${attr.value}"]`);
            //         for(let elm of elms){
            //           if(elm) setIfDirective(elm)
            //         }
            //
            //       }
            //
            //     }
            //
            //   })
            //
            //
            //
            //
            //








              //
              // window.blade.if = attr.value;
              //
              // const hasIfAttribute = (attrs, data) => {
              //   for(let nodeAttr of attrs){
              //     if(nodeAttr.name === 'data-blade-if' && !data){
              //       return true;
              //     }
              //   }
              //   return false;
              // }
              //
              // var hide;
              //
              // // const setIfDirective = (node) => {
              //   console.log('==== set If Directive ====')
              //   let data = getData(window.blade.if)
              //
              //
              //   let elms = node.parentNode.childNodes;
              //   for(let i=0;i<elms.length;i++){
              //     if(elms[i].nodeType === 1){
              //       if(hasIfAttribute(elms[i].attributes, data)){
              //         let iou = document.createComment('element-hidden');
              //         console.log('==== Element Hidden ====')
              //         console.log(node.parentNode.childNodes[i])
              //         // node.parentNode.childNodes[i].replaceWith(iou);
              //         node.parentNode.childNodes[i].replaceWith(iou);
              //       }else{
              //         this.switchCase = true;
              //       };
              //     };
              //   };
              // // };


              // setIfDirective(node)


              // console.log(node)

          break;
        }

      });
      // window.blade.view[viewName].data.temp = null;
    }

  }


/////////////////////////////////////////////



// DOM Building

  buildDom(dom, root = "body", type = "default", index = null, topObj = null){

    let domparser = new DOMParser();
    var htmlobject = index !== null ? domparser.parseFromString(dom, 'text/html').querySelectorAll(root)[0] : domparser.parseFromString(dom, 'text/html').querySelector(root);


    // console.log(htmlobject)


    const buildNodes = (thisnode) => {

      // console.log(thisnode.childNodes)



      return Array.prototype.map.call(thisnode.childNodes, (node => {


        // if(node.attributes){
        //
        //
        //     let selector = node.getAttribute(`data-blade-if`);
        //
        //     if(selector){
        //
        //         var thisElm = window.blade.elements['id1'];
        //         let iou = document.createComment('element-removed');
        //         var forSelector;
        //         var dataStr = null;
        //
        //         if(type === 'for'){
        //           var dataStr = {};
        //           var dataObj = {};
        //           let selectorArray = selector.split('.');
        //
        //           selectorArray.splice(0, 1, `${topObj}`);
        //
        //           forSelector = selectorArray.join('.');
        //
        //           var bladeData = window.blade.view[this.viewName].data
        //
        //           var forSelectorArray = forSelector.split('.')
        //
        //           for(let i=0;i<forSelectorArray.length;i++){
        //             if(i === 0){
        //               var baseProp = forSelectorArray[0];
        //               dataStr = bladeData[baseProp][index]
        //               dataObj = dataStr
        //             }else{
        //               let prop = forSelectorArray[i]
        //               dataStr = dataStr[prop]
        //
        //             }
        //           }
        //
        //           if(typeof dataStr === 'boolean'){
        //             console.log(node)
        //             if(!dataStr){
        //               node = iou;
        //             }
        //           }
        //
        //         }else{
        //
        //           // console.log('############')
        //           // console.log(selector)
        //           // console.log(node)
        //           // console.log(dataStr)
        //           // console.log(index)
        //           // console.log(topObj)
        //           // console.log('############')
        //
        //
        //           if(typeof window.blade.view[this.viewName].data[selector] === 'boolean'){
        //
        //             if(!window.blade.view[this.viewName].data[selector]){
        //
        //               node = iou;
        //             }
        //           }
        //
        //         }
        //
        //       }
        //
        //
        // }

        // this.directives(node, this.viewName, this.virtualDom, type, index)

        // const getParent = (elm) => {
        //
        // }


        // if(node.attributes){
        //
        //   const checkchildfor = (elm) => {
        //     console.log(elm)
        //     if(elm.getElementsByTagName('body')){
        //       return false;
        //     }
        //     if(elm.parentNode.hasAttribute('data-blade-for')){
        //       console.log(node)
        //       return true
        //     }else{
        //       checkchildfor(elm.parentNode)
        //     }
        //
        //   }
        //
        //   checkchildfor(node)
        //
        // }


        // Prepare For elments

        // console.log('[======================================]')
        node.childNodes.forEach((item, i) => {
          // console.log(`[----- ${i} -----]`)
          if(node.childNodes[i].attributes){
            if(node.childNodes[i].getAttribute('data-blade-for')){
              if(!window.blade.forLoop.includes(node.childNodes[i].getAttribute('data-blade-for'))){
                // console.log(node.childNodes[i])
                this.directiveFor(node.childNodes[i].getAttribute('data-blade-for'), node.childNodes[i], this.viewName);
                // console.log(node)
                // console.log(node.childNodes[i + 1])
                window.blade.forLoop.push(node.childNodes[i + 1].getAttribute('data-blade-for'))

              }
            }
          }
        })
        // console.log('[======================================]')

        /////////////////////

        if(node.nodeName === '#comment'){
          // console.log('#################')
          // console.log(node.textContent)
          // console.log('#################')
          if(node.textContent.trim().indexOf('[') > -1){
            // console.log('++++ Comment ++++')
            index = parseInt(node.textContent.slice((node.textContent.indexOf('[') + 1), node.textContent.indexOf(']')));
            type = 'for'
            this.currentIteration = node.textContent.split('[')[0].trim();
          }else{
            type = null
          }

        }




        if(node.attributes){

          let selector = node.getAttribute(`data-blade-if`);

            if(selector){


              const getData = (data) => {
                var dataPath;

                let dataArray = data.split('.')

                const findRoot = () =>{

                }

                if(data.indexOf('.') > -1){
                  for(let i = 0;i<dataArray.length;i++){
                    if(i === 0){
                      if(window.blade.view[this.viewName].data[this.currentIteration]){
                        dataPath = window.blade.view[this.viewName].data[this.currentIteration][index];
                      }else{

                      }
                    }else{
                      dataPath = dataPath[dataArray[i]];
                    }

                  }
                }else{
                  dataPath = window.blade.view[this.viewName].data[data];
                }

                return dataPath;
              }


              const hasIfAttribute = (attrs, data) => {
                for(let nodeAttr of attrs){
                  if(nodeAttr.name === 'data-blade-if'){

                    let data = getData(nodeAttr.value)

                    if(!data){
                      return true;
                    }

                  }
                }
                return false;
              }

              if(hasIfAttribute(node.attributes)){
                let iou = document.createComment('element-hidden');
                node = iou;
              }else{
                this.switchCase = true;
              };


            }

          }




        this.directives(node, this.viewName, type, index, this.currentIteration)


        // var removeComment = document.createComment('REMOVED')
        // console.log('============================')
        // node = removeComment;
        // console.log('============================')



        var map, thisNode = node.textContent.trim(), emptyArray = [];

        var map = {
          type: node.nodeType === 3 ? 'text' : (node.nodeType === 1 ? node.tagName.toLowerCase() : (node.nodeType === 8 ? 'comment' : null)),
          content: node.childNodes && node.childNodes.length > 0 ? null : (/{{(.*?)}}/g.test(node.textContent) ? this.expressions(node.textContent, this.viewName) : node.textContent),
          attr: node.attributes ? this.buildAttributes(node.attributes) : (node.nodeType === 8 ? emptyArray : null),
          node: node,
          children: buildNodes(node)
        }

        return map

      }));

    }

    return buildNodes(htmlobject);

  };

  virtualDom(dom){

    let builtDom = this.buildDom(dom);


    return builtDom;

  }


  buildAttributes(attributes){
    var attrArray = [];
    Object.values(attributes).map((attr) => {

      var value;
      var regex = /(?<={{)(.*?)(?=\s*}})/g;
      let expressions = attr.value.match(regex);

      if(expressions){
        for(let i=0;i<expressions.length;i++){
          value = attr.value.replace(`{{${expressions[i]}}}`, window.blade.view[this.viewName].data[expressions[i]]);
        }
      }else{
        value = attr.value;
      }

      var attrObj = {};
      attrObj[attr.name] = value;
      attrArray.push(attrObj);
    })
    return attrArray;
  }

  removeAttr($target, name){
    $target.removeAttribute(name);
  }

  setAttr($target, name, value){
    var regex = /(?<={{)(.*?)(?=\s*}})/g;
    let expressions = value.match(regex);

    if(expressions){
      for(let i=0;i<expressions.length;i++){
        value = value.replace(`{{${expressions[i]}}}`, window.blade.view[this.viewName].data[expressions[i]]);
      }
    }

    $target.setAttribute(name, value)
  }

  setAttrs(root, props){
    Object.keys(props).forEach(name => {
      let attr = Object.keys(props[name])[0];
      let value = Object.values(props[name])[0];
      this.setAttr(root, attr, value)
    })
  }

  updateAttr(root, name, newVal, oldVal){
    if (!newVal) {
      this.removeAttr(root, name);
    } else if (!oldVal || newVal !== oldVal) {
      this.setAttr(root, name, newVal);
    }
  }

  updateAttrs(root, newAttrs, oldAttrs){
    let newProps = newAttrs ? newAttrs : {};
    let oldProps = oldAttrs ? oldAttrs : {};
    const props = Object.assign({}, newAttrs, oldAttrs);

    Object.values(props).forEach((name, i) => {
      let valName = Object.keys(name)[0];
      let newVal = newProps[i] ? Object.values(newProps[i])[0] : null;
      let oldVal = oldProps[i] ? Object.values(oldProps[i])[0] : null;
      this.updateAttr(root, valName, newVal, oldVal);
    });
  }

  createElm(node){

    if(node){
      if(node.type === 'text'){
        return document.createTextNode(node.content);
      }else if (node.type === 'comment') {
  			return document.createComment(node.content);
  		}
    }else{
      return document.createTextNode('');
    }

    if (typeof node === 'string') {
      return document.createTextNode(node);
    }

    const $el = document.createElement(node.type);

    if(node.attr){
      this.setAttrs($el, node.attr);
    }

    node.children.map(this.createElm.bind(this)).forEach($el.appendChild.bind($el));
    return $el;

  }

  changed(node1, node2){
    // console.log('========= Changed Nodes ===========')

    // if(node1) console.log(node1.content);
    // if(node2) console.log(node2.content);
    return typeof node1 !== typeof node2 ||
         typeof node1 === 'string' && node1 !== node2 ||
         node1.type !== node2.type || node1.content !== node2.content
  }

  updateDom(root, newNode, oldNode, index = 0){

    // console.log('========= Nodes ===========')
    // console.log(root.childNodes[index])
    // console.log(this.createElm(newNode))
    // console.log(this.changed(newNode, oldNode))
    // console.log('===========================')
    if(!oldNode){
      // console.log('========= Created Elm ===========')
      // console.log(this.createElm(newNode))
      // console.log('=================================')
      root.appendChild(this.createElm(newNode));
    }else if (!newNode && root.childNodes[index]){
      // console.log('========= Remove Elm ===========')
      // console.log(root.childNodes[index])
      // console.log('=================================')
      root.removeChild(root.childNodes[index]);
    }else if (this.changed(newNode, oldNode) && root.childNodes[index]) {
      // console.log('========= Replace Elm ===========')
      // console.log(root.childNodes[index])
      // console.log(this.createElm(newNode))
      // console.log('=================================')
      root.replaceChild(this.createElm(newNode), root.childNodes[index]);

    }else if(newNode){
      // Add root !== undefined handle new comments
      if(root !== undefined && root.childNodes[index] !== undefined){
        if(typeof root.childNodes[index].attributes !== 'undefined'){
          // prevent if node has no new attr

          if(newNode.attr !== null){

            if(newNode.attr.length > 0){
              this.updateAttrs(root.childNodes[index], newNode.attr, oldNode.attr);
            }

          }

        }
      }

      const newLength = newNode.children.length;
      const oldLength = oldNode.children.length;

      for(let i = 0; i < newLength || i < oldLength; i++){
        this.updateDom(
          root.childNodes[index],
          newNode.children[i],
          oldNode.children[i],
          i
        );
      }

    }

  }

}
