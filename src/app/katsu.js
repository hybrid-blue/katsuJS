import { random } from 'lodash';
import '../style.css';

export default class Katsu{
  constructor(){

    this.dom;
    this.viewName;
    this.targetElement;
    this.modules = {};
    this.component = {};
    // this.forLoop = [];
    // this.forCount = [];
    this.currentIteration;
    this.switchCase;
    this.expressStr;

    this.root;
    this.eventMap = {};
    this.prevComponent = {};
    this.currentDom = {};

    // Global State
    this.stateProxy = {};
    this.state = {};
    // this.stateGetters = {};
    // this.stateSetters = {};
    this.stateMethods = {};
    // this.stateMethodStore = {};

    this.initialized = false;
  }

  /**
  * Expression interpolation
  */
  expressions(content, target) {
    const regex = /(?<={{)(.*?)(?=\s*}})/g;
    let expressions = content.match(regex);
    var data = content;

    for(let exp of expressions){
      if(exp.indexOf('.') > -1){
        let expArray = exp.split('.');
        let currentData = {...this.component[target].dataProxy.store, ...this.component[target].propsProxy.store};

        for(let i=0;i<expArray.length;i++){
          if(i === (expArray.length - 1)){
            // Possibly has a bug for rendering multiple expressions in the same element
            try{
              data = data.replace(`{{${exp}}}`, currentData[expArray[i]]);
            }
            catch{
              data = data.replace(`{{${exp}}}`, '');
            }
          }else{
            try{
              const regex = /(?<=\[)(.*?)(?=\s*\])/g;
              let expressions = expArray[i].match(regex);
              if (expressions) {
                currentData = currentData[expArray[i].trim().split('[')[0]][expressions[0]];
              } else {
                currentData = currentData[expArray[i]];
              }
            }
            catch{
              currentData = '';
            }
          }
        }
      }else{
        const componentData = {...this.component[target].dataProxy.store, ...this.component[target].propsProxy.store};
        const indexRegex = /(?<=\[)(.*?)(?=\s*\])/g;

        if (exp.match(indexRegex)) {
          let forExp = exp.split('[')[0];
          const forIndex = exp.match(indexRegex)[0];
          if(componentData[forExp][forIndex]) data = data.replace(`{{${exp}}}`, componentData[forExp][forIndex]);
        } else {
          if(componentData[exp] !== null){
            if(componentData[exp] === undefined){
              data = data.replace(`{{${exp}}}`, '');
            }else{
              if(componentData[exp]) data = data.replace(`{{${exp}}}`, componentData[exp]);
            }
          }
        }
      }
    }

    return data
  }

  bindExpressions(exp, target) {
    let data = null;
    if(exp.indexOf('.') > -1){
      let expArray = exp.split('.');
      let currentData = {...this.component[target].dataProxy.store, ...this.component[target].propsProxy.store};

      for (let i=0;i<expArray.length;i++) {
        if (i === (expArray.length - 1)) {
          // Possibly has a bug for rendering multiple expressions in the same element
          try{
            // console.log(data, exp, currentData[expArray[i]]);
            data = currentData[expArray[i]];
          }
          catch{
            data = '';
          }
        } else {
          try{
            const regex = /(?<=\[)(.*?)(?=\s*\])/g;
            let expressions = expArray[i].match(regex);
            if (expressions) {
              currentData = currentData[expArray[i].trim().split('[')[0]][expressions[0]];
            } else {
              currentData = currentData[expArray[i]];
            }
          }
          catch{
            currentData = '';
          }
        }
      }
    }else{
      // console.log('bindExpressions', exp, target);

      const componentData = {...this.component[target].dataProxy.store, ...this.component[target].propsProxy.store};
      const indexRegex = /(?<=\[)(.*?)(?=\s*\])/g;

      // console.log(componentData);

      if (exp.match(indexRegex)) {
        let forExp = exp.split('[')[0];
        const forIndex = exp.match(indexRegex)[0];
        if(componentData[forExp][forIndex]) data = componentData[forExp][forIndex];
      } else {
        if(componentData[exp] !== null){
          if(componentData[exp] === undefined){
            data = '';
          }else{
            if(componentData[exp]) data = componentData[exp];
          }
        }
      }
    }

    return data;
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

  getEventValues(target, viewName, forIndex = null, arg){
    let foundIndex;
    let newArgs = {};

    // if (isFor) {
    //   const parent = this.component[viewName].parent
    //   const {dataSelector, itteration} = isFor;

    //   let thisParentComponentData;

    //   if (parent) {
    //     thisParentComponentData = this.component[parent].data[dataSelector][itteration]
    //   }
    // }

    // const findIndex = (parentNode) => {
    //   const thisNode = parentNode;
    //   let forCount = 0;
    //   const array = dataSelector;
      
    //   let dataCount = 0;

    //   if (thisParentComponentData) {
    //     const parent = this.component[viewName].parent;
    //     dataCount = thisParentComponentData.length;
    //   } else {
    //     dataCount = this.component[viewName].data[dataSelector].length;
    //   }

    //   console.log(dataCount);

    //   const elmCount = array.length / dataCount;

    //   for(let i=0;i<elmCount;i++){
    //     for(let x=0;x<dataCount;x++){
    //       if(array[((dataCount * i) + x)].getAttribute('key-active')){
    //         array[((dataCount * i) + x)].removeAttribute('key-active')
    //         let index = ((dataCount * i) + x) - (dataCount * i)
    //         return index;
    //       }
    //     }
    //   }
    // }

    // const findParent = (elm) => {
    //   var parentNode, childNode;

    //   if(elm.parentNode.getAttribute('data-kat-for')){
    //     parentNode = elm.parentNode;
    //     childNode = elm;
    //     parentNode.setAttribute('key-active', true)
    //     foundIndex = findIndex(parentNode);
    //   }else if(elm.getAttribute('data-kat-for')){
    //     elm.setAttribute('key-active', true)
    //     foundIndex = findIndex(elm);
    //   }else{
    //     if(elm.tagName !== 'BODY'){
    //       findParent(elm.parentNode);
    //     }
    //   }

    // }

    // findParent(target);

    // let selector = arg.trim();
    // if(selector.indexOf('.') > -1){
    //   let data = this.component[viewName].data[topObj][itteration];
    //   newArgs['data'] = data[selector.split('.')[1]];
    // }else{
    //   newArgs['data'] = this.component[viewName].data[selector];
    // }

    if (forIndex?.toString()) {
      newArgs = forIndex
    }

    return newArgs;

  }


  // Duplicate elements with kat-for attribute and interpolate the expressions
  // This is now redundant and needs to be removed
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
      } else {
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
        if(Array.isArray(expArray)){
          if (expArray.length > 1) {
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
          } else {
            let exp = expArray[0];
            var isMissing = true;
  
            if(dataArray) isMissing = false;
  
            if(isMissing){
              newHtml = newHtml.replace(exp, '');
            }else{
              newHtml = newHtml;
            }
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


// Virtual DOM Building
  buildVDom(dom, name, update, domRoot, root = "body", type = "default", index = null, topObj = null) {

    let domparser = new DOMParser();
    var htmlobject = index !== null ? domparser.parseFromString(dom, 'text/html').querySelectorAll(root)[0] : domparser.parseFromString(dom, 'text/html').querySelector(root);

    const buildVNodes = (thisnode, katsuMetaIsFor) => {
      // console.log('============///////////=============');
      // console.log(thisnode);


      return Array.prototype.map.call(thisnode.childNodes, (node => {
        let katsuMeta;
        if (node.katsuMeta) {
          katsuMeta = Object.assign({}, {} , node.katsuMeta); 
        } else {
          katsuMeta = {}; 
        }

        katsuMeta.component = {}
        katsuMeta.component.module = name


        if(node.attributes){
          // Check for For attribute. If it is then set directive.

          // Move to prepareDom anything related to dulicating nodes and leave anything that would set any katsuMeta properties
          if (node.children) {
            node.childNodes.forEach((node, nodeIndex) => {
              let dontUseElm = false;
              if (node.nodeType === 3 || node.nodeType === 8) {
                dontUseElm = true
              }

              if (!dontUseElm) {
                // if (node.getAttribute(`data-kat-for`)) {
                //   const args = node.getAttribute(`data-kat-for`).split('of');
                //   const forDataSelector = args[1].trim();
                //   const forItemSelector = args[0].trim();

                //   const forData = this.bindExpressions(forDataSelector, name);
                //   let funcData;

                //   // Handle functionl data
                //   if (typeof forData === 'function') {
                //     const componentData = {...this.component[name].dataProxy.store, ...this.component[name].propsProxy.store};
                //     const func = forData.toString().substring(13, forData.toString().length - 1);
                //     const funcReturn = new Function('$data', func);
                //     funcData = funcReturn(componentData);
                //   }
              

                //   // console.log(forData);
                //   // const data = this.component[name].dataProxy.store[forDataSelector];


                //   if (forData || typeof forData === 'function') {
                //     // console.log(`Is function: ${typeof forData === 'function'}`)
                //     let dataCount = forData.length;
                //     const cloneElm = node.cloneNode(true);
  
                //     let newHTML = '';

                //     if (funcData) {
                //       dataCount = funcData.length;
                //     }
  
                //     for (let i = 0;i < dataCount;i++) {
                //       let forHtml = cloneElm.outerHTML;
                //       forHtml = forHtml.replace(`data-kat-for="${node.getAttribute(`data-kat-for`)}"`, `itteration="${i}" dataSelector="${forDataSelector}" itemSelector="${forItemSelector}"`);

                //       const regex = /(?<=\{{)(.*?)(?=\s*}})/g;
                //       const expressions = forHtml.match(regex);
  
                //       // console.log(expressions);
                //       if (expressions) {
                //         expressions.forEach((forExp) => {
                //           const forExpression = forExp.trim().replace(forItemSelector, `${forDataSelector}[${i}]`);

                //           if (typeof forData === 'function') {
                //             // If it's functional data, just insert the function's return data, rather than prepare it for the expression method;

                //             const exp = forExp;

                //             if(exp.indexOf('.') > -1){
                //               let expArray = exp.split('.');
                //               let currentData = funcData;
                      
                //               for(let x=1;x<expArray.length + 1;x++){
                //                 if(x === expArray.length){
                //                   // Possibly has a bug for rendering multiple expressions in the same element
                //                   try{
                //                     // console.log(data, exp, currentData[expArray[i]]);
                //                     forHtml = forHtml.replace(`{{${exp}}}`, currentData);
                //                   }
                //                   catch{
                //                     forHtml = forHtml.replace(`{{${exp}}}`, '');
                //                   }
                //                 }else{
                //                   try{
                //                     currentData = currentData[i][expArray[x]];
                //                   }
                //                   catch{
                //                     currentData = '';
                //                   }
                //                 }
                //               }
                //             } else {
                //               forHtml = forHtml.replace(`{{${forItemSelector}}}`, funcData[i]);
                //             }
                //           } else {
                //             forHtml = forHtml.replace(`{{${forExp}}}`, `{{${forExpression}}}`);
                //           }
                //         })
                //       } else {
                //         if (typeof forData === 'function') {
                //           // If it's functional data, just insert the function's return data, rather than prepare it for the expression method;
                //           forHtml = forHtml.replace(`{{${forItemSelector}}}`, funcData[i]);
                //         } else {
                //           forHtml = forHtml.replace(`{{${forItemSelector}}}`, `{{${forDataSelector}[${i}]}}`);
                //         }
                //       }                      
                      
                //       newHTML += forHtml;
                //     }
  
                //     node.parentNode.replaceChild(document.createRange().createContextualFragment(newHTML), node);
                //   }
                  
                // }
              }
            });
          }

          // const isComponent = katsuMeta.component;
          const isClickable = node.getAttribute(`data-kat-click`);
          const isKeyable = node.getAttribute(`data-kat-key`);
          const isSyncable = node.getAttribute(`data-kat-sync`);
          const isKatsuClass = node.getAttribute(`data-kat-class`);
          const isKatsuSwitch = node.getAttribute(`data-kat-switch`);
          const isKatsuCase = node.getAttribute(`data-kat-case`);
          // const isKatsuSrc = node.getAttribute(`data-kat-src`);
          const isChangeable = node.getAttribute(`data-kat-change`);
          const isEditable = node.getAttribute(`data-kat-editable`);
          // const isKatsuFor = node.getAttribute('itteration');
          const isKatsuIf = node.getAttribute('data-kat-if');
          const isKatsuElse = node.getAttribute('data-kat-else');
          const removeElm = node.getAttribute('remove-elm');
          const isKatsuFor = node.getAttribute(`data-kat-for`);
          
          // If node is a component
          Object.keys(this.modules).forEach((module) => {
            const moduleName = module.toLowerCase();
            if (node.tagName.toLowerCase() === moduleName) {
              katsuMeta.component = {
                module: module,
                parent: name
              }
              // console.log('@@@@@@@@@@ Component @@@@@@@@@@', node.tagName.toLowerCase(), moduleName);
              if (!update) {
                // If component does not exist, set component properties
                // katsuMeta.component = {
                //   module: module,
                //   parent: name
                // }
                // this.setComponent(module, name);
              } else {
                // for (let i = 0;i < this.component[name].componentElms.length;i++) {
                //   const compName = this.component[name].componentElms[i];
                //   // console.log(compName, this.component[compName]);
                //   if (this.component[compName]) {
                //     if (!this.component[compName].updated) {
                //       katsuMeta.component = compName;
                //       this.component[compName].updated = true;
                //       break;
                //     }
                //   }


                //   this.component[compName].updated = true;
                // }
                  // katsuMeta.component = component;
              }
              // console.log(katsuMeta.component);


              // Move to prepareDom
              // if (katsuMeta.component) {
              //   console.log(katsuMeta.component);

              //   // Set Props, if any
              //   const parent = this.component[katsuMeta.component].parentComponent;

              //   Object.values(node.attributes).forEach((attr) => {
              //     if (attr.name.includes('data-kat-props')) {
              //       let propsData = {};
              //       const key = attr.name.split(':').pop();
              //       let value = attr.value;

              //       const forExpRegex = /(?<=\()(.*)(?=\))/g;

              //       propsData[key] = value

              //       // If vale a for expression
              //       if (katsuMetaIsFor) {
              //         if (attr.value.match(forExpRegex)) {
              //           const expValue = attr.value.match(forExpRegex)[0];
              //           const {itemSelector, dataSelector, itteration} = katsuMetaIsFor;
              //           if (expValue === itemSelector) {
              //             // console.log(this.component, parent);
              //             propsData[key] = this.component[parent].data[dataSelector][itteration]
              //           }
              //         }
    
              //       }

              //       this.component[katsuMeta.component].props = Object.assign({}, propsData, {});
              //     }

              //     // if (!this.component[katsuMeta.component].propsProxy.store) {
              //     //   this.setDataProxy('props', katsuMeta.component);
              //     // }
              //   }); 

              //   if (!this.component[katsuMeta.component].controllerSet) {
              //     this.setController(katsuMeta.component);
              //     this.component[katsuMeta.component].controllerSet = true;
              //   }
              // }
            }
          });

          

          // if (this.component[name].components) {
          //   Object.keys(this.component[name].components).forEach((componentName) => {
          //     if (componentName.toLowerCase() === node.tagName) {
          //       isComponent = true;
          //     }
          //   });
          // }

          // if (this.component[name].parent) {
            // Object.keys(this.component[name].components).forEach((componentName) => {
            
            //   if (componentName.toLowerCase() === node.tagName) {
            //     isComponent = true;
            //   }
            // });
          // }

          if (isKatsuIf) {
            node.removeAttribute(`data-kat-if`);
          }

          if (isKatsuElse) {
            node.removeAttribute(`data-kat-else`);
          }

          // Check if parent is for directive
          // console.log('### parentNode ###', node.parentNode);
          // if (node.parentNode.katsuMeta) {
          //   console.log('### parentNode Options ###', node.parentNode.katsuMeta);
          //   if (node.parentNode.katsuMeta.isFor) {
          //     katsuMeta.isFor = node.parentNode.katsuMeta.isFor;
          //   }
          // }

          if (isClickable) {
            const regex = /(?<=\()(.*?)(?=\s*\))/g;
            const args = isClickable.match(regex);
            katsuMeta.clickable = { 
              event: isClickable.split('(')[0],
              args
            }

            node.removeAttribute('data-kat-click');
          }

          if (isKeyable) {
            const regex = /(?<=\()(.*?)(?=\s*\))/g;
            const args = isKeyable.match(regex);
            katsuMeta.clickable = { 
              event: isKeyable.split('(')[0],
              args
            }

            node.removeAttribute('data-kat-key');
          }

          if (isEditable) {
            const regex = /(?<=\()(.*?)(?=\s*\))/g;
            const args = isEditable.match(regex);

            katsuMeta.editable = {
              event: isEditable.split('(')[0],
              args
            }

            node.setAttribute('contentEditable', true);
            node.removeAttribute('data-kat-editable');
          }

          if (isChangeable) {
            const regex = /(?<=\()(.*?)(?=\s*\))/g;
            const args = isChangeable.match(regex);

            katsuMeta.changeable = { 
              event: isChangeable.split('(')[0],
              args
            }

            node.removeAttribute('data-kat-change');
          }

          if (isKatsuClass) {
            const dataSelector = node.getAttribute(`data-kat-class`);
            const isForElement = this.component[name].isFor;

            const data = isForElement ? this.component[name].data[isForElement.forDataSelector][dataSelector] : this.component[name].data[dataSelector];
            const dataType = typeof data;

            switch (dataType) {
              case 'string':
                node.classList.add(data)
                break;
              case 'object':
                if (Array.isArray(data)) {
                  node.classList.add(...data);
                } else {
                  let activeClasses = [];
                  Object.keys(data).map((katsuClass) => {
                    if (Boolean(data[katsuClass])) {
                      activeClasses.push(katsuClass)
                    }
                  });

                  node.classList.add(...activeClasses);
                }
                
                break;
            }

            node.removeAttribute(`data-kat-class`);
          }

          // Move to prepareDom
          if (isKatsuSwitch) {
            const regex = /(?<=\()(.*?)(?=\s*\))/g;
            const arg = isKatsuSwitch.match(regex)[0];

            const removeNode = (node, target) => {
              const traverseTree = (node, target) => {
                if (node.getAttribute('data-kat-case')) {
                  if (node.getAttribute('data-kat-case') !== target) {
                    node.setAttribute('remove-element', true);
                  }
                }

                if (node.children) {
                  for(let child of node.children) {
                    traverseTree(child, target);
                  }
                }
              }
              traverseTree(node, target);
            }

            let data = null;

            if (arg.includes('.')) {
              let baseData = this.component[name].data;
              arg.split('.').forEach((argData) => {
                baseData = baseData[argData]
              });
              data = baseData;
            } else {
              data = this.component[name].data[arg];
            }

            removeNode(node, data);

            node.querySelectorAll('[remove-element]').forEach((removeElm) => {
              removeElm.parentNode.removeChild(removeElm);
            });

            node.removeAttribute(`data-kat-switch`);
          }

          if (isKatsuCase) {
            node.removeAttribute(`data-kat-case`);
          }

          // if (isKatsuSrc) {
          //   const regex = /(?<=\()(.*?)(?=\s*\))/g;
          //   const arg = isKatsuSwitch.match(regex)[0];
          //   let data = null;

          //   if (arg.includes('.')) {
          //     let baseData = this.component[name].data;
          //     arg.split('.').forEach((argData) => {
          //       baseData = baseData[argData]
          //     });
          //     data = baseData;
          //   } else {
          //     data = this.component[name].data[arg];
          //   }

          //   if(this.component[name].isFor){
          //     elms = document.querySelectorAll(`[data-kat-src="${attr.value}"]`)[index];
          //     elms.setAttribute('src', data);
          //   }else{
          //     elms = document.querySelectorAll(`[data-kat-src="${attr.value}"]`);
          //     for(let elm of elms){
          //       elm.setAttribute('src', data);
          //     }
          //   }

          // }

          if (isKatsuFor) {
            const args = isKatsuFor.split('of');
            const forDataSelector = args[1].trim();
            const forItemSelector = args[0].trim();

            katsuMeta.isFor = {
              dataSelector: forDataSelector,
              itemSelector: forItemSelector,
              component: name
            };
          }

          // Move to prepareDom


          // Check for bindables

          let bindDataKeys = [];
          [...node.attributes].forEach((attr) => {
            if (attr.name.includes('data-kat-bind')) {
              bindDataKeys.push(attr.name);
            }
          });

          if (bindDataKeys) {
            katsuMeta.bindable = {};
            katsuMeta.bindable.attrs = [];

            bindDataKeys.forEach((key) => {
              const propsDataValue = node.getAttribute(key);

              katsuMeta.bindable.attrs.push({ 
                selector: key.split(':')[1],
                component: name,
                value: propsDataValue
              });

              node.removeAttribute(key)

            });
          }

          if (isSyncable) {
            // syncDataKeys.forEach((key) => {
              const propsDataValue = node.getAttribute(`data-kat-sync`); 
              if (propsDataValue) {
                let syncValue = null;

                if (katsuMeta.isFor) {
                  syncValue = this.bindExpressions(`${katsuMeta.isFor.dataSelector}[${katsuMeta.isFor.itteration}].${propsDataValue.split('.').slice(1).join('.')}`, name);
                  
                  katsuMeta.syncable = { 
                    selector: `${katsuMeta.isFor.dataSelector}[${katsuMeta.isFor.itteration}].${propsDataValue.split('.').slice(1).join('.')}`,
                    component: name,
                    value: syncValue
                  }
                } else {
                  syncValue = this.bindExpressions(propsDataValue, name);

                  katsuMeta.syncable = { 
                    selector: propsDataValue,
                    component: name,
                    value: syncValue
                  }
                }

                node.setAttribute('value', syncValue);
                node.removeAttribute('data-kat-sync')
              }
            // });
          }

          //Check for If directive
          node.childNodes.forEach((thisNode) => {
            let dontUseElm = false;
            if (thisNode.nodeType === 3 || thisNode.nodeType === 8) {
              dontUseElm = true
            }

            if (!dontUseElm) {
              const isKatsuIf = thisNode.getAttribute(`data-kat-if`);
              const isKatsuElse = thisNode.getAttribute(`data-kat-else`);

              if (isKatsuIf) {
                const regex = /(?<=\()(.*?)(?=\s*\))/g;
                const arg = isKatsuIf.match(regex)[0];
                let data = null;
    
                if (arg.includes('.')) {
                  let baseData = this.component[name].data;
                  arg.split('.').forEach((argData) => {
                    baseData = baseData[argData]
                  });
                  data = baseData;
                } else {
                  data = this.component[name].data[arg];
                }

                if (!Boolean(data)) {
                  // node.removeChild(thisNode);
                  thisNode.setAttribute('remove-elm', true);
                }
              }

              if (isKatsuElse) {
                const prevSibling = thisNode.previousElementSibling;
                if (prevSibling.getAttribute(`data-kat-if`) && !prevSibling.getAttribute(`remove-elm`) ) {
                  // node.removeChild(thisNode);
                  thisNode.setAttribute('remove-elm', true);
                }
              }
            }
          });

          if (removeElm) {
            katsuMeta.removed = true;
            node.removeAttribute('remove-elm');

            node.childNodes.forEach((thisNode) => {
              let dontUseElm = false;
              if (thisNode.nodeType === 3 || thisNode.nodeType === 8) {
                dontUseElm = true
              }
  
              if (!dontUseElm) {
                if (thisNode) {
                  thisNode.setAttribute('remove-elm', true);
                }
              }
            });
          }
        }

        // Run through the node's attributes and set directives.
        // this.directives is no longer required and needs removing, after all functions inside is moved out to their apporite stages
        // this.directives(node, null, name, type, index, this.currentIteration, domRoot)
        let map, thisNode = node.textContent.trim(), emptyArray = [];

        map = {
          type: node.nodeType === 3 ? 'text' : (node.nodeType === 1 ? node.tagName.toLowerCase() : (node.nodeType === 8 ? 'comment' : null)),
          // content: node.childNodes && node.childNodes.length > 0 ? null : (/{{(.*?)}}/g.test(node.textContent) ? this.expressions(node.textContent, name) : node.textContent),
          content: node.childNodes && node.childNodes.length > 0 ? null :  node.textContent,
          attr: node.attributes ? this.buildAttributes(node.attributes) : (node.nodeType === 8 ? emptyArray : null),
          node: node,
          children: buildVNodes(node, katsuMeta.isFor),
          katsuMeta,
        }

        return map

      }));

    }

    return buildVNodes(htmlobject);

  };

  virtualDom(dom, name, update = false, root){
    let builtDom = this.buildVDom(dom, name, update, root);
    // this.forLoop = [];
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
    // console.log($target, name, value);
    // var regex = /(?<={{)(.*?)(?=\s*}})/g;
    // let expressions = value.match(regex);

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

  removeOp($target, name){
    $target.removeAttribute(name);
  }

  setOp($target, name, value){
    $target.katsuMeta[name] = value;
  }

  setOps(root, props){
    Object.keys(props).forEach(name => {
      let attr = name
      let value = props[name];

      this.setOp(root, attr, value)
    })
  }

  updateOption(root, name, newVal, oldVal){
    if (!newVal) {
      this.removeAttr(root, name);
    } else if (!oldVal || newVal !== oldVal) {
      this.setOp(root, name, newVal);
    }
  }

  updateOptions(root, newOps, oldOps){
    let newProps = newOps ? newOps : {};
    let oldProps = oldOps ? oldOps : {};
    const props = Object.assign({}, newAttrs, oldAttrs);

    Object.values(props).forEach((name, i) => {
      let valName = Object.keys(name)[0];
      let newVal = newProps[i] ? Object.values(newProps[i])[0] : null;
      let oldVal = oldProps[i] ? Object.values(oldProps[i])[0] : null;
      this.updateOption(root, valName, newVal, oldVal);
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

    if(node.katsuMeta){
      $el.katsuMeta = {};
      this.setOps($el, node.katsuMeta);
    }

    // node.testAttr = 'xxxxxxxxxxxxxxxxxxxx';

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

        if (newNode.katsuMeta) {
          if(newNode.katsuMeta.length > 0){
            this.updateOptions(root.childNodes[index], newNode.attr, oldNode.attr);
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

  setDomListeners(root){
    const component = this.component;

    const getData = (data, viewName, isFor) => {
      var dataPath;
      let dataArray = data.split('.')

      // This is possible required
      const findRoot = () => {}

      let thisParentComponentData;

      if (isFor) {
        const parent = component[viewName].parent
        const {dataSelector, itteration} = isFor;
        thisParentComponentData = component[parent].data[dataSelector][itteration]
      }

      if(data.indexOf('.') > -1){
        for(let i = 0;i<dataArray.length;i++){
          if(i === 0){
            if(component[viewName].data[topObj]){
              dataPath = component[viewName].data[topObj][index];
            }else{

            }
          }else{
            dataPath = dataPath[dataArray[i]];
          }

        }
      }else{
        dataPath = thisParentComponentData ?? component[viewName].data[data];
      }

      return dataPath;
    }

    const setClickEvent = (target, event, arg, viewName, forIndex) => {
      const hasEvent = target.katsuMeta.clickable.hasListener;
      if(!hasEvent){
        target.addEventListener('click', (e) => {
          const func = component[viewName].events[event];
          let newArgs = [];
          const args = arg[0].split(',');

          for(let i = 0;i<args.length;i++){
            if(/\'(.*?)\'/g.test(args[i])){
              const val = args[i].trim();
              const trimed = val.substr(1, val.length-2);

              newArgs.push(trimed);
            }
            // } else {
              if(getData(args[i], viewName)){
                newArgs.push(getData(args[i], viewName, forIndex));
              } else {
                newArgs.push(this.getEventValues(target, viewName, forIndex, args[i]));
              }
            // }
          }

          let thisEventArgs = [];

          thisEventArgs.push(e);

          if (newArgs) {
            thisEventArgs.push(...newArgs);
            // Object.values(newArgs[0]).forEach((newArg) => {
            //   if (newArg) {
            //     thisEventArgs.push(newArg);
            //   }
            // });
          }

          try{
            if(func){
              func(...thisEventArgs);
            }else{
              throw(`Cannot find event ${event}`)
            }
          }
          catch(e){
            console.error(e)
          }
        });

        target.katsuMeta.clickable.hasListener = true;
      }

    }



    const setKeyEvent = (target, event, arg, viewName, isFor = null) => {
      const hasEvent = target.katsuMeta.keyable.hasListener;
      if(!hasEvent){
        target.addEventListener('keydown', (e) => {
            const func = component[viewName].events[event];
            var newArgs = {};
            let args = arg[0].split(',');

            for(let i = 0;i<args.length;i++){
              if(/\'(.*?)\'/g.test(args[i])){
                let val = args[i].trim();
                let trimed = val.substr(1, val.length-2);
                newArgs['args'] = trimed;
              }else{
                newArgs = this.getEventValues(target, viewName, isFor, args[i]);
              }
            }

            let thisEventArgs = [];

            thisEventArgs.push(e);
  
            if (newArgs) {
              Object.values(newArgs[0]).forEach((newArg) => {
                if (newArg) {
                  thisEventArgs.push(newArg);
                }
              });
            }
  
            try{
              if(func){
                func(...thisEventArgs);
              }else{
                throw(`Cannot find event ${event}`)
              }
            }
            catch(e){
              console.error(e);
            }


        })

        target.katsuMeta.keyable.hasListener = true;
      }
    }

    const setSyncEvent = (target) => {
      const hasEvent = target.katsuMeta.syncable.hasListener;
      const {selector, component} = target.katsuMeta.syncable;

      if(!hasEvent){
        target.addEventListener('input', (e) => {
          // Deep nesting solution
          if (selector.indexOf('.') > -1) {
            const set = (path, value) => {
              let schema = this.component[component].dataProxy.store;
              const pList = path.split('.');
              const len = pList.length;
              for(var i = 0; i < len-1; i++) {
                  var elem = pList[i];
                  if( !schema[elem] ) schema[elem] = {}
                  schema = schema[elem];
              }
          
              schema[pList[len-1]] = value;
            }

            set(selector, e.target.value);
          } else {
            this.component[component].dataProxy.store[selector] = e.target.value;
          }

          
        });

        target.katsuMeta.syncable.hasListener = true;
      }

      target.value = this.bindExpressions(selector, component)
    }

    const setChangeEvent = (target, event, arg, viewName, isFor = null) => {
      const hasEvent = target.katsuMeta.changeable.hasListener;
      if(!hasEvent){
        target.addEventListener('change', (e) => {
          const func = component[viewName].events[event];
          let newArgs = [];
          const args = arg[0].split(',');

          for(let i = 0;i<args.length;i++){
            if(/\'(.*?)\'/g.test(args[i])){
              const val = args[i].trim();
              const trimed = val.substr(1, val.length-2);

              newArgs.push(trimed);
            } else {
              if(getData(args[i], viewName)){
                newArgs.push(getData(args[i], viewName, isFor));
              } else {
                newArgs.push(this.getEventValues(target, viewName, isFor, args[i]));
              }
            }
          }



          let thisEventArgs = [];

          thisEventArgs.push(e);

          if (newArgs) {
            Object.values(newArgs[0]).forEach((newArg) => {
              if (newArg) {
                thisEventArgs.push(newArg);
              }
            });
          }

          try{
            if(func){
              func(...thisEventArgs);
            }else{
              throw(`Cannot find event ${event}`)
            }
          }
          catch(e){
            console.error(e)
          }
        });

        target.katsuMeta.changeable.hasListener = true;
      }

    }

    const setEditiableEvent = (target, event, arg, viewName, isFor = null) => {
      const hasEvent = target.katsuMeta.editable.hasListener;
      if (!hasEvent) {
        target.addEventListener('input', (e) => {
          const func = component[viewName].events[event];
          let newArgs = {};
          const args = arg[0].split(',');

          for(let i = 0;i<args.length;i++){
            if(/\'(.*?)\'/g.test(args[i])){
              let val = args[i].trim();
              let trimed = val.substr(1, val.length-2);
              newArgs['args'] = trimed;
            }else{
              newArgs = this.getEventValues(target, viewName, isFor, args[i]);
            }
          }

          let eventArgs = [];

          eventArgs.push(e);

          if (newArgs) {
            eventArgs = [eventArgs[0], newArgs]
          }
          
          try{
            if(func){
              func(...eventArgs);
            }else{
              throw(`Cannot find event ${event}`)
            }
          }
          catch(e){
            console.error(e);
          }
        });
      }

      target.katsuMeta.editable.hasListener = true;
    }

    const findParentComponent = (node) => {
      let foundComponent = null;

       const traverseUpTree = (node) => {
        if (!foundComponent) {
          if (node.katsuMeta?.component) {
            foundComponent = node.katsuMeta.component;
          } else {
            traverseUpTree(node.parentNode);
          }
        }
       }

      traverseUpTree(node)

      return foundComponent;
    };

    const traverseTree = (node) => {
      if (node.katsuMeta) {
        Object.keys(node.katsuMeta).map((option) => {
          let component = null;
          let hasForIndex = null;
  
          switch (option) {
            case ('component'):
              // console.log('@@ component @@');
              // node.componentName = option.value;
              // console.log('Testing ', node.katsuMeta.component);
  
              break;
            case ('clickable'):
              component = findParentComponent(node);
              const clickable = node.katsuMeta.clickable;
              // hasForIndex = node.katsuMeta.forIndex;
              setClickEvent(node, clickable.event, clickable.args, component.module, clickable.forIndex);
              break;
            case ('keyable'):
              component = findParentComponent(node);
              const keyable = node.katsuMeta.keyable;
              hasForIndex = node.katsuMeta.forIndex;
              setKeyEvent(node, keyable.event, keyable.args, component.module, hasForIndex);
              break;
            case ('syncable'):
              component = findParentComponent(node);
              const syncable = node.katsuMeta.syncable;
              hasForIndex = node.katsuMeta.forIndex;
              setSyncEvent(node, syncable);
              break;
            case ('changeable'):
              component = findParentComponent(node);
              const changeable = node.katsuMeta.changeable;
              hasForIndex = node.katsuMeta.forIndex;
              setChangeEvent(node, changeable.event, changeable.args, component.module, hasForIndex);
              break;
            case ('editable'):
              component = findParentComponent(node);
              const editable = node.katsuMeta.editable;
              hasForIndex = node.katsuMeta.forIndex;
              setEditiableEvent(node, editable.event, editable.args, component.module, hasForIndex);
              break;
          }
        });
      }

      if (node.removeNode) {
        node.parentNode.removeChild(node);
      }

      if (node.childNodes) {
        for(let child of node.childNodes) {
          if (child.childNodes) {
            traverseTree(child);
          }
        }
      }
  
    };

    traverseTree(root)

  }

  dataWatch (path, oldData, newData, name) {
    const func = this.component[name].watch[path];
    if (func) {
      func(oldData, newData);
    }
  }

  /**
  * Set Component's Data Proxy
  * Proxy concept referenced from Chris Ferdinandi's reef.js, special thanks.
  */

  setDataProxy (storeType, name, childComponent = null) {
    let _data;
    let _props;
    let _state;
    // let data;
    // let props;
    // let state;

    if (name) {
      _data = this.component[name].data ? wrap(this.component[name].data, 'data', console.log) : null;
      _props = this.component[name].props ? wrap(this.component[name].props, 'props', console.log) : null;
    } else {
      if (storeType === 'stateMethods') {
        _state = this.state ? wrap(this.state, 'stateMethods', console.log) : null;
      }
    }

    const updateData = this.updateData.bind(this);
    const dataWatch = this.dataWatch.bind(this);

    var trueTypeOf = function (obj) {
      return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    };

    function wrap(o, type, fn, scope = []) {
      let dataObject = o;
      // let wrapPath = [];
      // Force update Proxy
        const handler = {
          get(target, prop, receiver) {
            // fn('get value in scope: ', scope.concat(prop));
            if (['object', 'array'].indexOf(trueTypeOf(target[prop])) > -1) {
              // wrapPath.push(prop);
      				return new Proxy(target[prop], handler);
      			}

            return target[prop];
          },
          set(target, prop, value, receiver) {
            // wrapPath = []; //wrapPath is 
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

            const oldVal = target[prop];
            const newVal = value;

            target[prop] = value;

            // Data update is firing twice when using updating with sync directive

            if (typeof obj[pathArray] === 'object') {

              // console.log('===== Update Data =====');
              // console.log(target);

              // obj[pathArray] = target;
              // console.log(obj, pathArray, target)

              // updateData(obj, name, null, type);
            } else {
              // Update component's Data
              // console.log('===== Update Data 2 =====');
              // updateData(obj, name, null, type);
            }

            updateData(obj, name, null, type);

            if (name) {
              if (oldVal !== newVal) {
                // let watchPath = [];
  
                // if (wrapPath.length > 0) {
                //   watchPath = wrapPath;
                // } else {
                //   watchPath = pathArray
                // }

    
  
                dataWatch(pathArray.join('.'), target[prop], value, name);
              }
            }

            return true
          }

        }

      Object.keys(dataObject).forEach((data) => {
        if (!dataObject[data]) {
          delete dataObject[data];
        }
      });

      return new Proxy(
        Object.keys(dataObject).reduce((result, key) => {
          if (isObject(dataObject[key])) {
            result[key] = wrap(dataObject[key], type, fn, scope.concat(key))
          } else {
            result[key] = dataObject[key]
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
    if(_state) {
      if (storeType === 'stateMethods') {
        Object.defineProperty(this.stateProxy, 'state', {
          get: function(){
            return state
          },
          set: function(data){
            _state.state = wrap(data, 'state', console.log);
            return true
          }
        })
      }
    } else {
      if (_data && storeType == 'data') {
        Object.defineProperty(this.component[name].dataProxy, 'store', {
          get: function(){
            return _data
          },
          set: function(e){
            _data = wrap(e, 'data', console.log);
            return true
          }
        })
      }

      if (_props && storeType == 'props') {
        Object.defineProperty(this.component[name].propsProxy, 'store', {
          get: function(){
            return _props
          },
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

  findNode(node, name, target){
    let foundNode = null;

    const traverseTree = (node, name, target) => {
      if (node.katsuMeta) {
        if (node.katsuMeta[name] === target) {
          foundNode = node;
        }
  
        if (!foundNode) {
          if (node.children) {
            for(let child of node.children) {
              if (child.children && !foundNode) {
                traverseTree(child, name, target);
              }
            }
          }
        }
      } else {
        if (!foundNode) {
          if (node.children) {
            for(let child of node.children) {
              if (child.children && !foundNode) {
                traverseTree(child, name, target);
              }
            }
          }
        }
      }
    }


    traverseTree(node, name, target);

    return foundNode;
  }

  updateData (data, target, watchPath, type = 'data') {
    // Set Data
    this.prevComponent = {};

    if(type === 'data'){
      this.component[target].data = Object.assign({}, this.component[target].data, this.component[target].dataProxy.store);
    }else{
      this.state = Object.assign({}, this.state, data);
    }

    // if (this.component[target].initialized) {
    if (this.initialized) {
      if (this.component[target].lifecycle.preUpdate) {
        this.component[target].lifecycle.preUpdate(target);
      }

      let domparser = new DOMParser();

      // Does Component exist before update
      // const prevCurrentDom = domparser.parseFromString(this.currentDom, 'text/html').querySelector('body').innerHTML;
      // const prevExistingComponent = this.findNode(this.currentDom, 'component', target);

      Object.keys(this.component).forEach((component) => {
        this.component[component].updated = false;
      });

        // Generate Root View
      // Object.keys(this.component).forEach((target) => {
      //   if (!this.component[target].parent) {
      //     // Build Template
      //     // Set non-root Modules in buildVDom
      //     const htmlContent = this.virtualDom(this.component[target].template, target, true, null);
      //     this.component[target].vDomNew = htmlContent;
      //     this.rootTemplate = htmlContent;
      //   } else {
      //     // Generate non-root View
      //     const htmlContent = this.virtualDom(this.component[target].template, target, true, null);
      //     this.component[target].vDomNew = htmlContent;
      //   }
      // });


      // Generate view of newly created instances
      // Object.keys(this.component).forEach((target) => {
      //   if (!this.component[target].vDomNew) {
      //     const htmlContent = this.virtualDom(this.component[target].template, target, true, null);
      //     this.component[target].vDomNew = htmlContent;
      //   }
      // });

      const htmlContent = this.virtualDom(this.component[target].template, target, true, null);
      this.component[target].vDomNew = htmlContent;

      const templateDom = this.prepareDom(htmlContent);

      this.updateDom(this.root, templateDom, this.currentDom);
      this.currentDom = templateDom;


      // If new component found after updateDom then fire Created lifecycle event
      // console.log(prevExistingComponent, existingComponent);
      // if (this.component[target].disabled) {
      //   this.component[target].disabled = false;
      //   if (this.component[target].lifecycle.created) {
      //     this.component[target].lifecycle.created();
      //   }
      // }


      // Does Component exist after update
      // const currentUpdateDom = domparser.parseFromString(this.currentDom, 'text/html').querySelector('body').innerHTML;
      // const existingComponent = this.findNode(this.currentDom, 'component', target);

      // console.log('#### Component after update ####');
      // console.log(this.currentDom);
      // console.log(target);
      // console.log(existingComponent);

      this.setDomListeners(this.root);
    }
  }

  prepareDom(vDomTemplate) {
    // Modify the vDOM and set components here?
    let vDom = Object.assign({}, vDomTemplate[0]);

    const forNode = (forMeta, forNode, forNodeUpdated) => {
      const { itemSelector, dataSelector, component } = forMeta;
      let forData = this.bindExpressions(dataSelector, component);
      let newNodes = [];

      let funcData;

      const thisNode = JSON.parse(JSON.stringify(forNode)); // Deep clone forNode

      // Handle functionl data
      if (typeof forData === 'function') {
        const componentData = {...this.component[thisNode.katsuMeta.isFor.component].dataProxy.store, ...this.component[thisNode.katsuMeta.isFor.component].propsProxy.store};
        const func = forData.toString().substring(13, forData.toString().length - 1);
        const funcReturn = new Function('$data', func);
        forData = funcReturn(componentData);
      }

      if (forData || typeof forData === 'function') {
        // console.log(`Is function: ${typeof forData === 'function'}`)
        let dataCount = forData.length;

        // if (funcData) {
        //   dataCount = funcData.length;
        // }

        for (let i = 0;i < dataCount;i++) {
          let cloneElm = JSON.parse(JSON.stringify(thisNode)); // Deep Clone thisNode

          // let forHtml = cloneElm.outerHTML;
          // forHtml = forHtml.replace(`data-kat-for="${node.getAttribute(`data-kat-for`)}"`, `itteration="${i}" dataSelector="${forDataSelector}" itemSelector="${forItemSelector}"`);

          // console.log(i, thisNode, cloneElm);


          // const forItemSelector = node.attr['data-kat-for'].split(' of ')[0];
          // const forDataSelector = node.attr['data-kat-for'].split(' of ')[1];

          let forItemSelector;
          let forDataSelector;

          cloneElm.attr.forEach(attr => {
            if (Object.keys(attr)[0] === 'data-kat-for') {
              const forVals = Object.values(attr)[0].split(' of ');
              forItemSelector = forVals[0];
              forDataSelector = forVals[1];
            }
          });

          cloneElm.attr = cloneElm.attr.filter(attr => Object.keys(attr)[0] !== 'data-kat-for');

          cloneElm.attr.push({'itteration': `${i}`});
          cloneElm.attr.push({'dataSelector': forDataSelector});
          cloneElm.attr.push({'itemSelector': forItemSelector});

          const regex = /(?<=\{{)(.*?)(?=\s*}})/g;
          // const expressions = cloneElm.attr['dataSelector'].match(regex);

          // cloneElm.attr.forEach(attr => {
          //   console.log('1@@@@@@@@@@@@@@', Object.keys(attr))
          //   if (Object.keys(attr)[0] === 'dataSelector') {
          //     console.log('2@@@@@@@@@@@@@@', regex);
          //     console.log('3@@@@@@@@@@@@@@', Object.values(attr)[0])
          //     expressions = Object.values(attr)[0].attr['dataSelector'].match(regex);
          //   }
          // });

          let expressions = cloneElm.content ? cloneElm.content.match(regex) : null;

          // console.log('=======================');
          // console.log(forDataSelector, forItemSelector, i);
          // console.log('expressions', expressions);
          // console.log('=======================');


          // TODO: Remove all functions related to or uses "funcData"
          const findAndReplaceExpressions = (nodes, data, index) => {
            nodes.forEach((node, x) => {
              if (node.katsuMeta.clickable) {
                node.katsuMeta.clickable.forIndex = i; 
              }

              if (node.katsuMeta.bindable) {
                node.katsuMeta.bindable.forIndex = i;

                node.katsuMeta.bindable.attrs.forEach((attr) => {
                  if(attr.value.indexOf('.') > -1){
                    let expArray = attr.value.split('.');
                    let currentData;
  
                    for(let y=1;y<expArray.length;y++){
                      if(y === expArray.length - 1){
                        let newAttr = {};
                        // Possibly has a bug for rendering multiple expressions in the same element
                        try{
                          // console.log(data, exp, currentData[expArray[i]]);
                          newAttr[attr.selector] = data[expArray[y]];
                        }
                        catch{
                          newAttr[attr.selector] = '';
                        }
                        node.attr.push(newAttr)
                      }else{
                        try{
                          currentData = data[expArray[y]];
                        }
                        catch{
                          currentData = '';
                        }
                      }
                    }
                  } else {
                    let newAttr = {};
                    newAttr[attr.selector] = attr.value;
                    node.attr.push(newAttr)
                  }
                });
              }

              if (node.content) {
                const expressions = node.content.match(regex);

                if (expressions) {
                  expressions.forEach(expression => {
                    if (typeof data === 'function') {
                      // If it's functional data, just insert the function's return data, rather than prepare it for the expression method;

                      if(expression.indexOf('.') > -1){
                        let expArray = expression.split('.');
                        let currentData = funcData;

                        for(let y=1;y<expArray.length;y++){
                          if(y === expArray.length - 1){
                            // Possibly has a bug for rendering multiple expressions in the same element
                            let thisData = null;

                            thisData = currentData ?? data;
                            
                            try{
                              // console.log(data, exp, currentData[expArray[i]]);
                              nodes[x].content = node.content.replace(`{{${expression}}}`, currentData);
                            }
                            catch{
                              nodes[x].content = node.content.replace(`{{${expression}}}`, '');
                            }
                          }else{
                            try{
                              currentData = currentData[index][expArray[x]];
                            }
                            catch{
                              currentData = '';
                            }
                          }
                        }
                      } else {
                        if (nodes[x].content) nodes[x].content = node.content.replace(`{{${forItemSelector}}}`, funcData[index]);
                      }
                    } else {
                      if(expression.indexOf('.') > -1){
                        let expArray = expression.split('.');
                        let currentData = null;
 
                        for(let y=1;y<expArray.length;y++){
                          if(y === expArray.length - 1){
                            // Possibly has a bug for rendering multiple expressions in the same element
                            let thisData = null;

                            thisData = currentData ?? data;

                            try{
                              // console.log(data, exp, currentData[expArray[i]]);
                              nodes[x].content = node.content.replace(`{{${expression}}}`, thisData[expArray[y]]);
                            }
                            catch{
                              nodes[x].content = node.content.replace(`{{${expression}}}`, '');
                            }
                          }else{
                            try{
                              currentData = data[expArray[y]];
                            }
                            catch{
                              currentData = '';
                            }
                          }
                        }
                      } else {
                        if (nodes[x].content) nodes[x].content = node.content.replace(`{{${forItemSelector}}}`, `{{${forDataSelector}[${index}]}}`)
                      }

                    }
                  });
                }
              }


              if (nodes[x].children.length > 0) {
                nodes[x].children = findAndReplaceExpressions(node.children, data, i)
              }
            })

            return nodes;
          };

          // findAndReplaceExpressions() top level node
          cloneElm = findAndReplaceExpressions([cloneElm], forData[i], i);

          if (cloneElm[0].children.length > 0) {
            cloneElm[0].children = findAndReplaceExpressions(cloneElm[0].children, forData[i], i);
          }

          // if (expressions) {
          //   expressions.forEach((forExp) => {
          //     console.log(forExp);
          //     const forExpression = forExp.trim().replace(forItemSelector, `${forDataSelector}[${i}]`);


          // //   })
          // // } else {
          //   if (typeof forData === 'function') {
          //     // If it's functional data, just insert the function's return data, rather than prepare it for the expression method;
          //     // forHtml = forHtml.replace(`{{${itemSelector}}}`, funcData[i]);
          //     cloneElm.content = cloneElm.content.replace(`{{${forItemSelector}}}`, funcData[i])

          //   } else {
          //     // forHtml = forHtml.replace(`{{${itemSelector}}}`, `{{${dataSelector}[${i}]}}`);

          //     if (cloneElm.content) cloneElm.content = cloneElm.content.replace(`{{${forItemSelector}}}`, `{{${forDataSelector}[${i}]}}`)

          //     // node.attr = node.attr.map(attr => {
          //     //   if (Object.keys(attr) === 'itemSelector') {
          //     //     node.attr.forEach(attrData => {
          //     //       if (Object.keys(attrData) === 'dataSelector') {
          //     //         return {}
          //     //       }


          //     //     })
          //     //   }

          //     //   return attr;
          //     // });
    
          //   }
          // // }                      
          
          delete cloneElm[0].katsuMeta.isFor;

          cloneElm[0].katsuMeta.forIndex;

          newNodes.push(cloneElm[0]);
        }
      }

      return newNodes;
    }

    const findandReplaceComponent = (dom, target, component, componentName) => {
      console.log('===== findandReplaceComponent =====')
      console.log(dom, target, component, componentName)
      let foundDom = false;
      let updatedDom = {}

      const traverseTree = (dom) => {
        let newDom = dom;

        if (newDom && !foundDom) {
          newDom.children.forEach((child, i) => {
            if (child.katsuMeta.component === componentName) {
              // console.log(child.katsuMeta.component);
              // If the component's node meta is flagged for removal it will not be inserted into the VDOM, it is then considered to be removed / destroyed.
              // The component is flagged as "disabled" and is to be removed at the end of the prepareDom phase.
              if (!child.katsuMeta.removed) {
                newDom.children[i] = component;
                newDom.children[i].katsuMeta.component = componentName;
              } else {
                this.component[componentName].disabled = true;
              }

              foundDom = true;
            }

            if (!foundDom) {
              if (child.children.length > 0) {
                newDom.children[i] = traverseTree(child);
               }
            }
          });

          return newDom;
        }
      }

       if (dom.children) {
        updatedDom = traverseTree(dom)
       }

      return updatedDom;
    };

    const modifyNodes = (dom) => {
      let updatedDom = {}

      const traverseTree = (dom) => {
        let newDom = dom;

        if (newDom) {
          // console.log(newDom, newDom.katsuMeta);

          // Replace with comment node
          if (newDom.katsuMeta?.removed) {
            newDom = {
              attr: [],
              children: [],
              content: 'removed',
              katsuMeta: {},
              node: null,
              type: 'comment'
            };
          }

          newDom.children.forEach((child, i) => {
            if (child.children.length > 0) {
              newDom.children[i] = traverseTree(child);
            }
          });

          return newDom;
        }
      }

      if (dom.children) {
        return traverseTree(dom)
      }

      return dom;
    }

    // Duplicate isFor nodes 
    const forNodes = (dom) => {
      let updatedDom = Object.assign({}, dom);

      const traverseTree = (dom) => {
        let newDom = [];

        // console.log(newDom, newDom.katsuMeta);

        // Replace with comment node
        // Find For Node to duplicate

        if (dom.length > 0) {
          // newDom.children.forEach((node, i) => {
          //   console.log('===== node.katsuMeta =====');
          //   console.log(node, node.katsuMeta);
          //   if (node.katsuMeta?.isFor) {
          //     const newNodes = forNode(node.katsuMeta.isFor, node);
          //     newNodes.length > 1 ? newDom.children.splice(i, 1, ...newNodes) : newDom.children.splice(i, 1, newNodes);
          //   }
          // });

          // Duplicate isFor nodes 
          dom.forEach((node, i) => {
            // console.log(node);
              if (node.katsuMeta.isFor) {
                // console.log('@@@@@@@@@@@@@@ Duplicate isFor nodes @@@@@@@@@@@@@@')
                // console.log(node);
                const newNodes = forNode(node.katsuMeta.isFor, node);
                newNodes.length > 0 ? dom.splice(i, 1, ...newNodes) : dom.splice(i, 1);
              }

              if (node.children.length > 0) {
                return traverseTree(node.children);
              }
          });

          // Modify Node to replace expressions and 
          // dom.forEach((node, i) => {
          //   console.log(node, dom[i]);

          //   if (node.content) {
          //     (/{{(.*?)}}/g.test(node.content) ? this.expressions(node.content, name) : node.content)
          //   }

          //   if (node.children.length > 0) {
          //     traverseTree(node.children);
          //   }
          // });
        }


        // newDom.children.forEach((node, i) => {
        //   if (node.length > 0) {
        //     if (node.children.length > 0) {
        //       newDom.children[i] = traverseTree(node);
        //     }
        //   }
        // });

        return dom;

      }
      
      // console.log(dom);
      if (dom.children) {
        updatedDom.children = traverseTree(dom.children)
      }

      return updatedDom;
    }

    // Replace expressions with Data
    const expressionNodes = (dom) => {
      if (dom) {
        let updatedDom = Object.assign({}, dom);

        const traverseTree = (dom) => {
          if (dom.length > 0) {
            dom.forEach((node, i) => {
              if (node.content) {
                (/{{(.*?)}}/g.test(node.content) ? dom[i].content = this.expressions(dom[i].content, dom[i].katsuMeta.component.module) : dom[i].content)
              }
  
              if (node.children.length > 0) {
                return traverseTree(node.children);
              }
            });
          }
  
          return dom;
        }
        
  
        if (dom.children) {
          updatedDom.children = traverseTree(dom.children)
        }

        return updatedDom;
      }

      return dom;
    }

    // Replace Bindable with Data
    const bindableNodes = (dom) => {
      let updatedDom = Object.assign({}, dom);

      if (dom) {
        const traverseTree = (dom) => {
          if (dom.length > 0) {
            dom.forEach((node, i) => {
  
              if (node.katsuMeta.bindable) {
                if (node.katsuMeta.bindable.attrs.length > 0) {
                  const data = {...this.component[node.katsuMeta.component.module].dataProxy.store, ...this.component[node.katsuMeta.component.module].propsProxy.store};
  
                  node.katsuMeta.bindable.attrs.forEach((attr) => {
                    if(attr.value.indexOf('.') > -1){
                      let expArray = attr.value.split('.');
                      let currentData = null;
    
                      for(let y=0;y<expArray.length;y++){
                        let thisData = null;
  
                        thisData = currentData || data;
  
                        if(y === expArray.length - 1){
                          let newAttr = {};
                          // Possibly has a bug for rendering multiple expressions in the same element
                          try{
                            // console.log(data, exp, currentData[expArray[i]]);
                            newAttr[attr.selector] = thisData[expArray[y]];
                          }
                          catch{
                            newAttr[attr.selector] = '';
                          }
    
                          let attrExists = null;
                          attrExists = dom[i].attr.filter((domAttr) => Object.keys(domAttr)[0] === Object.keys(newAttr)[0]);
  
                          if (attrExists.length === 0) dom[i].attr.push(newAttr);
                        }else{
                          try{
                            currentData = thisData[expArray[y]];
                          }
                          catch{
                            currentData = '';
                          }
                        }
                      }
                    } else {
                      let attrExists = null;
                      let newAttr = {};
                      newAttr[attr.selector] = attr.value;
    
                      attrExists = dom[i].attr.filter((domAttr) => Object.keys(domAttr)[0] === Object.keys(newAttr)[0]);
    
                      if (!attrExists) dom[i].attr.push(newAttr)
                    }
                  });
                }
              }
  
              if (node.children.length > 0) {
                return traverseTree(node.children);
              }
            });
  

          }
  
          return dom;
  
        }

        if (dom.children) {
          updatedDom.children = traverseTree(dom.children)
        }

        return updatedDom;
        
      }

      return dom;
    }

    const componentNodes = (dom) => {
      let updatedDom = Object.assign({}, dom);
      let existingComponents = [];

      const findExistingComponents = (domNodes) => {
        domNodes.forEach((domNode) => {
          if (domNode.katsuMeta?.component?.name) {
            console.log('##### Found Component #####')
            console.log(domNode.katsuMeta.component.name);
            domNode.katsuMeta.component.name && existingComponents.push(domNode.katsuMeta.component.name)
          }
          if (domNode.childNodes.length > 1) {
            findExistingComponents(domNode.childNodes)
          }
        })
      }

      const createComponentNodes = (dom) => {
        console.log('createComponentNodes', 'start', dom);
        const traverseTree = (dom) => {
          if (dom.length > 0) {
            dom.forEach((node, i) => {
              Object.keys(this.modules).forEach((component, index) => {
                if (node.type === component.toLowerCase()) {
                  // console.log('========= Component Node =============')
                  // console.log(node);
  
                    // targetElm = document.querySelector(target);
                    //Set root component
                    const componentName = this.setComponent(node.katsuMeta.component.module);
                    const parentComponent = dom[i].katsuMeta.component.parent;
                    if (!this.component[parentComponent].childComponents) {
                      this.component[parentComponent].childComponents = [];
                    }
  
                    this.component[parentComponent].childComponents.push(componentName);
  
                    // targetElm.katsuMeta = {};
                    // targetElm.katsuMeta.component = componentName;
            
                    this.setController(componentName);
                    this.component[componentName].controllerSet = true;
            
                    // Build Template
                    // Set non-root Modules in buildVDom
                    const htmlContent = this.virtualDom(this.component[componentName].template, componentName, false, null);

                    this.component[componentName].vDomNew = htmlContent;
                    this.component[componentName].vDomBuilt = true;


  
                    dom[i].katsuMeta.component.name = componentName;

                    // console.log('====== Component prepareDom ======')
                    const templateDom = this.prepareDom(htmlContent)
                    console.log('createComponentNodes', 'after prepareDom', templateDom);

                    //Replace Component element in VDOM with compiled template
                }
              });

              // console.log('createComponentNodes', 'During traverseTree', node);

              if (node.children.length > 0) {
                return traverseTree(node.children);
              }
            });
          }
  
          return dom;
  
        }

        // console.log('createComponentNodes', 'Before traverseTree', dom.children);
        
  
        if (dom.children) {
          updatedDom.children = traverseTree(dom.children)
        }

        return updatedDom;
      }

      // findExistingComponents(document.querySelector('#root').childNodes);

      // Check if this vDom has already been built

      // console.log(this.root);


      // Find existing components if DOM has already been built
      if (this.root.childNodes.length > 0) {
        console.log(this.root.childNodes);
        this.root.childNodes.forEach((node) => {
          findExistingComponents(node.childNodes);
        })

        let componentsToBeDestoryed = [];
        let componentsToBeCreated = [];

        // If component is not found on DOM, but exists in component object, then destory component
        // Object.keys(this.component).forEach((component) => {
          existingComponents.forEach(existingComponent => {
            // Needs code here
            // component !== existingComponent && componentsToBeDestoryed.push(component);
            // console.log(Object.keys(this.component), existingComponent);
            if (!Object.keys(this.component).includes(existingComponent)) componentsToBeDestoryed.push(existingComponent);
          })
          

        // })


        // TODO: To be removed, I don't think this is required
        // If component is found on DOM, but does NOT exists in component object, then create component
        // existingComponents.forEach(existingComponent => {
          // Object.keys(this.component).forEach((component) => {
            // Needs code here
            // existingComponent !== component && componentsToBeCreated.push(component);
          //   if (!existingComponents.includes(component)) componentsToBeCreated.push(component);
          // })           
        // })
        // Run through componentsToBeDestoryed and componentsToBeCreated

        console.log('====== componentsToBeDestoryed / componentsToBeCreated ======');
        console.log(componentsToBeDestoryed);
        console.log(componentsToBeCreated);
        console.log(dom);

        updatedDom = createComponentNodes(dom)

        return updatedDom;


      } else {
        console.log('componentNodes', 'Component does not exists', dom)
        updatedDom = createComponentNodes(dom)

        console.log(updatedDom);

        return updatedDom;
      }

      // Create Component nodes using what components are available, in the right order.
      // Needs code here

      console.log('componentNodes', 'Nothing here', dom)
      console.log(dom)

      return dom;
    }

    // console.log('++++++++++++++++++++++++++');
    // console.log(vDom);

    // Duplicate Nodes in For loops
    vDom = forNodes(vDom);

    // console.log('forNodes', vDom);

    // Create and set components
    vDom = componentNodes(vDom);

    // console.log('componentNodes', vDom);

    // Set Expressions
    vDom = expressionNodes(vDom);

    // console.log('expressionNodes', vDom);

    // Set Bindables
    vDom = bindableNodes(vDom)

    // console.log('bindableNodes', vDom);

    // Any addtional modification to nodes
    vDom = modifyNodes(vDom);

    // console.log('modifyNodes', vDom);

    // console.log('root', vDomTemplate)
    // console.log('Perpared VDOM', vDom);


    // Set Component controllers here?
    // Set the contollers of the components that will be active when rendering is finished

    //Create Components


    // Remove any components that are flagged as "destroyed"
    Object.keys(this.component).forEach((componentName) => {
      // When this happens, fire the component's destoryed lifecycle event; If the component has one.
      // Once done, reset the component to it's initial state.
      if (this.component[componentName].disabled) {
        if (this.component[componentName].lifecycle.destroyed) {
          this.component[componentName].lifecycle.destroyed();
          const module = this.component[componentName].module;
          // Get Parent Component
          const parentComponent = this.component[componentName].parentComponent;
          this.component[componentName] = Object.assign({}, this.modules[module]);
          this.setComponent(module, parentComponent, componentName);
          this.component[componentName].disabled = true;
        }
      }
    });

    return vDom;
  }

  /**
  * Initise the App
  */
  init(func) {
    const stateMethods = () => {
      return {
        create: (args) => {
          this.state = args.state;
          // this.setStateProxy();
          this.setDataProxy('stateMethods', null, null)

          // console.log(this.stateStore.state);
          // console.log(args.getters);
          // console.log(args.setters);

          let returnObj = {};


          const paramsInit = {
            $state: this.state
          }

          const getters = args.getters;
          const setters = args.setters;
          const regex = /\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g

          let newGetter = {};
          let newSetter = {};

          Object.keys(getters).forEach((getter) => {
            const func = getters[getter];
            // console.log('Getter', getter);
            const augs = func.toString().match(regex)[0];
            const attr = [];
            const argsArray = augs.substr(1, augs.length - 2).split(',');

            argsArray.forEach((item, i) => {
              if (paramsInit[item.trim()]) {
                attr.push(paramsInit[item.trim()])
              }
            })
            
            newGetter[getter] = (ext) => {
              return (function(a, b) {
                return func(a, b);
              })(...attr, ext);
            }

          })

          Object.keys(setters).forEach((setter) => {
            const func = setters[setter];
            // console.log('Setter', setter);
            const augs = func.toString().match(regex)[0];
            const attr = [];
            const argsArray = augs.substr(1, augs.length - 2).split(',');

            // console.log(argsArray);

            argsArray.forEach((item, i) => {
              if (paramsInit[item.trim()]) {
                attr.push(paramsInit[item.trim()])
              }
            })
            
            newSetter[setter] = (ext) => {
              return (function(a, b) {
                return func(a, b);
              })(...attr, ext);
            }
          })

          returnObj = Object.assign({}, newGetter, returnObj)

          returnObj = Object.assign({}, newSetter, returnObj)

          this.stateMethods = returnObj;

          return returnObj;
        },
      }
    };

    const globalMethods = () => {
      return {
        ping: (selector = null) => {
          /* Force update all components */

          if (selector) {
            this.component[selector].ping()
          } else {
            Object.keys(this.component).forEach((name) => {
              if (this.component[name].ping) {
                this.component[name].ping()
              }
            })
          }
        }
      }
    }

    const initArgs = {
      $state: stateMethods(),
      $global: globalMethods()
    }

    const regex = /(?<=\()(.*?)(?=\s*\))/g;
    const args = func.toString().match(regex);

    const funcArgs = args[0].split(', ').map((arg) => {
      if (initArgs[arg]) {
        return initArgs[arg];
      }
    });

    // console.log(...funcArgs);


    const extScript = () => {eval(func(...funcArgs))};
    const event = new Event('executeScript');

    window.addEventListener('executeScript', extScript)
    window.dispatchEvent(event)
    window.removeEventListener('executeScript', extScript);
  }

  createModule(name, singleModule) {
    const mod = new singleModule();
    // const indexId = parseInt(((Math.random() * 10) * ((Math.random() * 10) / 3)) * 1000, 10);

    this.modules[name] = {};

    // this.modules[componentName].name = name;
    this.modules[name].template = mod.view();

    mod.data ? this.modules[name].data = mod.data() : this.modules[name].data = {};
    mod.controller ? this.modules[name].controller = mod.controller : this.modules[name].controller = null;
    this.modules[name].props = {};

    if (mod.components) {
      this.modules[name].components = mod.components();
    }

    // Assign Parent to Component, if they have one
    Object.keys(this.modules).forEach((modName) => {
      if (this.modules[modName].components) {
        if (this.modules[modName].components.includes(name)) {
          this.modules[name].parent = modName;
        }
      }
    })
  }

  setComponent(component, parent = null, target = null) {
    // console.log(this.modules);
    const domparser = new DOMParser();
    let viewName = component;

    viewName = `${viewName}-${Math.random().toString(36).substring(2,8+2)}`;

    // const childComponent = this.component[viewName].parent ? true : false;
    this.component[viewName] = Object.assign({}, this.modules[component]);

    this.component[viewName].initialized = false;
    this.component[viewName].controllerSet = false;
    this.component[viewName].module = component;
    this.component[viewName].parentComponent = parent;

    if (parent) {
      if (!this.component[parent].componentElms) {
        this.component[parent].componentElms = [];
      }

      if (!this.component[parent].componentElms.includes(viewName)) {
        this.component[parent].componentElms.push(viewName);
      }
    }

    this.component[viewName].root = this.root;
    this.component[viewName].targetData = {};
    this.component[viewName].events = {};
    this.component[viewName].watch = {};
    this.component[viewName].emit = {};
    this.component[viewName].service = {};
    this.component[viewName].dataProxy = {};
    this.component[viewName].propsProxy = {};
    this.component[viewName].lifecycle = {};
    this.component[viewName].props = {};

    if (this.component[viewName].lifecycle.preCreated) {
      this.component[viewName].lifecycle.preCreated(viewName);
    }

    return viewName;
  }

  setController(viewName) {
    const $event = (selector) => {
      return{
        on: (name, func) => {
          // const key = btoa(((Math.random() * 1234) * (Math.random() * 34)).toFixed());
          this.component[selector].events[name] = func;
        },
        onEmit: (name, func) => {
          this.component[selector].emit[name] = func;
        }
      }
    }

    const $watch = (selector) => {
      return (name, func) => {
        this.component[selector].watch[name] = func;
      }
    }

    const $emit = (selector) => {
      return{
        send: (data) => {
          try{
            if(data){
              // const views = this.component
              const parent = this.component[selector].parent
              const func = this.component[parent].emit[selector];
              try{
                if(Object.keys(component[parent].emit).length > 0){
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

    const $global = (selector) => {
      return {
        pinged: (func) => {
          this.component[selector].ping = func;
        }
      }
    }

    const $preCreated = (selector) => {
      return (func) => {
        this.component[selector].lifecycle.preCreated = func;
      }
    }

    const $created = (selector) => {
      return (func) => {
        this.component[selector].lifecycle.created = func;
      }
    }

    const $preUpdate = (selector) => {
      return (func) => {
        this.component[selector].lifecycle.preUpdate = func;
      }
    }

    const $updated = (selector) => {
      return (func) => {
        this.component[selector].lifecycle.updated = func;
      }
    }

    const $destroyed = (selector) => {
      return (func) => {
        this.component[selector].lifecycle.destroyed = func;
      }
    }

    // Set Component Data proxy
    this.setDataProxy('data', viewName);
    this.setDataProxy('props', viewName);

    // Set params
    const params = {
      $data: this.component[viewName].dataProxy.store,
      $props: this.component[viewName].propsProxy.store,
      $state: this.stateMethods,
      $event: $event(viewName),
      $emit: $emit(viewName),
      $service: $service(viewName),
      $watch: $watch(viewName),
      $global: $global(viewName),
      $preCreated: $preCreated(viewName),
      $created: $created(viewName),
      $preUpdate: $preUpdate(viewName),
      $updated: $updated(viewName),
      $destroyed: $destroyed(viewName)
    }

    // Apply Controller
    const controller = this.component[viewName].controller || null;

    if (controller) {
      const regex = /\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g
      const augs = controller.toString().match(regex)[0];
      const attr = [];
      const argsArray = augs.substr(1, augs.length - 2).split(',');

      argsArray.forEach((item, i) => {
        attr.push(params[item.trim()])
      })

      let extScript = () => {eval(controller(...attr))};
      let event = new Event('executeScript');

      window.addEventListener('executeScript', extScript)
      window.dispatchEvent(event)
      window.removeEventListener('executeScript', extScript);
    }

    this.component[viewName].initialized = true;
  }

  /**
  * Render the component(s)
  */
 // Refactor code to make it reusable
  render(modules, target) {
    let module = [];
    this.root = document.querySelector(target);

    if (Array.isArray(modules)) {
      module = modules
    } else {
      module.push(modules);
    }

    module.forEach(singleModule => {
      this.createModule(singleModule.name, singleModule)
    });

    // console.log('############### 1 ##############');
    // Generate Root View
    Object.keys(this.modules).forEach((module, index) => {
      // console.log(module);
      const viewName = module;
      // const template = this.modules[viewName].template;
      let targetElm = null;

      if (!this.modules[viewName].parent) {
        targetElm = document.querySelector(target);
        //Set root component
        const componentName = this.setComponent(viewName);

        targetElm.katsuMeta = {};
        targetElm.katsuMeta.component = componentName;

        this.setController(componentName);
        this.component[componentName].controllerSet = true;

        // Build Template
        // Set non-root Modules in buildVDom
        const htmlContent = this.virtualDom(this.component[componentName].template, componentName, false, null);

        this.component[componentName].vDomNew = htmlContent;
        this.component[componentName].vDomBuilt = true;
        this.rootTemplate = htmlContent;
      }
    });

    // console.log('############### 2 ##############');
    // Generate non-root View
    // Most likely to replace or wrap FOREACH with a WHILE loop
    Object.keys(this.component).forEach((component, index) => {
      if (!this.component[component].vDomBuilt) {
        const template = this.component[component].template;
        const htmlContent = this.virtualDom(template, component, false, null);
        this.component[component].vDomNew = htmlContent;
      }
    });

    // console.log(this.component);
    const templateDom = this.prepareDom(this.rootTemplate);

    console.log('templateDom', templateDom);

    // console.log(templateDom);

    this.updateDom(this.root, templateDom);
    this.currentDom = templateDom;

    this.setDomListeners(this.root);

    this.initialized = true;

    Object.keys(this.component).forEach((component) => {
      if (this.component[component].lifecycle.created) {
        this.component[component].lifecycle.created(component);
      }
    });

    // console.log('===== Finshed components =====')
    // console.log(this.modules, this.component);
  }
}



// if (node.getAttribute(`data-kat-for`)) {
//   const args = node.getAttribute(`data-kat-for`).split('of');
//   const forDataSelector = args[1].trim();
//   const forItemSelector = args[0].trim();

//   const forData = this.bindExpressions(forDataSelector, name);
//   let funcData;

//   // Handle functionl data
//   if (typeof forData === 'function') {
//     const componentData = {...this.component[name].dataProxy.store, ...this.component[name].propsProxy.store};
//     const func = forData.toString().substring(13, forData.toString().length - 1);
//     const funcReturn = new Function('$data', func);
//     funcData = funcReturn(componentData);
//   }


//   // console.log(forData);
//   // const data = this.component[name].dataProxy.store[forDataSelector];


//   if (forData || typeof forData === 'function') {
//     // console.log(`Is function: ${typeof forData === 'function'}`)
//     let dataCount = forData.length;
//     const cloneElm = node.cloneNode(true);

//     let newHTML = '';

//     if (funcData) {
//       dataCount = funcData.length;
//     }

//     for (let i = 0;i < dataCount;i++) {
//       let forHtml = cloneElm.outerHTML;
//       forHtml = forHtml.replace(`data-kat-for="${node.getAttribute(`data-kat-for`)}"`, `itteration="${i}" dataSelector="${forDataSelector}" itemSelector="${forItemSelector}"`);

//       const regex = /(?<=\{{)(.*?)(?=\s*}})/g;
//       const expressions = forHtml.match(regex);

//       // console.log(expressions);
//       if (expressions) {
//         expressions.forEach((forExp) => {
//           const forExpression = forExp.trim().replace(forItemSelector, `${forDataSelector}[${i}]`);

//           if (typeof forData === 'function') {
//             // If it's functional data, just insert the function's return data, rather than prepare it for the expression method;

//             const exp = forExp;

//             if(exp.indexOf('.') > -1){
//               let expArray = exp.split('.');
//               let currentData = funcData;
      
//               for(let x=1;x<expArray.length + 1;x++){
//                 if(x === expArray.length){
//                   // Possibly has a bug for rendering multiple expressions in the same element
//                   try{
//                     // console.log(data, exp, currentData[expArray[i]]);
//                     forHtml = forHtml.replace(`{{${exp}}}`, currentData);
//                   }
//                   catch{
//                     forHtml = forHtml.replace(`{{${exp}}}`, '');
//                   }
//                 }else{
//                   try{
//                     currentData = currentData[i][expArray[x]];
//                   }
//                   catch{
//                     currentData = '';
//                   }
//                 }
//               }
//             } else {
//               forHtml = forHtml.replace(`{{${forItemSelector}}}`, funcData[i]);
//             }
//           } else {
//             forHtml = forHtml.replace(`{{${forExp}}}`, `{{${forExpression}}}`);
//           }
//         })
//       } else {
//         if (typeof forData === 'function') {
//           // If it's functional data, just insert the function's return data, rather than prepare it for the expression method;
//           forHtml = forHtml.replace(`{{${forItemSelector}}}`, funcData[i]);
//         } else {
//           forHtml = forHtml.replace(`{{${forItemSelector}}}`, `{{${forDataSelector}[${i}]}}`);
//         }
//       }                      
      
//       newHTML += forHtml;
//     }

//     node.parentNode.replaceChild(document.createRange().createContextualFragment(newHTML), node);
//   }
  
// }










// if (isKatsuFor) {
// katsuMeta.isFor = {
// itteration: node.getAttribute('itteration'),
// dataSelector: node.getAttribute('dataSelector'),
// itemSelector: node.getAttribute('itemSelector'),
// }

// const itteration = node.getAttribute('itteration');
// const dataSelector = node.getAttribute('dataSelector');
// const itemSelector = node.getAttribute('itemSelector');

// // Check for bindables
// const bindRegex = /(?<=data\-kat\-bind\:)(.*?)(?=\=)/gm;
// const bindDataKeys = node.outerHTML.match(bindRegex);

// if (bindDataKeys) {
// bindDataKeys.forEach((attr) => {
// const propsDataValue = node.getAttribute(`data-kat-bind:${attr}`); 

// // console.log('===== isKatsuFor - bindDataKeys =====');
// // console.log(node, propsDataValue);
// if (propsDataValue) {
//   node.removeAttribute(`data-kat-bind:${attr}`);
//   const forExpression = propsDataValue.trim().replace(itemSelector, `${dataSelector}[${itteration}]`);
//   const bindValue = this.bindExpressions(forExpression, name);
//   node.setAttribute(attr, bindValue);
// }
// });
// }

// node.removeAttribute('itteration');
// node.removeAttribute('dataSelector');
// node.removeAttribute('itemSelector');
// } else if (katsuMetaIsFor) {
// katsuMeta.isFor = katsuMetaIsFor;
// }

