import { random } from 'lodash';
import '../style.css';

// TODO: Allow Debug mode, to allow access on the 'meta' via console log

export default class Katsu{
  constructor(){

    this.dom;
    this.viewName;
    this.targetElement;
    this.modules = {};
    this.component = {};
    this.currentIteration;
    this.switchCase;
    this.expressStr;

    this.rootTarget;

    this.root; // The original state of the DOM before init
    this.domSnapshot; // The current state of the DOM before update

    this.eventMap = {};
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

  getCurrentDom() {
    return this.currentDom;
  }

  setCurrentDom(currentDom) {
    this.currentDom = currentDom;
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
            catch {
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
    if (exp.indexOf('.') > -1) {
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
    } else {
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
        katsuMeta.render = {}

        if (node.nodeType === Node.TEXT_NODE) {
          katsuMeta.content = node.textContent;
        }

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
          // const hasProps = node.getAttribute('data--kat-props');
          
          // If node is a component
          Object.keys(this.modules).forEach((module) => {
            const moduleName = module.toLowerCase();
            if (node.tagName.toLowerCase() === moduleName) {
              console.log('Node is Component', katsuMeta);
              katsuMeta.component = {
                module: module,
                parent: name,
                node: node,
                props: []
              }

              Object.values(node.attributes).forEach((attr) => {
                  if (attr.name.includes('data-kat-props')) {
                    let propsData = {};
                    const key = attr.name.split(':').pop();
                    let value = attr.value;

                    const forExpRegex = /(?<=\()(.*)(?=\))/g;

                    if (value.match(forExpRegex)) {
                      propsData[key] = value.match(forExpRegex)[0];
                    } else {
                      propsData[key] = `'${value}'`;
                    }

                    katsuMeta.component.props.push(propsData);
                  }
              })

              // console.log('@@@@@@@@@@ Component @@@@@@@@@@', node.tagName.toLowerCase(), moduleName);
              // if (!update) {
                // If component does not exist, set component properties
                // katsuMeta.component = {
                //   module: module,
                //   parent: name
                // }
                // this.setComponent(module, name);
              // } else {
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
              // }
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

          // if (isKatsuIf) {
          //   node.removeAttribute(`data-kat-if`);
          // }

          // if (isKatsuElse) {
          //   node.removeAttribute(`data-kat-else`);
          // }

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
            katsuMeta.class = { 
              data: node.getAttribute(`data-kat-class`),
              // type: dataType
            }

            node.removeAttribute(`data-kat-class`);
          }

          if (isKatsuFor) {
            const args = isKatsuFor.split('of');
            const forDataSelector = args[1].trim();
            const forItemSelector = args[0].trim();

            katsuMeta.isForData = {
              dataSelector: forDataSelector,
              itemSelector: forItemSelector,
              component: name
            };

            katsuMeta.isFor = true

            node.removeAttribute(`data-kat-for`);
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

                if (katsuMeta.isForData) {
                  syncValue = this.bindExpressions(`${katsuMeta.isForData.dataSelector}[${katsuMeta.isForData.itteration}].${propsDataValue.split('.').slice(1).join('.')}`, name);
                  
                  katsuMeta.syncable = { 
                    selector: `${katsuMeta.isForData.dataSelector}[${katsuMeta.isForData.itteration}].${propsDataValue.split('.').slice(1).join('.')}`,
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
          // node.childNodes.forEach((thisNode) => {
            let dontUseElm = false;
            if (node.nodeType === 3 || node.nodeType === 8) {
              dontUseElm = true
            }

            if (!dontUseElm) {
              const isKatsuIf = node.getAttribute(`data-kat-if`);
              const isKatsuElse = node.getAttribute(`data-kat-else`);

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
                  katsuMeta.removed = true;
                } else {
                  node.setAttribute('if-condition-true', true);
                }

                katsuMeta.render = {
                  type: 'if',
                  condition: isKatsuIf,
                  expectation: true,
                }

                if (!node.nextElementSibling.getAttribute(`data-kat-else`)) {
                  node.removeAttribute(`data-kat-if`);
                }
              }

              if (isKatsuElse) {
                const prevSibling = node.previousElementSibling;
                if (prevSibling.getAttribute('data-kat-if') && prevSibling.getAttribute('if-condition-true')) {
                  // node.removeChild(thisNode);
                  // thisNode.setAttribute('remove-elm', true);
                  katsuMeta.removed = true;

                  prevSibling.removeAttribute(`data-kat-if`);
                  prevSibling.removeAttribute('if-condition-true')
                }

                katsuMeta.render = {
                  type: 'if',
                  condition: isKatsuIf,
                  expectation: false,
                }

                node.removeAttribute(`data-kat-else`);
              }
            }


            if (isKatsuSwitch) {
              const regex = /(?<=\()(.*?)(?=\s*\))/g;
              const arg = isKatsuSwitch.match(regex)[0];
  
              const removeNode = (node, arg, target) => {
                const traverseTree = (node, target) => {
                  if (node.getAttribute('data-kat-case')) {
                    node.setAttribute('switch-arg', arg);
                    node.setAttribute('switch-value', target);
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
  
              removeNode(node, arg, data);
            
              katsuMeta.switch = {
                arg: isKatsuSwitch.match(regex)[0],
                value: data
              } 
  
              node.removeAttribute(`data-kat-switch`);
            }
  
            if (isKatsuCase) {
              console.log('isKatsuCase', node);
              katsuMeta.case = {
                value: node.getAttribute('data-kat-case'),
                switchValue: node.getAttribute('switch-value'),
                switchArg: node.getAttribute('switch-arg')
              } 

              if (node.getAttribute('remove-element')) {
                katsuMeta.removed = true
              }
  
              node.removeAttribute('data-kat-case');
              node.removeAttribute('remove-element');
            }
          // });

          // if (removeElm) {
          //   katsuMeta.removed = true;
          //   node.removeAttribute('remove-elm');

          //   // node.childNodes.forEach((thisNode) => {
          //   //   let dontUseElm = false;
          //   //   if (thisNode.nodeType === 3 || thisNode.nodeType === 8) {
          //   //     dontUseElm = true
          //   //   }
  
          //   //   if (!dontUseElm) {
          //   //     if (thisNode) {
          //   //       thisNode.setAttribute('remove-elm', true);
          //   //     }
          //   //   }
          //   // });
          // }
        }

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


  buildUpdateVDom(dom, name, updateData, root = "body", index = null) {
    // let domparser = new DOMParser();
    // var htmlobject = index !== null ? domparser.parseFromString(dom, 'text/html').querySelectorAll(root)[0] : domparser.parseFromString(dom, 'text/html').querySelector(root);

    const buildVNodes = (thisnode) => {
      return Array.prototype.map.call(thisnode.childNodes, (node => {

        let restoreNode = false;

        // console.log(this.component[name]);
        // console.log(node.katsuMeta);

        let katsuMeta;
        if (node.katsuMeta) {
          katsuMeta = Object.assign({}, {} , node.katsuMeta); 
        } else {
          katsuMeta = {}; 
        }



        // katsuMeta.component = {}
        // katsuMeta.component.module = name

        // if (node.nodeType === Node.TEXT_NODE) {
        //   katsuMeta.content = node.textContent;
        // }

        if (katsuMeta.noData) {
          let data;
          const dataPathArry = katsuMeta.isForData.dataSelector.split('.')

          // Find data
          const findData = (cData, dataPath) => {
            let currentData;
            dataPath.forEach((path, i) => {
              if (i === path.length - 1) {
                currentData = currentData[path];
              } else {
                currentData = cData[path];
              }
            })

            return currentData;
          }

          if (dataPathArry.length === 1) {
            data = this.component[name].data[katsuMeta.isForData.dataSelector];
          } else {
            data = findData(this.component[name].data, dataPathArry)
          }

          if (data.length > 0 || typeof data === 'function') {
            delete katsuMeta.noData;
            delete katsuMeta.removed;
            restoreNode = true;
          }
        }


        if (katsuMeta.isForData) {
          if (typeof this.component[name].data[katsuMeta.isForData.dataSelector] === 'function') { // Always update for nodes with functional data
            katsuMeta.isForUpdate = true;
          }

          if (katsuMeta.isForData.dataSelector.split('.')[0] === updateData && katsuMeta.isForData.index === 0) {
            katsuMeta.isForUpdate = true;
          }
        }

        //Check for If directive
        // node.childNodes.forEach((thisNode) => {
          let dontUseElm = false;

          if (node.nodeType === Node.TEXT_NODE) {
            dontUseElm = true
          }


          if (!dontUseElm && node) {
            // console.log(node, node.katsuMeta, node.nodeType === Node.TEXT_NODE)
            if (katsuMeta.render.type === 'if') {
              const isKatsuIf = katsuMeta.render.expectation
              const isKatsuElse = !katsuMeta.render.expectation

              if (isKatsuIf) {
                console.log('buildUpdateVDom', 'isKatsuIf', node, katsuMeta)
                const regex = /(?<=\()(.*?)(?=\s*\))/g;
                const arg = katsuMeta.render.condition.match(regex)[0];
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
                  // thisNode.setAttribute('remove-elm', true);
                  katsuMeta.removed = true;
                } else {
                  node.katsuMeta.ifCondition = true;
                  
                  if (node.katsuMeta.removed) {
                    restoreNode = true;
                    delete katsuMeta.removed;

                    if (node.katsuMeta.component.module) {
                      this.component[node.katsuMeta.component.module].isDestroyed = false;
                    }
                  }
                }
              }

              if (isKatsuElse) {
                const findIfElement = (prevSibling) => {
                  if (prevSibling.nodeType === Node.TEXT_NODE) {
                    return findIfElement(prevSibling.previousSibling);
                  }

                  return prevSibling;
                }

                const prevSibling = findIfElement(node.previousSibling);
                if (prevSibling.katsuMeta.ifCondition && prevSibling.katsuMeta.render.type === 'if' ) {
                  // node.removeChild(thisNode);
                  // thisNode.setAttribute('remove-elm', true);
                  katsuMeta.removed = true;
                  delete prevSibling.katsuMeta.ifCondition;
                }
              }
            }
          }

          if (katsuMeta.case) {
            const arg = katsuMeta.case.switchArg;
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

            if (katsuMeta.case.value === data) {
              if (katsuMeta.removed) {
                restoreNode = true;
                delete katsuMeta.removed;
              }
            } else {
              katsuMeta.removed = true;
            }
          }




            
          // });

        // this.directives is no longer required and needs removing, after all functions inside is moved out to their apporite stages
        // this.directives(node, null, name, type, index, this.currentIteration, domRoot)
        let map, thisNode = node.textContent.trim(), emptyArray = [];
        

        if (restoreNode) {
          const newNode = katsuMeta.node;

          delete katsuMeta.node;

          map = {
            type: newNode.type,
            content: newNode.content,
            attr: newNode.attr,
            node: newNode.node,
            children: newNode.children,
            katsuMeta,
          }
        } else {
          map = {
            type: node.nodeType === 3 ? 'text' : (node.nodeType === 1 ? node.tagName.toLowerCase() : (node.nodeType === 8 ? 'comment' : null)),
            content: node.childNodes && node.childNodes.length > 0 ? null :  node.textContent,
            attr: node.attributes ? this.buildAttributes(node.attributes) : (node.nodeType === 8 ? emptyArray : null),
            node: node,
            children: buildVNodes(node, katsuMeta.isFor),
            katsuMeta,
          }
        }

        return map
      }));

    }

    return buildVNodes(dom);

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
    function removeMeta(data, deleteKeys) {
      // console.log(typeof data != "object")
      if (typeof data != "object") return;
      if (!data) return; // null object
      
      for (const key in data) {
        if (deleteKeys.includes(key)) {
          delete data[key];
        } else {
          // If the key is not deleted from the current `data` object,
          // the value should be check for black-listed keys.
          removeMeta(data[key], deleteKeys);
        }
      }
    }

    //const newOps = cleanData($target.katsuMeta, [name]);

    removeMeta($target.katsuMeta, [name]);
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
      this.removeOp(root, name);
    } else if (!oldVal || newVal !== oldVal) {
      this.setOp(root, name, newVal);
    }
  }

  // updateOptions(root, newOps, oldOps){
  //   let newProps = newOps ? newOps : {};
  //   let oldProps = oldOps ? oldOps : {};
  //   const props = Object.assign({}, newProps, oldProps);


  //   Object.values(props).forEach((name, i) => {
  //     console.log(name)
  //     let valName = Object.keys(name)[0];
  //     let newVal = newProps[i] ? Object.values(newProps[i])[0] : null;
  //     let oldVal = oldProps[i] ? Object.values(oldProps[i])[0] : null;

  //     this.updateOption(root, valName, newVal, oldVal);
  //   });
  // }

  createElm(node){    
    if(node){
      if(node.type === 'text'){
        const $el = document.createTextNode(node.content);

        if(node.katsuMeta){
          $el.katsuMeta = {};
          this.setOps($el, node.katsuMeta);
        }
  
        return $el;
      }else if (node.type === 'comment') {
        const $el = document.createComment(node.content);

        if(node.katsuMeta){
          $el.katsuMeta = {};
          this.setOps($el, node.katsuMeta);
        }
  
        return $el;
  		}
    }else{
      return document.createTextNode('');
    }

    if (typeof node === 'string') {
      const $el = document.createTextNode(node);

      if(node.katsuMeta){
        $el.katsuMeta = {};
        this.setOps($el, node.katsuMeta);
      }

      return $el;
    }

    const $el = document.createElement(node.type);

    if(node.attr){
      this.setAttrs($el, node.attr);
    }

    if(node.katsuMeta){
      $el.katsuMeta = {};
      this.setOps($el, node.katsuMeta);
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

        if (newNode.katsuMeta) {
          if(JSON.stringify(newNode.katsuMeta) !== JSON.stringify(oldNode.katsuMeta)){
            // this.updateOptions(root.childNodes[index], newNode.attr, oldNode.attr);
            // this.updateOptions(root.childNodes[index], newNode.katsuMeta, oldNode.katsuMeta);
            root.childNodes[index].katsuMeta = {};
            this.setOps(root.childNodes[index], newNode.katsuMeta)
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
      console.log(name)
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

      console.log(type, o, fn)
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

  // findNode(node, name, target){
  //   console.log(node, name, target);
  //   let foundNode = null;

  //   const traverseTree = (node, name, target) => {
  //     console.log(node, name, target);
  //     if (node.katsuMeta) {
  //       if (node.katsuMeta[name] === target) {
  //         foundNode = node;
  //       }
  
  //       if (!foundNode) {
  //         if (node.children) {
  //           for(let child of node.children) {
  //             if (child.children && !foundNode) {
  //               traverseTree(child, name, target);
  //             }
  //           }
  //         }
  //       }
  //     } else {
  //       if (!foundNode) {
  //         if (node.children) {
  //           for(let child of node.children) {
  //             if (child.children && !foundNode) {
  //               traverseTree(child, name, target);
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }


  //   traverseTree(node, name, target);

  //   return foundNode;
  // }

  findComponent(node, target, useParent = false){
    // console.log(node, target);
    let foundNode = null;

    const traverseTree = (node, target) => {
      // console.log(node, target);
      if (node.katsuMeta) {
        if (node.katsuMeta.component) {
          console.log(node, target, node.katsuMeta);
          if (node.katsuMeta.component['module'] === target) {
            foundNode = !useParent ? node : node.parentNode;
          }
        }

        if (!foundNode) {
          if (node.children) {
            for(let child of node.children) {
              if (child.children && !foundNode) {
                traverseTree(child, target);
              }
            }
          }
        }
      } else {
        if (!foundNode) {
          if (node.children) {
            for(let child of node.children) {
              if (child.children && !foundNode) {
                traverseTree(child, target);
              }
            }
          }
        }
      }
    }

    traverseTree(node, target);

    return foundNode;
  }

  // findAndReplaceComponent(newNode, target, dom) {
  //   if (dom) {
  //     let updatedDom = Object.assign({}, dom);

  //     const traverseTree = (dom) => {
  //       if (dom.length > 0) {
  //         dom.forEach((node, i) => {
  //           if (node.katsuMeta) {
  //             if (node.katsuMeta.component['module'] === target) {
  //               dom[i] = newNode;
  //             }
  //           }

  //           if (node.children.length > 0) {
  //             return traverseTree(node.children);
  //           }
  //         });
  //       }

  //       return dom;
  //     }
      

  //     if (dom.children) {
  //       updatedDom.children = traverseTree(dom.children)
  //     }

  //     return updatedDom;
  //   }

  //   return dom;
  // }

  // Re-render when data has been updated
  updateData(data, target, watchPath, type = 'data') {
    console.log('updateData', Object.keys(data)[0], target)
    console.log(this.component[target].data);


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

      const currentDom = this.getCurrentDom();
      // const stringifiedCurrentDom = JSON.stringify(currentDom);
      const currentDomCloned = JSON.parse(JSON.stringify(currentDom));

      // Does Component exist before update
      // const prevCurrentDom = domparser.parseFromString(this.currentDom, 'text/html').querySelector('body').innerHTML;
      // const prevExistingComponent = this.findNode(this.currentDom, 'component', target);

      // Object.keys(this.component).forEach((component) => {
      //   this.component[component].updated = false;
      // });

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

      const dom = document.querySelector('#root');


      let targetComponent;

      if (this.component[target].parent) {
        targetComponent = this.findComponent(dom, target, true);
      } else {
        targetComponent = this.findComponent(dom, target);
      }

      const htmlContent = this.buildUpdateVDom(targetComponent, target, Object.keys(data)[0]);

      this.component[target].vDomNew = htmlContent; // TODO: Remove, no longer needed.

      // let templateDom = this.prepareDom(htmlContent, target, true);
      let templateDom;

      if (this.component[target].parent) {
        templateDom = this.prepareDom([currentDom], htmlContent, target, true);
      } else {
        templateDom = this.prepareDom(htmlContent);
      }

      this.updateDom(dom, templateDom, currentDomCloned);

      // this.currentDom = templateDom;
      this.setCurrentDom(templateDom);

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

      this.setDomListeners(dom);

      if (this.component[target].lifecycle.updated) {
        this.component[target].lifecycle.updated(data);
      }
    }
  }

  prepareDom(vDomTemplate, componentDom = false, targetComponent = false, updateOnly = false) {
    // Modify the vDOM and set components here?
    let vDom = Object.assign({}, vDomTemplate[0]);

    const forNode = (forMeta, forNode, updateOnly) => {
      //console.log('forNode', forMeta, forNode);
      const { itemSelector, dataSelector, component } = forMeta;
      let forData = this.bindExpressions(dataSelector, component);
      let newNodes = [];
      let funcData;
      let elementIndex;;

      console.log('forNode', forNode, forData.length)


      // TODO: Remove all functions related to or uses "funcData"
      const findAndReplaceExpressions = (nodes, data, index, meta) => {
        // console.log('findAndReplaceExpressions', nodes)
        const regex = /(?<=\{{)(.*?)(?=\s*}})/g;
        const i = index;

        nodes.forEach((node, x) => {
          const forItemSelector = meta.itemSelector
          const forDataSelector = meta.dataSelector
          
          nodes[x].katsuMeta.forData = meta;
          nodes[x].katsuMeta.forIndex = i;  

          if (node.katsuMeta.clickable) {
            nodes[x].katsuMeta.clickable.forIndex = i; 
          }

          if (node.katsuMeta.bindable) {
            // console.log('findAndReplaceExpressions', node);
            nodes[x].katsuMeta.bindable.forIndex = i;

            node.katsuMeta.bindable.attrs.forEach((attr) => {
              if(attr.value.indexOf('.') > -1){
                let expArray = attr.value.split('.');
                let currentData;

                for(let y=1;y<expArray.length;y++){
                  if(y === expArray.length - 1){
                    let newAttr = {};
                    // Possibly has a bug for rendering multiple expressions in the same element
                    try{
                      newAttr[attr.selector] = data[expArray[y]];
                    }
                    catch{
                      newAttr[attr.selector] = '';
                    }

                    let pushAttr = true;

                    if (typeof data[expArray[y]] === 'boolean') {
                      if (!data[expArray[y]]) pushAttr = false;
                    }

                    if (pushAttr) {
                      let attrExists = null;
                      attrExists = node.attr.filter((domAttr) => Object.keys(domAttr)[0] === Object.keys(newAttr)[0]);
  
                      if (attrExists.length > 0) {
                        node.attr.forEach((domAttr, x) => {
                          if(Object.keys(domAttr)[0] === attr.selector) {
                            node.attr.splice(x, 1);
                          };
                        })
                        node.attr.push(newAttr)
                      } else {
                        node.attr.push(newAttr);
                      }
  
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
                let newAttr = {};
                newAttr[attr.selector] = attr.value;
                node.attr.push(newAttr)
              }
            });
          }

          if (node.katsuMeta.content) {

            const expressions = node.katsuMeta.content.match(regex);
            const katsuMetaContent = node.katsuMeta.content;

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
                          nodes[x].content = katsuMetaContent.replace(`{{${expression}}}`, currentData);
                        }
                        catch{
                          nodes[x].content = katsuMetaContent.replace(`{{${expression}}}`, '');
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
                    if (nodes[x].content) nodes[x].content = katsuMetaContent.replace(`{{${forItemSelector}}}`, funcData[index]);
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
                          nodes[x].content = katsuMetaContent.replace(`{{${expression}}}`, thisData[expArray[y]]);
                        }
                        catch{
                          nodes[x].content = katsuMetaContent.replace(`{{${expression}}}`, '');
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
                    // if (nodes[x].content) nodes[x].content = node.katsuMeta.content.replace(`{{${forItemSelector}}}`, `{{${forDataSelector}[${index}]}}`)
                    const forTextContent = katsuMetaContent.replace(`{{${forItemSelector}}}`, `{{${forDataSelector}[${index}]}}`)
                    if (nodes[x].content) nodes[x].content = this.expressions(forTextContent, nodes[x].katsuMeta.component.module)
                  }

                }

              });
            }
          }


          if (node.children.length > 0) {
            nodes[x].children = findAndReplaceExpressions(node.children, data, i, meta)
          }

          nodes[x].katsuMeta.isForExp = true;
        })

        return nodes;
      };

      const thisNode = JSON.parse(JSON.stringify(forNode)); // Deep clone forNode

      // Handle functionl data
      if (typeof forData === 'function') {
        const componentData = {...this.component[thisNode.katsuMeta.isForData.component].dataProxy.store, ...this.component[thisNode.katsuMeta.isForData.component].propsProxy.store};
        const func = forData.toString().substring(13, forData.toString().length - 1);
        const funcReturn = new Function('$data', func);
        forData = funcReturn(componentData);
      }

      if (forData.length === 0) {
        // console.log('findAndReplaceExpressions', 'no forData', forNode);
        forNode.katsuMeta.removed = true; // Marked as removed when there is no data for the cloning.
        forNode.katsuMeta.noData = true;
        return forNode;
      }

      // console.log('forNode', 'forData', forData);

      if (forData || typeof forData === 'function') {
        // console.log(`Is function: ${typeof forData === 'function'}`)
        let dataCount = forData.length;

        // if (funcData) {
        //   dataCount = funcData.length;
        // }

        if (!updateOnly) {
          for (let i = 0;i < dataCount;i++) {
            let cloneElm = JSON.parse(JSON.stringify(thisNode)); // Deep Clone thisNode

            elementIndex = i; 
  
            cloneElm.attr = cloneElm.attr.filter(attr => Object.keys(attr)[0] !== 'data-kat-for');
  
            cloneElm.attr.push({'itteration': `${i}`});
            cloneElm.attr.push({'dataSelector': cloneElm.katsuMeta.isForData.dataSelector});
            cloneElm.attr.push({'itemSelector': cloneElm.katsuMeta.isForData.itemSelector});
  
            let expressions = cloneElm.content ? cloneElm.content.match(regex) : null;
  
            // findAndReplaceExpressions() top level node
            cloneElm = findAndReplaceExpressions([cloneElm], forData[i], i, forMeta);

            
            // console.log('cloneElm', cloneElm)
  
            // if (cloneElm[0].children.length > 0) {
            //   cloneElm[0].children = findAndReplaceExpressions(cloneElm[0].children, forData[i], i, forMeta);
            // }
  
            cloneElm[0].katsuMeta.isForData.index = i;

            if (i !== 0) {
              cloneElm[0].katsuMeta.skipUpdate = true;
            }
  
            delete cloneElm[0].katsuMeta.isFor;
  
            newNodes.push(cloneElm[0]);
          }

          return newNodes;
        } else {
          const index = forNode.katsuMeta.isForData.index
          console.log('updateOnly', index);
          const forElm = findAndReplaceExpressions([forNode], forData[index], index, forMeta);


          if (forElm[0].children.length > 0) {
            forElm[0].children = findAndReplaceExpressions(forElm[0].children, forData[index], index, forMeta);
          }

          return forElm[0];
        }

      }

    }

    // const findandReplaceComponent = (dom, component, componentName) => {
    //   console.log('===== findandReplaceComponent =====')
    //   console.log(dom, component, componentName)
    //   let foundDom = false;
    //   let updatedDom = {}

    //   const traverseTree = (dom) => {
    //     let newDom = dom;

    //     if (newDom && !foundDom) {
    //       newDom.children.forEach((child, i) => {
    //         if (child.katsuMeta.component === componentName) {
    //           // console.log(child.katsuMeta.component);
    //           // If the component's node meta is flagged for removal it will not be inserted into the VDOM, it is then considered to be removed / destroyed.
    //           // The component is flagged as "disabled" and is to be removed at the end of the prepareDom phase.
    //           if (!child.katsuMeta.removed) {
    //             newDom.children[i] = component;
    //             newDom.children[i].katsuMeta.component = componentName;
    //           } else {
    //             this.component[componentName].disabled = true;
    //           }

    //           foundDom = true;
    //         }

    //         if (!foundDom) {
    //           if (child.children.length > 0) {
    //             newDom.children[i] = traverseTree(child);
    //            }
    //         }
    //       });

    //       return newDom;
    //     }
    //   }

    //    if (dom.children) {
    //     updatedDom = traverseTree(dom)
    //    }

    //   return updatedDom;
    // };

    const findAndReplaceComponent = (dom, newNode, target) => {
      if (dom) {
        let updatedDom = Object.assign({}, dom);
  
        const traverseTree = (dom) => {
          if (dom.length > 0) {
            dom.forEach((node, i) => {
              if (node.katsuMeta) {
                if (node.katsuMeta.component['module'] === target) {
                  dom[i] = newNode;
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

    const findComponentsInRemoved = (dom) => {
      const traverseTree = (dom) => {
        if (dom) {
          if (dom.katsuMeta.component.name) {
            console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', dom.katsuMeta.component.name)
            console.log(this.component[dom.katsuMeta.component.name]);
            this.component[dom.katsuMeta.component.name].isDestroyed = true;
          }

          dom.children.forEach((child, i) => {
            if (child.children.length > 0) {
              traverseTree(child);
            }
          });
        }
      }

      if (dom.children) {
        return traverseTree(dom)
      }

      return dom;
    }

    const modifyNodes = (dom) => {
      let updatedDom = {};

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
              katsuMeta: {
                ...newDom.katsuMeta,
                node: dom
              },
              node: null,
              type: 'comment'
            };

            console.log('removed', newDom);
            findComponentsInRemoved(newDom.katsuMeta.node);
          }

          if (newDom.katsuMeta?.ifCondition) {
            delete newDom.katsuMeta.ifCondition;
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

        if (dom.length > 0) {

          
          dom.forEach((node, i) => {
            if (node.katsuMeta.isFor) { // Duplicate isFor nodes 


              const newNodes = forNode(node.katsuMeta.isForData, node, false)  // Clone and update nodes;

              console.log('newNodes', newNodes, node, dom, i)
              console.log(dom[i]);

              if (newNodes) {
                newNodes.length > 0 && dom.splice(i, 1, ...newNodes);
              }

            } else if (node.katsuMeta.isForUpdate) { // If node are already duplicated, then just update them
              if (node.katsuMeta.skipUpdate) {
                delete node.katsuMeta.skipUpdate
              } else {
                let nextIndex = i + 1

                // Remove For siblings
                while(dom[nextIndex].katsuMeta.isForData) {
                  dom.splice(nextIndex, 1);
                  nextIndex + 1
                }

                const newNodes = forNode(node.katsuMeta.isForData, node, false)  // Clone and update nodes;
  
                if (newNodes) {
                  newNodes.length > 0 && dom.splice(i, 1, ...newNodes);
                }

                // parentNode.childNodes.forEach((node) => {
                //   console.log(node);
                // })
  
  
                // if () { // However, if there has been a chnage to the number of items, delete all items, re-clone and update nodes
  
                // } else { // Otherwise, Update only
                  // dom[i] = forNode(node.katsuMeta.isForData, node, true) 
                // }
              }
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
              if (node.katsuMeta.content && !node.katsuMeta.isForExp) {
                (/{{(.*?)}}/g.test(node.katsuMeta.content) ? dom[i].content = this.expressions(dom[i].katsuMeta.content, dom[i].katsuMeta.component.module) : dom[i].katsuMeta.content)
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
              if (node.katsuMeta.bindable && !node.katsuMeta.isForExp) {
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
                            newAttr[attr.selector] = thisData[expArray[y]];
                          }
                          catch{
                            newAttr[attr.selector] = '';
                          }

                          let pushAttr = true;

                          if (typeof thisData === 'boolean') {
                            if (!thisData[expArray[y]]) pushAttr = false;
                          }

                          if (pushAttr) {
                            let attrExists = null;
                            attrExists = dom[i].attr.filter((domAttr) => Object.keys(domAttr)[0] === Object.keys(newAttr)[0]);
  
                            if (attrExists.length > 0) {
                              dom[i].attr.forEach((domAttr, x) => {
                                if(Object.keys(domAttr)[0] === attr.selector) {
                                  dom[i].attr.splice(x, 1);
                                };
                              })
                              dom[i].attr.push(newAttr)
                            } else {
                              dom[i].attr.push(newAttr);
                            }
                          }
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

    const classNode = (dom) => {
      if (dom) {
        let updatedDom = Object.assign({}, dom);

        const traverseTree = (dom) => {
          if (dom.length > 0) {
            dom.forEach((node, i) => {

              if (node.katsuMeta.class) {
                const dataSelector = node.katsuMeta.class.data
                const isForElement = node.katsuMeta.isForData;
                const componentName = node.katsuMeta.component.module
          
                const data = isForElement ? this.component[componentName].data[isForElement.forDataSelector][dataSelector] : this.component[componentName].data[dataSelector];
                const dataType = typeof data;

                let newClasses = '';
                
          
                switch (dataType) {
                  case 'string':
                    console.log(dom[i]);
                    newClasses = '';
                    break;
                  case 'object':
                    if (Array.isArray(data)) {
                      newClasses = [...data].join(' ');
                    } else {
                      let activeClasses = [];
                      Object.keys(data).map((katsuClass) => {
                        if (Boolean(data[katsuClass])) {
                          activeClasses.push(katsuClass)
                        }
                      });
          
                      newClasses = [...activeClasses].join(' ');
                    }
                    
                    break;
                }

                dom[i].attr.push({'class': newClasses});
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
            if (domNode.katsuMeta.component.name) existingComponents.push(domNode.katsuMeta.component.name)
          }
          if (domNode.childNodes.length > 1) {
            findExistingComponents(domNode.childNodes)
          }
        })
      }

      const createComponentNodes = (dom) => {
        console.log('createComponentNodes', 'start', dom);

        let updatedDom = Object.assign({}, dom);

        const traverseTree = (dom) => {
          if (dom.length > 0) {
            dom.forEach((node, i) => {
              Object.keys(this.modules).forEach((component, index) => {
                // console.log(node, node.type, component.toLowerCase());
                if (node.type === component.toLowerCase()) {
                  console.log('========= Component Node =============')
                  console.log(node);
  
                  // targetElm = document.querySelector(target);
                  //Set root component

                  // create new Component if it doesn't exist
                  const componentName = this.setComponent(node.katsuMeta.component.module);

                  const parentComponent = dom[i].katsuMeta.component.parent;
                  if (!this.component[parentComponent].childComponents) {
                    this.component[parentComponent].childComponents = [];
                  }

                  this.component[parentComponent].childComponents.push(componentName);

          
                  // Build Template
                  // Set non-root Modules in buildVDom
                  const htmlContent = this.virtualDom(this.component[componentName].template, componentName, false, null);

                  this.component[componentName].vDomNew = htmlContent;  // TODO: Remove, no longer needed.
                  this.component[componentName].vDomBuilt = true;

                  dom[i].katsuMeta.component.name = componentName;
                  const saveKatsuMeta = dom[i].katsuMeta;

                  const templateDom = this.prepareDom(htmlContent)

                  dom[i] = templateDom;
                  dom[i].katsuMeta = Object.assign({}, templateDom.katsuMeta, saveKatsuMeta);
                  dom[i].katsuMeta.component.module = componentName;

                  if (dom[i].katsuMeta.component.props) {
                    setProps(dom[i].katsuMeta);
                  }

                  this.setController(componentName);
                  this.component[componentName].controllerSet = true;

                  console.log('createComponentNodes', 'After templateDom', dom[i]);
                  console.log(this.component[componentName])
                }
              });

              // console.log('createComponentNodes', 'During traverseTree', node);

              if (node.children) {
                if (node.children.length > 0) {
                  return traverseTree(node.children);
                }
              }
            });
          }
  
          return dom;
  
        }

        // console.log('createComponentNodes', 'Before traverseTree', dom.children);
        
  
        if (dom.children) {
          updatedDom.children = traverseTree(dom.children)
        }

        console.log('========= Component Node updatedDom =============')
        console.log(updatedDom);
        return updatedDom;
      }

      const setProps = (meta) => {
        const props = meta.component.props;
        const parent = meta.component.parent;
        const name = meta.component.module;

        if (Object.keys(props).length) {
          Object.values(props).forEach((prop) => {
            let propsData = {};
            const isString = /(?<=\')(.*)(?=\')/g;
            const key = Object.keys(prop)[0];
            const value = Object.values(prop)[0];

            // If value a for expression
            if (meta.forData) {
              const { itemSelector, dataSelector } = meta.forData;

                if (value.match(isString)) {
                  propsData[key] = value;
                } else {
                  if (value === itemSelector) {

                    // if (value.includes('.')) {
                    //   let baseData = this.component[parent].data;
                    //   value.split('.').forEach((argData) => {
                    //     baseData = baseData[argData]
                    //   });
                    //   propsData[key] = baseData;
                    // } else {
                    //   propsData[key] = this.component[parent].data[value]
                    // }

                    propsData[key] = this.component[parent].data[dataSelector][meta.forIndex]


                  } else {
                    if (value.includes('.')) {
                      let baseData = this.component[parent].data;
                      value.split('.').forEach((argData) => {
                        baseData = baseData[argData]
                      });
                      propsData[key] = baseData;
                    } else {
                      propsData[key] = this.component[parent].data[value]
                    }
                  }
                }
            } else {

              if (value.match(isString)) {
                propsData[key] = value.substring(1, value.length - 1) ;
              } else {
                if (value.includes('.')) {
                  let baseData = this.component[parent].data;
                  value.split('.').forEach((argData) => {
                    baseData = baseData[argData]
                  });
                  propsData[key] = baseData;
                } else {
                  propsData[key] = this.component[parent].data[value]
                }
              }
            }

            console.log('setProps', propsData)

            this.component[name].props = Object.assign({}, propsData, {});
            this.setDataProxy('props', name);


            console.log(this.component[name].props, this.component[name].propsProxy);
          }); 
        }
      }

      const setComponentNodes = (rootDom, componentName) => {
        console.log('createComponentNodes', 'start', rootDom);
        const traverseTree = (dom) => {
          if (dom.length > 0) {
            dom.forEach((node, i) => {
              Object.keys(this.modules).forEach((component, index) => {
                // console.log(node, node.type, component.toLowerCase());
                if (node.type === component.toLowerCase()) {
                  // Build Template
                  // Set non-root Modules in buildVDom
                  const htmlContent = this.virtualDom(this.component[componentName].template, componentName, false, null);

                  this.component[componentName].vDomNew = htmlContent;  // TODO: Remove, no longer needed.
                  this.component[componentName].vDomBuilt = true;

                  dom[i].katsuMeta.component.name = componentName;


                  const templateDom = this.prepareDom(htmlContent)

                  dom[i] = templateDom;

                  dom[i].attr = [{'name': componentName}];
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
  
        if (rootDom.children) {
          updatedDom.children = traverseTree(rootDom.children)
        }

        return updatedDom;
      }

      // findExistingComponents(document.querySelector('#root').childNodes);

      // Check if this vDom has already been built

      // console.log(this.root);

      // Find existing components if DOM has already been built

      console.log('componentNodes', 'Before Init / Update', dom, this.component[dom.katsuMeta.component.module].childComponents)

      if (this.component[dom.katsuMeta.component.module].childComponents) {
        // console.log('componentNodes', 'Update route');
        // console.log(this.root.katsuMeta);
        // console.log(this.component);

        // this.root.childNodes.forEach((node) => {
        //   findExistingComponents(node.childNodes);
        // })

        // let componentsToBeDestoryed = [];
        // let componentsToBeCreated = [];

        // // If component is not found on DOM, but exists in component object, then destory component
        // // Object.keys(this.component).forEach((component) => {
        //   existingComponents.forEach(existingComponent => {
        //     // Needs code here
        //     // component !== existingComponent && componentsToBeDestoryed.push(component);
        //     // console.log(Object.keys(this.component), existingComponent);
        //     if (!Object.keys(this.component).includes(existingComponent)) componentsToBeDestoryed.push(existingComponent);
        //   })
          

        // // })


        // // TODO: To be removed, I don't think this is required
        // // If component is found on DOM, but does NOT exists in component object, then create component
        // existingComponents.forEach(existingComponent => {
        //   Object.keys(this.component).forEach((component) => {
        //     existingComponent !== component && componentsToBeCreated.push(component);
        //     if (!existingComponents.includes(component)) componentsToBeCreated.push(component);
        //   })           
        // })
        // // Run through componentsToBeDestoryed and componentsToBeCreated


        

        // console.log('====== componentsToBeDestoryed / componentsToBeCreated ======');
        // console.log(componentsToBeDestoryed);
        // console.log(componentsToBeCreated);
        // console.log(dom);

        // console.log(this);

        // console.log('componentNodes', 'Component does not exists', dom)
        // updatedDom = createComponentNodes(dom)
        // console.log('componentNodes', 'after createComponentNodes', updatedDom)

        // return updatedDom

        // const compoentsToSet = this.component[dom.katsuMeta.component.module].childComponents;



        // updatedDom = setComponentNodes(dom)

        return updatedDom;
      } else {
        console.log('componentNodes', 'Init route');
        console.log('componentNodes', 'Component does not exists', dom)
        updatedDom = createComponentNodes(dom)

        console.log('componentNodes', 'after createComponentNodes', updatedDom)

        // Replace with updatedDom
        console.log('Replace with updatedDom', dom, updatedDom);

        return updatedDom;
      }

      // Create Component nodes using what components are available, in the right order.
      // Needs code here

      console.log('componentNodes', 'Nothing here', dom)
      console.log(dom)

      return dom;
    }

    // const propsNodes = (dom) => {
    //   if (dom) {
    //     let updatedDom = Object.assign({}, dom);

    //     const traverseTree = (dom) => {
    //       if (dom.length > 0) {
    //         dom.forEach((node, i) => {
    //           console.log('xxxxx', node.katsuMeta)
    //           if (node.katsuMeta.component.props) {
    //             console.log('propsNodes', node.katsuMeta, node.katsuMeta.component)

    //             // Set Props, if any
    //             const parent = node.katsuMeta.component.parent;

    //             Object.values(node.katsuMeta.component.props).forEach((prop) => {
    //               let propsData = {};
    //               const isString = /(?<=\')(.*)(?=\')/g;
    //               const key = Object.keys(prop)[0];
    //               const value = Object.values(prop)[0];

    //               // If vale a for expression
    //               if (node.katsuMeta.isForData) {
    //                   const {itemSelector, dataSelector, itteration} = node.katsuMeta.isForData;

    //                   if (value.match(isString)) {
    //                     propsData[key] = value;
    //                   } else {
    //                     if (value === itemSelector) {

    //                       if (value.includes('.')) {
    //                         let baseData = this.component[parent].data;
    //                         value.split('.').forEach((argData) => {
    //                           baseData = baseData[argData]
    //                         });
    //                         propsData[key] = baseData;
    //                       } else {
    //                         propsData[key] = this.component[parent].data[value]
    //                       }

    //                       propsData[key] = this.component[parent].data[dataSelector][itteration]


    //                     } else {
    //                       if (value.includes('.')) {
    //                         let baseData = this.component[parent].data;
    //                         value.split('.').forEach((argData) => {
    //                           baseData = baseData[argData]
    //                         });
    //                         propsData[key] = baseData;
    //                       } else {
    //                         propsData[key] = this.component[parent].data[value]
    //                       }
    //                     }
    //                   }
    //               } else {

    //                 if (value.includes('.')) {
    //                   let baseData = this.component[parent].data;
    //                   value.split('.').forEach((argData) => {
    //                     baseData = baseData[argData]
    //                   });
    //                   propsData[key] = baseData;
    //                 } else {
    //                   propsData[key] = this.component[parent].data[value]
    //                 }
    //               }

    //               console.log(propsData);

    //               this.component[katsuMeta.component].props = Object.assign({}, propsData, {});

    //             }); 


    //           }
  
    //           if (node.children.length > 0) {
    //             return traverseTree(node.children);
    //           }
    //         });
    //       }
  
    //       return dom;
  
    //     }
  
    //     if (dom.children) {
    //       updatedDom.children = traverseTree(dom.children)
    //     }

    //     return updatedDom;
    //   }

    //   return dom;
    // }

    console.log('prepareDom', 'component count', this.component, Object.keys(this.component).length);

    // Duplicate Nodes in For loops
    vDom = forNodes(vDom);
    // console.log('forNodes', vDom);
    // console.log('Before componentNodes', vDom);

    // vDom = propsNodes(vDom);

    // Create and set components
    vDom = componentNodes(vDom);
    // console.log('componentNodes', vDom);

    if (componentDom && targetComponent) findAndReplaceComponent(vDom)

    // Set Bindables
    vDom = bindableNodes(vDom)


    console.log('findAndReplaceComponent', vDom)

    // Set Expressions
    vDom = expressionNodes(vDom);
    // console.log('expressionNodes', vDom);


    vDom = classNode(vDom);

    // console.log('bindableNodes', vDom);

    // Any addtional modification to nodes
    vDom = modifyNodes(vDom);

    console.log('Prepared vDOM', vDom);

    // console.log('root', vDomTemplate)
    // console.log('Perpared VDOM', vDom);


    // Set Component controllers here?
    // Set the contollers of the components that will be active when rendering is finished

    //Create Components


    // Remove any components that are flagged as "destroyed"
    Object.keys(this.component).forEach((componentName) => {
      // When this happens, fire the component's destoryed lifecycle event; If the component has one.
      // Once done, reset the component to it's initial state.
      if (this.component[componentName].isDestroyed) {
        if (this.component[componentName].lifecycle.destroyed) {
          this.component[componentName].lifecycle.destroyed();
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
    // this.setDataProxy('props', viewName);

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

    this.rootTarget = target;

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
        targetElm.katsuMeta.component = {}
        targetElm.katsuMeta.component.module = componentName;

        this.setController(componentName);
        this.component[componentName].controllerSet = true;

        // Build Template
        // Set non-root Modules in buildVDom
        const htmlContent = this.virtualDom(this.component[componentName].template, componentName, false, null);

        this.component[componentName].vDomNew = htmlContent;  // TODO: Remove, no longer needed.
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
        this.component[component].vDomNew = htmlContent;  // TODO: Remove, no longer needed.
      }
    });

    // console.log(this.component);
    const templateDom = this.prepareDom(this.rootTemplate);

    console.log('templateDom', templateDom);

    // console.log(templateDom);

    this.updateDom(this.root, templateDom);
    //this.currentDom = templateDom;
    this.setCurrentDom(templateDom)

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

