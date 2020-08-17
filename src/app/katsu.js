import '../style.css';

export default class Katsu{
  constructor(){

    this.viewName;
    this.targetElement;
    this.component = {}
    this.forLoop = []
    this.forCount = [];
    this.currentIteration;
    this.switchCase;
    this.expressStr;
    this.state = {};
    this.root;

  }


  /**
  * Poller for Elmement of targted attribute.
  */
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

  /**
  * Poller Case directive for switch elements.
  */
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

  /**
  * Check if element as a listener
  */
  checkListener(target, ev){
    if(!target.getAttribute('data-kat-listening')){
      target.setAttribute('data-kat-listening', ev);
      return false
    }else{
      let events = target.getAttribute('data-kat-listening');
      if(events.indexOf(ev) > -1){
        return true;
      }else{
        events += `,${ev}`
        target.setAttribute('data-kat-listening', events)
        return false
      }
    }
  }


  /**
  * Expression interpolation
  */
  expressions(content, target){

    var regex = /(?<={{)(.*?)(?=\s*}})/g;
    let expressions = content.match(regex);
    var data = content;

      for(let exp of expressions){

        if(exp.indexOf('.') > -1){

          let expArray = exp.split('.');
          var currentData = this.component[target].data;

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
              try{
                currentData = currentData[expArray[i]];
              }
              catch{
                currentData = '';
              }

            }
          }
        }else{
          if(this.component[target].data[exp] !== null){
            if(this.component[target].data[exp] === undefined){
              data = data.replace(`{{${exp}}}`, '');
            }else{
              if(this.component[target].data[exp]) data = data.replace(`{{${exp}}}`, this.component[target].data[exp]);
            }
          }
        }

      }

      return data

  }

  //
  generateExp(obj, key){
    if(typeof obj[key] === 'object'){
      this.expressStr += `${key}.`;
      this.generateExp(obj[key], Object.keys(obj[key])[0]);
    }else{
      this.expressStr += key;
    }
    return this.expressStr;
  }

  getEventValues(target, viewName, topObj, arg){
    var foundIndex;
    var newArgs = {};

    const findIndex = (parentNode) => {
      let nodes = parentNode.parentNode.children;
      let thisNode = parentNode;
      let forCount = 0;
      let array = Array.prototype.slice.call(document.querySelectorAll(`[data-kat-for="${thisNode.getAttribute('data-kat-for')}"]`));
      let dataCount = this.component[viewName].data[topObj].length;
      let elmCount = array.length / dataCount;

      for(let i=0;i<elmCount;i++){
        for(let x=0;x<dataCount;x++){
          if(array[((dataCount * i) + x)].getAttribute('key-active')){
            array[((dataCount * i) + x)].removeAttribute('key-active')
            let index = ((dataCount * i) + x) - (dataCount * i)
            return index;
          }
        }
      }
    }

    const findParent = (elm) => {
      var parentNode, childNode;

      if(elm.parentNode.getAttribute('data-kat-for')){
        parentNode = elm.parentNode;
        childNode = elm;
        parentNode.setAttribute('key-active', true)
        foundIndex = findIndex(parentNode);
      }else if(elm.getAttribute('data-kat-for')){
        elm.setAttribute('key-active', true)
        foundIndex = findIndex(elm);
      }else{
        if(elm.tagName !== 'BODY'){
          findParent(elm.parentNode);
        }
      }

    }

    findParent(target);

    if(arg.trim() === 'index'){
      newArgs['index'] = foundIndex
    }else{
      let selector = arg.trim();
      if(selector.indexOf('.') > -1){
        let data = this.component[viewName].data[topObj][foundIndex];
        newArgs['data'] = data[selector.split('.')[1]];
      }else{
        newArgs['data'] = this.component[viewName].data[selector];
      }
    }

    return newArgs;

  }


  // Duplicate elements with kat-for attribute and interpolate the expressions
  directiveFor(value, node, target){

    let selector = value.split(' ').pop();
    let exp = value.split(' ')[0];

    var topSelector = selector;

    const replaceExp = (html, item, expression, index) => {
      var values = expression;
      var dataObj = [];

      // If item is not a string, but an object, generate a selector for interpolation. If not, Interpolate using base expression.
      if(typeof item === 'object'){

        let expKeys = Object.keys(item);
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
        }
      }else{
        html = html.replace(`{{${expression}}}`, item);
      }
      // html = `<!-- ${topSelector}[${index}] -->` + html + `<!-- END -->`;
      // console.log(html)
      return html;
    }

    const cleanExp = (html, item, expression) => {
      var values = expression;
      var newHtml;

      function removeExp(html, dataArray, expArray){

        var newHtml = html;
        if(expArray.length > 1){
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
        }else{

          let exp = expArray[0];
          var isMissing = true;

          if(dataArray) isMissing = false;

          if(isMissing){
            newHtml = newHtml.replace(exp, '');
          }else{
            newHtml = newHtml;
          }
        }

        return newHtml;
      }



      if(typeof item === 'object'){

        let expKeys = Object.keys(item);
        for(let key of expKeys){
          const regex = new RegExp(`{{${expression}(.*?)}}`, "g");
          const expArray = html.match(regex);
          newHtml = removeExp(html, item, expArray);
        }
      }else{
        const regex = new RegExp(`{{${expression}(.*?)}}`, "g");
        const expArray = html.match(regex);
        newHtml = removeExp(html, item, expArray);
      }

      return newHtml
    }

    const htmlContent = node.outerHTML;
    let items = this.component[target].data ? this.component[target].data[selector] : null;

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

  /**
  * Set directives of node
  */

  directives(node, child, viewName, type = 'default', index = null, topObj = null, domRoot){

    const virtualDom = this.virtualDom.bind(this);
    const updateDom = this.updateDom.bind(this);
    const updateData = this.updateData.bind(this);

    const getData = (data) => {
      var dataPath;
      let dataArray = data.split('.')

      // This is possible required
      const findRoot = () => {}

      if(data.indexOf('.') > -1){
        for(let i = 0;i<dataArray.length;i++){
          if(i === 0){
            if(this.component[viewName].data[topObj]){
              dataPath = this.component[viewName].data[topObj][index];
            }else{

            }
          }else{
            dataPath = dataPath[dataArray[i]];
          }

        }
      }else{
        dataPath = this.component[viewName].data[data];
      }

      return dataPath;
    }

    if(node.attributes){

      [...node.attributes].forEach((attr) => {

        switch(attr.name){

          case 'data-kat-switch':
            var switchCase = attr.value
            let iou = document.createComment('element-removed');
            let elms = node.childNodes;

            const hasCaseAttribute = (attrs, data) => {
              if(data){
                for(let nodeAttr of attrs){
                  if(nodeAttr.name === 'data-kat-case' && nodeAttr.value !== data){
                    return true;
                  }
                }
              }else{
                for(let nodeAttr of attrs){
                  if(nodeAttr.name === 'data-kat-default'){
                    return true;
                  }
                }
              }
              return false;
            }

            const setCaseDirective = (node) => {
              let data = getData(switchCase)
              for(let i=0;i<elms.length;i++){
                if(elms[i].nodeType === 1){
                  if(hasCaseAttribute(elms[i].attributes, data, 'case')){
                    node.childNodes[i].replaceWith(iou)
                  }else{
                    // console.log(node.childNodes[i])
                    if(!node.childNodes[i].getAttribute('data-kat-default')) this.switchCase = true;
                  };
                }
              }
            }

            const setDefaultDirective = (node) => {
              node.replaceWith(iou)
            }

            setCaseDirective(node);

            if(this.switchCase){
              var defaultNode;
              for(let i=0;i<elms.length;i++){
                if(elms[i].nodeType === 1){
                  if(hasCaseAttribute(elms[i].attributes, null)){
                    node.childNodes[i].replaceWith(iou)
                  }
                }
              }
            }

          break;

          case 'data-kat-click':

          var temp, selectorAttr, tempVal, count, currentElm;

          var _this = this.component;

            setTimeout(() => {

              const setClickEvent = (target) => {
                var hasEvent = this.checkListener(target, 'click');

                if(!hasEvent){
                  target.addEventListener('click', (e) => {

                    setTimeout(() => {
                      let regex = /(?<=\()(.*?)(?=\s*\))/g;
                      let arg = attr.value.match(regex);

                      let func = this.component[viewName].events[attr.value.split('(')[0]];

                      var newArgs = {};

                      let args = arg[0].split(',')

                      for(let i = 0;i<args.length;i++){

                        if(/\'(.*?)\'/g.test(args[i])){

                          let val = args[i].trim();
                          let trimed = val.substr(1, val.length-2);
                          newArgs['args'] = trimed;

                        }else{

                          newArgs = this.getEventValues(target, viewName, topObj, args[i]);

                        }
                      }

                      try{
                        if(func){
                          func(newArgs);
                        }else{
                          throw(`Cannot find event "${attr.value.split('(')[0]}"`)
                        }
                      }
                      catch(e){
                        console.error(e)
                      }

                    },1)
                  })
                }

              }


              if(node.getAttribute("data-kat-click") === attr.value){
                var elms;
                if(type === 'for'){
                  elms = domRoot.querySelectorAll(`[data-kat-click="${attr.value}"]`)[index];
                  if(elms){
                    var attrs = elms.getAttribute('data-kat-listening');
                    const findNextValidElm = (attrs, elms, count) => {
                      if(Array.isArray(attrs)){
                        for(let attr of attrs){
                          if(attr === 'click'){
                            let elm = domRoot.querySelectorAll(`[data-kat-click="${attr.value}"]`)[index + count];
                            // let attrs = elms.getAttribute('data-kat-listening');
                            if(elm){
                              if(!elm.getAttribute('data-kat-listening')){
                                currentElm = elm;
                              }else{
                                count += count;
                                findNextValidElm(attrs, elm, count)
                              }
                            }
                          }
                        }
                      }else{
                        if(attrs === 'click'){
                          let elm = domRoot.querySelectorAll(`[data-kat-click="${attr.value}"]`)[index + count];
                          let attrs = elms.getAttribute('data-kat-listening');
                          if(elm){
                            if(!elm.getAttribute('data-kat-listening')){
                              currentElm = elm;
                            }else{
                              count += count;
                              findNextValidElm(attrs, elm, count)
                            }
                          }
                        }
                      }
                    }





                    if(attrs){
                      var count = _this[viewName].localStore.store[topObj].length;
                      findNextValidElm(attrs, elms, count);
                      elms = currentElm
                    }
                    if(elms){
                      setClickEvent(elms)
                    }

                  }

                }else{
                  elms = document.querySelectorAll(`[data-kat-click="${attr.value}"]`);
                  for(let elm of elms){
                    setClickEvent(elm)
                  }
                }
              }

            },1)

          break;

          case 'data-kat-key':

          var temp, selectorAttr, tempVal, count, currentElm;
          var _this = this.component;

            setTimeout(() => {
              const setKeyEvent = (target) => {
                var hasEvent = this.checkListener(target, 'key');
                if(!hasEvent){

                  target.addEventListener('keydown', (e) => {
                    setTimeout(() => {
                      let regex = /(?<=\()(.*?)(?=\s*\))/g;
                      let arg = attr.value.match(regex);
                      let func = this.component[viewName].events[attr.value.split('(')[0]];
                      var newArgs = {};
                      let args = arg[0].split(',');

                      for(let i = 0;i<args.length;i++){
                        if(/\'(.*?)\'/g.test(args[i])){
                          let val = args[i].trim();
                          let trimed = val.substr(1, val.length-2);
                          newArgs['args'] = trimed;
                        }else{
                          newArgs = this.getEventValues(target, viewName, topObj, args, i)
                        }
                      }

                      try{
                        if(func){
                          func(newArgs);
                        }else{
                          throw(`Cannot find event ${attr.value.split('(')[0]}`)
                        }
                      }
                      catch(e){
                        console.error(e);
                      }

                    },1)
                  })
                }
              }


              if(node.getAttribute("data-kat-key") === attr.value){
                var elms;
                if(type === 'for'){
                  elms = domRoot.querySelectorAll(`[data-kat-key="${attr.value}"]`)[index];
                  var attrs = elms.getAttribute('data-kat-listening');
                  const findNextValidElm = (attrs, elms, count) => {
                    if(Array.isArray(attrs)){
                      for(let attr of attrs){
                        if(attr === 'key'){
                          let elm = domRoot.querySelectorAll(`[data-kat-key="${attr.value}"]`)[index + count];
                          if(elm){
                            if(!elm.getAttribute('data-kat-listening')){
                              currentElm = elm;
                            }else{
                              count += count;
                              findNextValidElm(attrs, elm, count)
                            }
                          }
                        }
                      }
                    }else{
                      if(attrs === 'key'){
                        let elm = domRoot.querySelectorAll(`[data-kat-key="${attr.value}"]`)[index + count];
                        let attrs = elms.getAttribute('data-kat-listening');
                        if(elm){
                          if(!elm.getAttribute('data-kat-listening')){
                            currentElm = elm;
                          }else{
                            count += count;
                            findNextValidElm(attrs, elm, count)
                          }
                        }
                      }
                    }
                  }

                  if(attrs){
                    var count = _this[viewName].localStore.store[topObj].length;
                    findNextValidElm(attrs, elms, count);
                    elms = currentElm
                  }
                  if(elms){
                    setKeyEvent(elms)
                  }

                }else{
                  elms = document.querySelectorAll(`[data-kat-key="${attr.value}"]`);
                  for(let elm of elms){
                    setKeyEvent(elm)
                  }
                }
              }

            },1)

          break;

          // ##### Bind Directive #####
          case 'data-kat-bind':

          var temp, selectorAttr, tempVal;
          var checkListener = this.checkListener;
          var _this = this.component;

            function setBindEvent(target, type){

                var hasEvent = checkListener(target, 'bind');
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
                    var data;
                      setTimeout(() => {
                        var eventValue = eventType === 'keydown' ? e.target.value : e.target.checked;
                        let data = {};

                        if(type !== 'for'){
                          data[attr.value] = eventValue;
                          _this[viewName].localStore.store[attr.value] = eventValue;
                        }else{
                          var dataArray = attr.value.split('.');
                          var targetParent;
                          var bladeData = _this[viewName].data
                          var bladeDataPath;
                          var obj;
                          function getParent(elm){
                            if(elm.parentNode.getAttribute('data-kat-for')){
                              targetParent = elm.parentNode
                            }else{
                              getParent(elm.parentNode)
                            }
                          }

                          for(let i=0;i<dataArray.length;i++){
                            if(i === 0){
                              getParent(target);
                              var baseProp = targetParent.getAttribute('data-kat-for').split(' ').pop();
                              obj = bladeData[baseProp];
                            }else{
                              obj[index][dataArray[i]] = eventValue;
                            }
                          }
                          data[topObj] = obj;
                          _this[viewName].localStore.store[topObj] = data[topObj]
                        }
                      },1)
                    })

                }

            }

            if(node.getAttribute("data-kat-bind") === attr.value){

              this.poller(`[data-kat-bind="${attr.value}"]`).then(res => {
                var elms, count, currentElm;

                if(type === 'for'){
                  elms = domRoot.querySelectorAll(`[data-kat-bind="${attr.value}"]`)[index];
                  if(elms){
                    var attrs = elms.getAttribute('data-kat-listening');
                    const findNextValidElm = (attrs, elms, count) => {
                      if(Array.isArray(attrs)){
                        for(let attr of attrs){
                          if(attr === 'bind'){
                            let elm = domRoot.querySelectorAll(`[data-kat-bind="${attr.value}"]`)[index + count];
                            let attrs = elms.getAttribute('data-kat-listening');
                            if(elm){
                              if(!elm.getAttribute('data-kat-listening')){
                                currentElm = elm;
                              }else{
                                count += count;
                                findNextValidElm(attrs, elm, count)
                              }
                            }
                          }
                        }
                      }else{
                        if(attrs === 'bind'){
                          let elm = domRoot.querySelectorAll(`[data-kat-bind="${attr.value}"]`)[index + count];
                          let attrs = elms.getAttribute('data-kat-listening');
                          if(elm){
                            if(!elm.getAttribute('data-kat-listening')){
                              currentElm = elm;
                            }else{
                              count += count;
                              findNextValidElm(attrs, elm, count)
                            }
                          }
                        }
                      }
                    }

                  }

                  if(attrs){
                    var count = _this[viewName].localStore.store[topObj].length;
                    findNextValidElm(attrs, elms, count);
                    elms = currentElm
                  }
                  if(elms){
                    setBindEvent(elms, type)
                  }

                }else{
                  elms = document.querySelectorAll(`[data-kat-bind="${attr.value}"]`);
                  for(let elm of elms){

                    elm.value = _this[viewName].localStore.store[attr.value] || '';

                    setBindEvent(elm, type)
                  }
                }

            });


          }

          break;

          // ##### Class Directive #####
          case 'data-kat-class':

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

                      if(this.component[viewName].data[value]){
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


                if(node.getAttribute("data-kat-class") === attr.value){

                  var elms, data;
                  data  = attr.value;

                  if(type === 'for'){
                    elms = document.querySelectorAll(`[data-kat-class="${attr.value}"]`)[index];

                    let classSelector = data.split('.').pop();
                    var bladeDataClass = data;

                    // find value
                    var bladeData = this.component[viewName].data;
                    var dataArray = data.split('.')
                    var path;
                    var targetParent;

                    function getParent(elm){
                      if(elm.parentNode.getAttribute('data-kat-for')){
                        targetParent = elm.parentNode
                      }else{
                        getParent(elm.parentNode)
                      }
                    }

                    var bladeDataClass;

                    for(let i=0;i<dataArray.length;i++){
                      if(i === 0){
                        getParent(elms);
                        var baseProp = targetParent.getAttribute('data-kat-for').split(' ').pop();
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
                    elms = document.querySelectorAll(`[data-kat-class="${attr.value}"]`);
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
          case 'data-kat-src':
            var temp, selectorAttr, tempVal;
            this.poller(`[data-kat-src="${attr.value}"]`).then(res => {
              if(node.getAttribute("data-kat-src") === attr.value){

                var elms;
                let data = getData(attr.value)
                if(type === 'for'){
                  elms = document.querySelectorAll(`[data-kat-src="${attr.value}"]`)[index];
                  elms.setAttribute('src', data);
                }else{
                  elms = document.querySelectorAll(`[data-kat-src="${attr.value}"]`);
                  for(let elm of elms){
                    elm.setAttribute('src', data);
                  }
                }
              }
            })

          break;

        }

      });
    }
  }


// DOM Building

  buildDom(dom, name, child, domRoot, root = "body", type = "default", index = null, topObj = null){

    let domparser = new DOMParser();
    var htmlobject = index !== null ? domparser.parseFromString(dom, 'text/html').querySelectorAll(root)[0] : domparser.parseFromString(dom, 'text/html').querySelector(root);

    const buildNodes = (thisnode) => {

      return Array.prototype.map.call(thisnode.childNodes, (node => {

        // Check child elements for kat-for attributes. If there are, set them up,
        if(node.children){
          let childNodes = node.children;
          let childCount = childNodes.length;
          for(let i = 0;i<childCount;i++){
            if(childNodes[i].attributes){
              if(childNodes[i].getAttribute('data-kat-for')){
                if(!this.forLoop.includes(childNodes[i].getAttribute('data-kat-for'))){
                  var elmCount = this.directiveFor(childNodes[i].getAttribute('data-kat-for'), childNodes[i], name);
                  if(elmCount > 0){

                    let objName = childNodes[i].getAttribute('data-kat-for').split(' ')[2]
                    for(let x=0;x<childNodes.length;x++){
                      childNodes[x].setAttribute('data-index', `${objName}-${x}`)
                    }

                    this.forLoop.push(childNodes[i].getAttribute('data-kat-for'))
                    this.forCount.push({
                      name: childNodes[i].getAttribute('data-kat-for'),
                      count: elmCount + i
                    })
                  }
                  childCount = childCount + (elmCount - 1);
                }else{
                  this.forCount.forEach((item, index) => {
                    if(item.name === childNodes[i].getAttribute('data-kat-for')){
                      if((item.count - 1) === i){
                        this.forCount.splice(index,1);
                        this.forLoop = this.forLoop.filter(item => item.name !== this.forLoop.name);
                      }
                    }
                  })
                }
              }
            }
          }
        }

        if(node.nodeName !== '#text'){
          if(node.getAttribute('data-index')){
            index = parseInt(node.getAttribute('data-index').split('-')[1]);
            type = 'for'
            this.currentIteration = node.getAttribute('data-index').split('-')[0];
          }else{
            type = null
          }
        }

        // Check for katsu-if attribute. If it is then set directive.
        if(node.attributes){
          let selector = node.getAttribute(`data-kat-if`);
            if(selector){
              const getData = (data) => {
                var dataPath;
                let dataArray = data.split('.')
                const findRoot = () => {}

                if(data.indexOf('.') > -1){
                  for(let i = 0;i<dataArray.length;i++){
                    if(i === 0){
                      if(this.component[name].data[this.currentIteration]){
                        dataPath = this.component[name].data[this.currentIteration][index];
                      }else{
                        // For aternative solution
                      }
                    }else{
                      dataPath = dataPath[dataArray[i]];
                    }
                  }
                }else{
                  dataPath = this.component[name].data[data];
                }

                return dataPath;
              }


              const hasIfAttribute = (attrs, data) => {
                for(let nodeAttr of attrs){
                  if(nodeAttr.name === 'data-kat-if'){
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

        // Run through the node's attributes and set directives.
        this.directives(node, child, name, type, index, this.currentIteration, domRoot)
        var map, thisNode = node.textContent.trim(), emptyArray = [];

        var map = {
          type: node.nodeType === 3 ? 'text' : (node.nodeType === 1 ? node.tagName.toLowerCase() : (node.nodeType === 8 ? 'comment' : null)),
          content: node.childNodes && node.childNodes.length > 0 ? null : (/{{(.*?)}}/g.test(node.textContent) ? this.expressions(node.textContent, name) : node.textContent),
          attr: node.attributes ? this.buildAttributes(node.attributes) : (node.nodeType === 8 ? emptyArray : null),
          node: node,
          children: buildNodes(node)
        }

        return map

      }));

    }

    return buildNodes(htmlobject);

  };

  virtualDom(dom, name, child, root){
    let builtDom = this.buildDom(dom, name, child, root);
    this.forLoop = [];
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
          value = attr.value.replace(`{{${expressions[i]}}}`, this.component[this.viewName].data[expressions[i]]);
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

  /**
  * Set Component's Data Proxy
  * Proxy concept referenced from Chris Ferdinandi's reef.js, special thanks.
  */

  dataProxy(storeType, name, type, childComponent){

    var _data = wrap(this.component[name].data, 'data', console.log)

    const updateData = this.updateData.bind(this)

    var trueTypeOf = function (obj) {
      return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    };

    function wrap(o, type, fn, scope = []) {

      // Force update Proxy

        const handler = {
          get(target, prop, receiver) {
            // fn('get value in scope: ', scope.concat(prop));

            if (['object', 'array'].indexOf(trueTypeOf(target[prop])) > -1) {
      				return new Proxy(target[prop], handler);
      			}

            return target[prop];
          },
          set(target, prop, value, receiver) {
            // fn('set value in scope: ', scope.concat(prop))

            var obj = {};
            let pathArray = scope.concat(prop);

            // Build object for updateData method to use for updating the componets data.
            if(pathArray.length > 1){
              for(let i=0;i<pathArray.length;i++){
                if(i === (pathArray.length - 1)){
                  let thisObj = {}
                  thisObj[pathArray[(i)]] = value;
                  obj[pathArray[(i - 1)]] = thisObj;
                }else if(i === 0){
                  obj[pathArray[i]] = {}
                }else{
                  obj[pathArray[(i - 1)]] = {}
                }
              }
            }else{
              obj[pathArray[0]] = value
            }

            target[prop] = value

            // Update component's Data
            updateData(obj, name, childComponent, type);

            return true
          }

        }

      return new Proxy(
        Object.keys(o).reduce((result, key) => {
          if (isObject(o[key])) {
            result[key] = wrap(o[key], type, fn, scope.concat(key))
          } else {
            result[key] = o[key]
          }
          return result
        }, {}),
        handler
      )
    }

    function isObject(obj) {
      return typeof obj === 'object' && !Array.isArray(obj)
    }

    // Set Global Object as entry-way to data proxy
    if(storeType === 'state'){
      if(this.state){

        Object.defineProperty(this.state, 'store', {
          get: function(){
            return _data
          },
          set: function(data){
            _data = wrap(data, 'state', console.log);
            return true
          }
        })

      }
    }else{
      if(this.component[name].data){
        Object.defineProperty(this.component[name].localStore, 'store', {
          get: function(){
            return _data
          },
          set: function(e){
            _data = wrap(e, 'data', console.log);
            return true
          }
        })
      }
    }
  }



  // ###############################################################
  // #                    Component Render                         #
  // ###############################################################

  state(e){
    if(typeof e === 'object'){
      this.state = e;
    }else{
      return this.state;
    }
  }

  updateData(data, target, child, type = 'data'){

    if(type === 'data'){
      this.component[target].data = Object.assign({}, this.component[target].data, data);
    }else{
      this.state = Object.assign({}, this.state, data);
    }

    let domparser = new DOMParser();

    const root = child ? document.querySelector(`[data-kat-component="${target}"]`).innerHTML : document.querySelector(this.component[target].root).innerHTML;
    var htmlObject = domparser.parseFromString(root, 'text/html').querySelector('body').innerHTML;
    const targetElm = child ? document.querySelector(`[data-kat-component="${target}"]`) : document.querySelector(this.component[target].root);
    const htmlContent = this.virtualDom(this.component[target].template, target, child, targetElm);

    this.component[target].vDomNew = htmlContent;
    this.updateDom(targetElm, this.component[target].vDomNew[0], this.component[target].vDomPure[0]);
    this.component[target].vDomPure = this.component[target].vDomNew;

    // #This should detect which componets to update / Performance Suggestion

    if(this.component[target].components){
      let components = this.component[target].components
      for(let comp of components){
        if(this.component[comp].data){
          let props = {};
          let componentElm = document.querySelectorAll(`[data-kat-component="${comp}"]`)[0];
          let attrProps = componentElm.getAttribute('props');
          props[attrProps] = this.component[target].data[attrProps];
          this.component[comp].data = props;
          this.updateData(props[attrProps], comp, true, type = 'data')
        }
      }
    }

  }

  /**
  * Render and inilizes the component(s)
  */

  render(module, target, childComponent = false, parent = null){

    var viewName;

    if(childComponent){
      viewName = target;
      this.component[viewName].parent = parent
    }else{
      const mod = new module[0]();

      this.viewName = module[0].name;
      this.component[this.viewName] = {};
      this.component[this.viewName].template = mod.view();
      mod.data ? this.component[this.viewName].data = mod.data() : this.component[this.viewName].data = {};
      mod.controller ? this.component[this.viewName].controller = mod.controller  : this.component[this.viewName].controller = null;
      module[1] ? this.component[this.viewName].options = module[1] : this.component[this.viewName].options = null;
      viewName = module[0].name;

    }

    this.component[viewName].root = target;

    const $event = (selector) => {
      return{
        on: (name, func) => {
          this.component[selector].events[name] = func;
        },
        receive: (name, func) => {
          this.component[selector].emit[name] = func;
        }
      }

    }

    const $emit = (selector) => {
      return{
        send: (data) => {
          try{
            if(data){
              let views = this.component
              var parent = this.component[selector].parent
              let func = this.component[parent].emit[selector];
              try{
                if(Object.keys(this.component[parent].emit).length > 0){
                  func(data);
                }else{
                  throw(`Parent component ${parent} needs an $event.recieve()`)
                }
              }
              catch(e){
                console.error(e)
              }
            }else{
              throw(`There was not data sent from ${selector}`);
            }
          }
          catch(e){
            console.error(e)
          }

        }
      }

    }


    // Set proxy for getting services
    const serviceHandler = {
      get(target, prop, receiver) {
        return target[prop]
      }
    }

    const $service = (selector) => {
      return new Proxy(this.component[selector].service, serviceHandler)
    }

    const updateData = this.updateData.bind(this)

    this.component[viewName].targetData = {};
    this.component[viewName].events = {};
    this.component[viewName].emit = {};
    this.component[viewName].service = {};
    this.component[viewName].localStore = {}

    this.dataProxy('data', viewName, childComponent);

    // Set params
    const params = {
      $data: this.component[viewName].localStore.store,
      $event: $event(viewName),
      $emit: $emit(viewName),
      $service: $service(viewName),
      // $state: $state
    }

    // Poller for child components
    const pollerComponent = (target) => {

      return new Promise((resolve, reject) => {

        var i = 0;
        const selector = `document.querySelector('[data-kat-component="${target}"]')`

        var poller = setInterval(() => {
          if(selector || i === 1000){
            stopPoller();
            resolve(true);
          }else{
            i++;
          }
        },1);

        function stopPoller() {
          clearInterval(poller);
        }

      })

    };

    // Check if there is any options with this Component
    if(this.component[viewName].options && this.component[viewName].options.length > 0){

      const options = this.component[viewName].options;

      this.component[viewName].components = []

      var rendered = [];

      for(let i = 0;i<options.length;i++){
        let mod = new options[i]();
        if(mod.service){
          this.component[viewName].service[options[i].name] = mod.service();
        }else{

          pollerComponent(options[i].name).then(res => {

            try{

              if(mod.view){
                this.component[options[i].name] = {};
                this.component[options[i].name].template = mod.view();

                if(mod.data){
                  let props = {};
                  let componentElm = document.querySelectorAll(`[data-kat-component="${options[i].name}"]`)[0];
                  let attrProps = componentElm.getAttribute('props');
                  mod.data(this.component[viewName].data[attrProps]);
                  this.component[options[i].name].data = this.component[viewName].data[attrProps];

                }else{
                  this.component[options[i].name].data = {};
                }

                mod.controller ? this.component[options[i].name].controller = mod.controller  : this.component[options[i].name].controller = null;
                this.component[viewName].components.push(options[i].name)

              }else{
                throw(options[i].name)
              }

            }
            catch(err){
              console.error(`Class ${err} is not a valid block`)
              return false;
            }

            // Render Child Components
            if(this.component[viewName].components){
              for(let comp of this.component[viewName].components){
                if(!rendered.includes(comp)){
                  this.render(comp, comp, true, viewName);
                }
                rendered.push(comp)
              }
            }

          });

        }

      }

    }


    // Generate View
    var template = this.component[viewName].template;
    const targetElm = document.querySelector(target) || document.querySelectorAll(`[data-kat-component="${viewName}"]`)[0];
    const htmlContent = this.virtualDom(template, viewName, childComponent, targetElm);
    this.component[viewName].vDomPure = htmlContent;

    let domparser = new DOMParser();
    var htmlObject = domparser.parseFromString(template, 'text/html').querySelector('body');
    this.updateDom(targetElm, htmlContent[0]);
    this.component[viewName].oldDom = domparser.parseFromString(template, 'text/html').querySelector('body');

    // Apply Controller
    var controller = this.component[viewName].controller || null;
    if(controller){
      var regex = /\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g
      var augs = controller.toString().match(regex)[0];
      var attr = [];
      var argsArray = augs.substr(1, augs.length - 2).split(',');

      argsArray.forEach((item, i) => {
        attr.push(params[item.trim()])
      })

      let extScript = () => {eval(controller(...attr))};
      let event = new Event('executeScript');

      window.addEventListener('executeScript', extScript)
      window.dispatchEvent(event)
      window.removeEventListener('executeScript', extScript);
    }

  }

}
