// import Compiler from './compiler';

// export default class Dom extends Compiler{

export default class Dom{
  constructor(viewName){
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

    var regex = /(?<={{)(.*?)(?=\s*}})/g;
    let expressions = content.match(regex);

    var data = content;


      for(let exp of expressions){

        if(exp.indexOf('.') > -1){

          let expArray = exp.split('.');

          var currentData = window.blade.view[target].data;

          for(let i=0;i<expArray.length;i++){

            if(i === (expArray.length - 1)){
              // Possibly has a bug for rendering multiple expressions in the same element
              try{
                return data.replace(`{{${exp}}}`, currentData[expArray[i]]);
              }
              catch{
                return data.replace(`{{${exp}}}`, '');
              }

            }else{
              currentData = currentData[expArray[i]];
            }
          }
        }else{

          if(window.blade.view[target].data[exp] !== null){
            data = data.replace(`{{${exp}}}`, window.blade.view[target].data[exp]);
          }
        }

      }

      return data

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
      }

      return newHtml
    }

    const htmlContent = node.outerHTML;

    let items = window.blade.view[target].data[selector]

    const func = (html, items, exp) => {

      if(!items) items = [];

      return items.map((item, i) => {
        let htmlContent = cleanExp(html, item, exp);
        return replaceExp(htmlContent, item, exp, i);
      }).join('');
    }

    let oldChildNode = document.createRange().createContextualFragment(node.innerHTML)
    var newHTML =  func(htmlContent, items, exp);

    var itemCount;

    if(newHTML.length > 0){
      node.parentNode.replaceChild(document.createRange().createContextualFragment(newHTML), node);
      itemCount = items.length;
    }else{
      itemCount = 0;
    }

    return itemCount;

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

  checkListener(target, ev){
    if(!target.getAttribute('data-blade-listening')){
      target.setAttribute('data-blade-listening', ev);
      return false
    }else{
      let events = target.getAttribute('data-blade-listening');
      if(events.indexOf(ev) > -1){
        return true;
      }else{
        events += `,${ev}`
        target.setAttribute('data-blade-listening', events)
        return false
      }
    }
  }



  directives(node, child, viewName, type = 'default', index = null, topObj = null){

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

            setCaseDirective(node);

          break;


          case 'data-blade-click':

          var temp, selectorAttr, tempVal;

            if(attr.value.indexOf('.') > -1){
              temp = window.blade.view[viewName].data['temp'];
              selectorAttr = Object.keys(temp)[0];

            }else{
              selectorAttr = attr.value
            }

            setTimeout(() => {

              const setClickEvent = (target) => {

                if(!target.getAttribute('data-blade-listening')){
                  target.setAttribute('data-blade-listening', 'true');
                  target.addEventListener('click', (e) => {

                    let regex = /(?<=\()(.*?)(?=\s*\))/g;
                    let arg = attr.value.match(regex);

                    let func = window.blade.view[viewName].events[attr.value.split('(')[0]];

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

                          const findIndex = (parentNode) => {
                            let nodes = parentNode.parentNode.children;
                            let thisNode = parentNode;

                            for(let i=0;i<nodes.length;i++){
                              if(nodes[i].isEqualNode(thisNode)){
                                return i;
                              }
                            }
                          }

                          const findParent = (elm) => {

                            var parentNode, childNode;

                            if(elm.parentNode.getAttribute('data-blade-for')){
                              parentNode = elm.parentNode;
                              childNode = elm;
                              foundIndex = findIndex(parentNode);
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



          case 'data-blade-key':

          var temp, selectorAttr, tempVal;

            if(attr.value.indexOf('.') > -1){
              temp = window.blade.view[viewName].data['temp'];
              selectorAttr = Object.keys(temp)[0];
            }else{
              selectorAttr = attr.value
            }

            setTimeout(() => {

              const setKeyEvent = (target) => {

                var hasEvent = this.checkListener(target, 'key');

                if(!hasEvent){

                  target.addEventListener('keydown', (e) => {

                    setTimeout(() => {

                      let regex = /(?<=\()(.*?)(?=\s*\))/g;
                      let arg = attr.value.match(regex);

                      let func = window.blade.view[viewName].events[attr.value.split('(')[0]];

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

                            const findIndex = (parentNode) => {
                              let nodes = parentNode.parentNode.children;
                              let thisNode = parentNode;

                              for(let i=0;i<nodes.length;i++){
                                if(nodes[i].isEqualNode(thisNode)){
                                  return i;
                                }
                              }
                            }

                            const findParent = (elm) => {

                              var parentNode, childNode;

                              if(elm.parentNode.getAttribute('data-blade-for')){
                                parentNode = elm.parentNode;
                                childNode = elm;
                                foundIndex = findIndex(parentNode);
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

                    },1)

                  })

                }

              }


              if(node.getAttribute("data-blade-key") === attr.value){
                var elms;
                if(type === 'for'){
                  elms = document.querySelectorAll(`[data-blade-key="${attr.value}"]`)[index];
                  setKeyEvent(elms)
                }else{
                  elms = document.querySelectorAll(`[data-blade-key="${attr.value}"]`);
                  for(let elm of elms){
                    setKeyEvent(elm)
                  }
                }
              }

            },1)

          break;


          case 'data-blade-bind':

          var temp, selectorAttr, tempVal;

          const setPorxyData = (e) => {
            this.proxyData  = e;
          }

          const checkListener = this.checkListener

            function setBindEvent(target, type){

                var hasEvent = checkListener(target, 'bind');

                console.log('==== bind ====')
                console.log(hasEvent)

                if(!hasEvent){

                  var eventType;

                  if(target.getAttribute('type') === 'text'){
                    eventType = 'keydown';
                  }else if(target.getAttribute('type') === 'checkbox'){
                    eventType = 'click';
                  }else{
                    eventType = 'keydown';
                  }

                  target.addEventListener(eventType, function(e){

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

                        const root = child ? document.querySelector(`[data-blade-component="${this.viewName}"]`).innerHTML : document.querySelector(window.blade.view[target].root).innerHTML;

                        var htmlObject = domparser.parseFromString(root, 'text/html').querySelector('body').innerHTML;
                        const htmlContent = virtualDom(window.blade.view[view].template);

                        window.blade.view[view].vDomNew = htmlContent;

                        const targetElm = child ? document.querySelector(`[data-blade-component="${this.viewName}"]`) : document.querySelector(window.blade.view[target].root);

                        updateDom(targetElm, window.blade.view[view].vDomNew[0], window.blade.view[view].vDomPure[0]);

                        window.blade.view[view].vDomPure = window.blade.view[view].vDomNew

                        console.log(window.blade.view[view].vDomPure)

                      },1)

                    })

                }

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
                      let nodeClass = node.classList.value.split(' ');
                      let targetClass = target.classList.value.split(' ');

                      if(window.blade.view[viewName].data[value]){
                        nameArray.push(key[0])
                      }


                    }

                    let nodeClass = node.classList.value.split(' ');
                    let targetClass = target.classList.value.split(' ');

                    let newClasses = nameArray.filter(item => {
                      var classArray = [];
                      for(let thisClass of bladeClasses){
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

                    if(type === 'boolean'){

                      for(let item of newClasses){
                        target.classList.remove(item);
                      }

                      var stringObj = JSON.stringify(data);

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

                        bladeClasses.push(a)
                        newClassNameArray.push(JSON.parse(`{${a}: ${b}}`));

                      }

                      target.classList.add(node.classList.value);

                      var nameArray = [];

                      for(let className of newClassNameArray){

                        let key = Object.keys(className);
                        let value = Object.values(className);

                        if(value[0]) nameArray.push(key[0])

                      }

                      let nodeClass = node.classList.value.split(' ');
                      let targetClass = target.classList.value.split(' ');

                      if(nameArray.length > 0){
                        nameArray.forEach(item => {
                          target.classList.add(item);
                        })
                      }


                    }else if(JSON.stringify(newClasses) !== JSON.stringify([data])){



                      for(let item of newClasses){
                        target.classList.remove(item);
                      }

                      let classArray = [node.classList.value, data];

                      for(let className of classArray){
                        target.classList.add(className);
                      }
                    }

                  }

                }


                if(node.getAttribute("data-blade-class") === attr.value){

                  var elms, data;

                  data  = attr.value;

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

          break;

        }

      });
      // window.blade.view[viewName].data.temp = null;
    }

  }


/////////////////////////////////////////////



// DOM Building

  buildDom(dom, child, root = "body", type = "default", index = null, topObj = null){

    let domparser = new DOMParser();
    var htmlobject = index !== null ? domparser.parseFromString(dom, 'text/html').querySelectorAll(root)[0] : domparser.parseFromString(dom, 'text/html').querySelector(root);

    const buildNodes = (thisnode) => {

      return Array.prototype.map.call(thisnode.childNodes, (node => {

        // Prepare For elments

        if(node.children){
          let childNodes = node.children;
          let childCount = childNodes.length;
          for(let i = 0;i<childCount;i++){
            if(childNodes[i].attributes){
              if(childNodes[i].getAttribute('data-blade-for')){
                if(!window.blade.forLoop.includes(childNodes[i].getAttribute('data-blade-for'))){
                  var elmCount = this.directiveFor(childNodes[i].getAttribute('data-blade-for'), childNodes[i], this.viewName);
                  if(elmCount > 0){
                    window.blade.forLoop.push(childNodes[i].getAttribute('data-blade-for'))
                  }
                  childCount = childCount + (elmCount - 1);
                }
              }
            }
          }
        }

        if(node.nodeName === '#comment'){
          if(node.textContent.trim().indexOf('[') > -1){
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
                const findRoot = () => {}

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

        this.directives(node, child, this.viewName, type, index, this.currentIteration)

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

  virtualDom(dom, child){

    let builtDom = this.buildDom(dom, child);

    window.blade.forLoop = [];

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
    return typeof node1 !== typeof node2 ||
         typeof node1 === 'string' && node1 !== node2 ||
         node1.type !== node2.type || node1.content !== node2.content
  }

  updateDom(root, newNode, oldNode, index = 0){
    if(!oldNode){
      root.appendChild(this.createElm(newNode));
    }else if (!newNode && root.childNodes[index]){
      root.removeChild(root.childNodes[index]);
    }else if (this.changed(newNode, oldNode) && root.childNodes[index]) {
      root.replaceChild(this.createElm(newNode), root.childNodes[index]);

    }else if(newNode){
      // Add root !== undefined handle new comments
      if(root !== undefined && root.childNodes[index] !== undefined){
        if(typeof root.childNodes[index].attributes !== 'undefined'){

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
