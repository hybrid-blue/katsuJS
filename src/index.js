/**
* Expression interpolation
*/
function expressions(content, data = {}, props = {}) {
  const regex = /(?<={{)(.*?)(?=\s*}})/g;
  let expressions = content.match(regex);
  var contentExp = content;

  for(let exp of expressions){
    if(exp.indexOf('.') > -1){
      let expArray = exp.split('.');
      let currentData = {...data, ...props};

      console.log('expressions', currentData);

      for(let i=0;i<expArray.length;i++){
        if(i === (expArray.length - 1)){
          // Possibly has a bug for rendering multiple expressions in the same element
          try{
            contentExp = contentExp.replace(`{{${exp}}}`, currentData[expArray[i]]);
          }
          catch{
            contentExp = contentExp.replace(`{{${exp}}}`, '');
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
      const componentData = {...data, ...props};
      const indexRegex = /(?<=\[)(.*?)(?=\s*\])/g;

      if (exp.match(indexRegex)) {
        let forExp = exp.split('[')[0];
        const forIndex = exp.match(indexRegex)[0];
        if(componentData[forExp][forIndex]) contentExp = contentExp.replace(`{{${exp}}}`, componentData[forExp][forIndex]);
      } else {
        console.log(componentData[exp])
        if(componentData[exp] !== null){
          if(componentData[exp] === undefined){
            data = contentExp.replace(`{{${exp}}}`, '');
          }else{
            if(componentData[exp]) contentExp = contentExp.replace(`{{${exp}}}`, componentData[exp]);
          }
        }
      }
    }
  }

  return contentExp
}

function buildAttributes(attributes){
  var attrArray = [];
  Object.values(attributes).map((attr) => {
    var attrObj = {};
    attrObj[attr.name] = attr.value;
    attrArray.push(attrObj);
  })
  return attrArray;
}

// Virtual DOM Building
function buildVDom(dom, name) {

  // let domparser = new DOMParser();
  // var htmlobject = domparser.parseFromString(dom, 'text/html').querySelector('body');

  const buildVNodes = (thisnode, katsuMetaIsFor) => {
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
        // Object.keys(this.modules).forEach((module) => {
        //   const moduleName = module.toLowerCase();
        //   if (node.tagName.toLowerCase() === moduleName) {
        //     console.log('Node is Component', katsuMeta);
        //     katsuMeta.component = {
        //       module: module,
        //       parent: name,
        //       node: node,
        //       props: []
        //     }

        //     Object.values(node.attributes).forEach((attr) => {
        //         if (attr.name.includes('data-kat-props')) {
        //           let propsData = {};
        //           const key = attr.name.split(':').pop();
        //           let value = attr.value;

        //           const forExpRegex = /(?<=\()(.*)(?=\))/g;

        //           if (value.match(forExpRegex)) {
        //             propsData[key] = value.match(forExpRegex)[0];
        //           } else {
        //             propsData[key] = `'${value}'`;
        //           }

        //           katsuMeta.component.props.push(propsData);
        //         }
        //     })
        //   }
        // });

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

      }

      // this.directives is no longer required and needs removing, after all functions inside is moved out to their apporite stages
      // this.directives(node, null, name, type, index, this.currentIteration, domRoot)
      let map, thisNode = node.textContent.trim(), emptyArray = [];

      map = {
        type: node.nodeType === 3 ? 'text' : (node.nodeType === 1 ? node.tagName.toLowerCase() : (node.nodeType === 8 ? 'comment' : null)),
        // content: node.childNodes && node.childNodes.length > 0 ? null : (/{{(.*?)}}/g.test(node.textContent) ? this.expressions(node.textContent, name) : node.textContent),
        content: node.childNodes && node.childNodes.length > 0 ? null :  node.textContent,
        attr: node.attributes ? buildAttributes(node.attributes) : (node.nodeType === 8 ? emptyArray : null),
        node: node,
        children: buildVNodes(node, katsuMeta.isFor),
        katsuMeta,
      }

      return map

    }));

  }

  return buildVNodes(dom);

};


function buildUpdateVDom(dom, name, updateData) {
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

function prepareDom(vDomTemplate, controller, componentDom = false, targetComponent = false, updateOnly = false) {
  const componentData = controller.data;
  const componentName = controller.name;

  // Modify the vDOM and set components here?
  let vDom = Object.assign({}, vDomTemplate[1]);

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
                  if (nodes[x].content) nodes[x].content = expressions(forTextContent, nodes[x].katsuMeta.component.module)
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
              console.log(dom[i].katsuMeta.content, componentData);
              (/{{(.*?)}}/g.test(node.katsuMeta.content) ? dom[i].content = expressions(dom[i].katsuMeta.content, componentData) : dom[i].katsuMeta.content)
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

    // Find existing components if DOM has already been built

    console.log('componentNodes', 'Before Init / Update', dom, this.component[dom.katsuMeta.component.module].childComponents)

    if (this.component[dom.katsuMeta.component.module].childComponents) {
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


  // console.log('prepareDom', 'component count', this.component, Object.keys(this.component).length);

  // Duplicate Nodes in For loops
  vDom = forNodes(vDom);
  // console.log('forNodes', vDom);
  // console.log('Before componentNodes', vDom);

  // vDom = propsNodes(vDom);

  // Create and set components
  // vDom = componentNodes(vDom);

  // if (componentDom && targetComponent) findAndReplaceComponent(vDom)

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
  // Object.keys(this.component).forEach((componentName) => {
  //   // When this happens, fire the component's destoryed lifecycle event; If the component has one.
  //   // Once done, reset the component to it's initial state.
  //   if (this.component[componentName].isDestroyed) {
  //     if (this.component[componentName].lifecycle.destroyed) {
  //       this.component[componentName].lifecycle.destroyed();
  //     }
  //   }
  // });

  return vDom;
}

function listeners(root, controller){
  const component = controller;

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
          if(component.data[topObj]){
            dataPath = component.data[topObj][index];
          }
        }else{
          dataPath = dataPath[dataArray[i]];
        }

      }
    }else{
      dataPath = thisParentComponentData ?? component.data[data];
    }

    return dataPath;
  }

  const setClickEvent = (target, event, arg, viewName, forIndex) => {
    const hasEvent = target.katsuMeta.clickable.hasListener;
    if(!hasEvent){
      target.addEventListener('click', (e) => {
        const func = component.events[event];
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
              // newArgs.push(this.getEventValues(target, viewName, forIndex, args[i]));
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
          const func = component.events[event];
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
    const {selector} = target.katsuMeta.syncable;

    if(!hasEvent){
      target.addEventListener('input', (e) => {
        // Deep nesting solution
        if (selector.indexOf('.') > -1) {
          const set = (path, value) => {
            let schema = component.data.store;
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
          component.dataProxy.store[selector] = e.target.value;
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
        const func = component.events[event];
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
        const func = component.events[event];
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

function renderDom(root, newNode, oldNode, index = 0) {
  function removeAttr($target, name) {
    $target.removeAttribute(name);
  }

  function setAttr($target, name, value) {
    $target.setAttribute(name, value)
  }

  function setAttrs(root, props) {
    Object.keys(props).forEach(name => {
      let attr = Object.keys(props[name])[0];
      let value = Object.values(props[name])[0];

      setAttr(root, attr, value)
    })
  }

  function updateAttr(root, name, newVal, oldVal) {
    if (!newVal) {
      removeAttr(root, name);
    } else if (!oldVal || newVal !== oldVal) {
      setAttr(root, name, newVal);
    }
  }

  function updateAttrs(root, newAttrs, oldAttrs) {
    let newProps = newAttrs ? newAttrs : {};
    let oldProps = oldAttrs ? oldAttrs : {};
    const props = Object.assign({}, newAttrs, oldAttrs);

    Object.values(props).forEach((name, i) => {
      let valName = Object.keys(name)[0];
      let newVal = newProps[i] ? Object.values(newProps[i])[0] : null;
      let oldVal = oldProps[i] ? Object.values(oldProps[i])[0] : null;
      updateAttr(root, valName, newVal, oldVal);
    });
  }

  function removeOp($target, name) {
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

  function setOp($target, name, value) {
    $target.katsuMeta[name] = value;
  }

  function setOps(root, props) {
    Object.keys(props).forEach(name => {
      let attr = name
      let value = props[name];

      setOp(root, attr, value)
    })
  }

  function updateOption(root, name, newVal, oldVal) {
    if (!newVal) {
      removeOp(root, name);
    } else if (!oldVal || newVal !== oldVal) {
      setOp(root, name, newVal);
    }
  }

  function createElm(node) {    
    if(node){
      if(node.type === 'text'){
        const $el = document.createTextNode(node.content);

        if(node.katsuMeta){
          $el.katsuMeta = {};
          setOps($el, node.katsuMeta);
        }
  
        return $el;
      }else if (node.type === 'comment') {
        const $el = document.createComment(node.content);

        if(node.katsuMeta){
          $el.katsuMeta = {};
          setOps($el, node.katsuMeta);
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
        setOps($el, node.katsuMeta);
      }

      return $el;
    }

    const $el = document.createElement(node.type);

    if(node.attr){
      setAttrs($el, node.attr);
    }

    if(node.katsuMeta){
      $el.katsuMeta = {};
      setOps($el, node.katsuMeta);
    }

    node.children.map(createElm.bind(this)).forEach($el.appendChild.bind($el));
    return $el;

  }

  const changed = (node1, node2) => {
    return typeof node1 !== typeof node2 ||
         typeof node1 === 'string' && node1 !== node2 ||
         node1.type !== node2.type || node1.content !== node2.content
  }


  if(!oldNode){
    root.appendChild(createElm(newNode));
  }else if (!newNode && root.childNodes[index]){
    root.removeChild(root.childNodes[index]);
  }else if (changed(newNode, oldNode) && root.childNodes[index]) {
    root.replaceChild(createElm(newNode), root.childNodes[index]);

  }else if(newNode){
    // Add root !== undefined handle new comments
    if(root !== undefined && root.childNodes[index] !== undefined){
      if(typeof root.childNodes[index].attributes !== 'undefined'){
        if(newNode.attr !== null){
          if(newNode.attr.length > 0){
            updateAttrs(root.childNodes[index], newNode.attr, oldNode.attr);
          }
        }
      }

      if (newNode.katsuMeta) {
        if(JSON.stringify(newNode.katsuMeta) !== JSON.stringify(oldNode.katsuMeta)){
          // this.updateOptions(root.childNodes[index], newNode.attr, oldNode.attr);
          // this.updateOptions(root.childNodes[index], newNode.katsuMeta, oldNode.katsuMeta);
          root.childNodes[index].katsuMeta = {};
          setOps(root.childNodes[index], newNode.katsuMeta)
        }
      }
    }

    const newLength = newNode.children.length;
    const oldLength = oldNode.children.length;

    for(let i = 0; i < newLength || i < oldLength; i++){
      updateDom(
        root.childNodes[index],
        newNode.children[i],
        oldNode.children[i],
        i
      );
    }
  }
}

class DataProxy{
  constructor(storeType, name) {
    this.data = {};
    this.props = {};

    this.dataProxy = {};
    this.propsProxy = {};

    this.storeType = storeType;
    this.name = name;

    this.init();
  }

  init() {
    let _data;
    let _props;
    let _state;


    console.log(this.storeType);
    if (this.storeType === 'data') {
      console.log('Is data');
      _data = this.wrap(this.data, 'data', console.log);
    } else if (this.storeType === 'props') {
      _props = this.props ? this.wrap(this.props, 'props', console.log) : null;
    } else if (storeType === 'stateMethods') {
      _state = this.state ? this.wrap(this.state, 'stateMethods', console.log) : null;
    }

    // const updateData = this.updateData.bind(this);
    // const dataWatch = this.dataWatch.bind(this);

    // Set Global Object as entry-way to data proxy
    if(this.storeType === 'stateMethods') {
      if (this.storeType === 'stateMethods') {
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
      if (this.storeType == 'data') {
        Object.defineProperty(this.dataProxy, 'store', {
          get: function(){
            return _data
          },
          set: function(e){
            _data = this.wrap(e, 'data', console.log);
            return true
          }
        })

        // console.log(_data)
        // this.dataProxy.store.test = 'sadsadasdas';

        console.log(this.dataProxy);

        return this;
      }

      if (this._props && this.storeType == 'props') {
        Object.defineProperty(this.propsProxy, 'store', {
          get: function(){
            return this._props
          },
        })

        return this.propsProxy;
      }
    }
  }

  isObject(obj) {
    return typeof obj === 'object' && !Array.isArray(obj)
  }

  wrap(o, type, fn, scope = []) {
    let dataObject = o;
    // let wrapPath = [];
    // Force update Proxy
      const handler = {
        get(target, prop, receiver) {
          // fn('get value in scope: ', scope.concat(prop));
          const trueTypeOf = (obj) => {
            return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
          }

          if (['object', 'array'].indexOf(trueTypeOf(target[prop])) > -1) {
            // wrapPath.push(prop);
            return new this.getProxy(target[prop], handler);
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


          // updateData(obj, name, null, type);

          // if (oldVal !== newVal) {
          //   dataWatch(pathArray.join('.'), target[prop], value, name);
          // }

          return true
        }

      }

    Object.keys(dataObject).forEach((data) => {
      if (!dataObject[data]) {
        delete dataObject[data];
      }
    });

    console.log(Object.keys(dataObject).length);

    if (Object.keys(dataObject).length === 0) {
      return new Proxy({}, handler);
    } else {
      return new Proxy(
        Object.keys(dataObject).reduce((result, key) => {
          if (this.isObject(dataObject[key])) {
            result[key] = this.wrap(dataObject[key], type, fn, scope.concat(key))
          } else {
            result[key] = dataObject[key]
          }

          console.log(result);
  
          return result
        }, {}),
        handler
      )
    }


  }
}

function componentDataProxy(type, name) {
  return new DataProxy(type, name)
}

class Controller {
  constructor(name, script) {
    this.name = name;
    this.script = script;
    this.events = {};
    this.watch = {};
    this.emit = {};
    this.service = {};
    this.dataProxy = {};
    this.propsProxy = {};
    this.data = {};
    this.props = {};
    this.lifecycle = {};

    this.init()
  }

  $event() {
    return{
      on: (name, func) => {
        // const key = btoa(((Math.random() * 1234) * (Math.random() * 34)).toFixed());
        this.events[name] = func;
      },
      onEmit: (name, func) => {
        this.emit[name] = func;
      }
    }
  }

  $watch() {
    return (name, func) => {
      this.watch[name] = func;
    }
  }

  // TODO: To be implemented in later Alpha builds
  // const $emit = (selector) => {
  //   return{
  //     send: (data) => {
  //       try{
  //         if(data){
  //           // const views = this.component
  //           const parent = this.parent
  //           const func = this.emit[selector];
  //           try{
  //             if(Object.keys(component[parent].emit).length > 0){
  //               func(data);
  //             }else{
  //               throw(`Parent component ${parent} needs an $event.recieve()`)
  //             }
  //           }
  //           catch(e){
  //             console.error(e)
  //           }
  //         }else{
  //           throw(`There was not data sent from ${selector}`);
  //         }
  //       }
  //       catch(e){
  //         console.error(e)
  //       }
  //     }
  //   }
  // }

  // TODO: To be implemented in later Alpha builds
  // const $global = (selector) => {
  //   return {
  //     pinged: (func) => {
  //       this.component[selector].ping = func;
  //     }
  //   }
  // }

  $preCreated() {
    return (func) => {
      this.lifecycle.preCreated = func;
    }
  }

  $created() {
    return (func) => {
      this.lifecycle.created = func;
    }
  }

  $preUpdate() {
    return (func) => {
      this.lifecycle.preUpdate = func;
    }
  }

  $updated() {
    return (func) => {
      this.lifecycle.updated = func;
    }
  }

  $destroyed() {
    return (func) => {
      this.lifecycle.destroyed = func;
    }
  }

  // Set Component Data proxy
  setDataProxy() {
    const data = componentDataProxy('data', this.name);
    this.data = data.dataProxy.store;
  }

  // this.setDataProxy('props', viewName);

  // Set params
  params() {
    return {
      $data: this.data,
      // $props: this.component[viewName].propsProxy.store,
      // $state: this.stateMethods,
      $event: this.$event(),
      // $emit: this.$emit(),
      // $service: this.$service(),
      $watch: this.$watch(),
      // $global: this.$global(),
      $preCreated: this.$preCreated(),
      $created: this.$created(),
      $preUpdate: this.$preUpdate(),
      $updated: this.$updated(),
      $destroyed: this.$destroyed()
    }
  }

  init() {
    this.setDataProxy();
    const controller = this.script.innerHTML.trim();
    const params = this.params();
    const argsNames = '$data, $event, $watch, $preCreated, $created, $preUpdate, $updated, $destroyed'
    const func = new Function(argsNames, controller);
    func(params.$data, params.$event, params.$watch, params.$preCreated, params.$created, params.$preUpdate, params.$updated, params.$destroyed);

    return this;
  }
}

function setController(name, script) {
  return new Controller(name, script);
}

class Component {
  constructor(template, script, root) {
    this.template = template;
    this.script = script;
    this.root = root;

    this.currentDom = [];

    this.name = ''
    this.module = '';
    this.parent = '';
    this.components = {}

    this.setup();
  }

  // dataWatch(path, oldData, newData, name) {
  //   const func = this.component[name].watch[path];
  //   if (func) {
  //     func(oldData, newData);
  //   }
  // }


  setup() {
    this.name = `${this.script.getAttribute('name')}-${Math.random().toString(36).substring(2,8+2)}`;

    const controllerVars = setController(this.name, this.script);
    const clonedTemplate = this.template.content.cloneNode(true)

    const domWrapper = document.createElement('div');
    domWrapper.appendChild(clonedTemplate);

    const htmlContent = buildVDom(domWrapper, this.name);
    const templateDom = prepareDom(htmlContent, controllerVars);
    renderDom(this.root, templateDom);

    this.currentDom = templateDom;
  
    listeners(this.root, controllerVars);
  }
}

function component(template, script, root) {
  return new Component(template, script, root);
}

class Compile {
  constructor(doc) {
    this.doc = doc;
    this.template = '';
    this.script = '';

    this.init();
  }

  init() {
    let domparser = new DOMParser();
    const html = domparser.parseFromString(this.doc, 'text/html').querySelector('head');

    this.script = html.querySelector('script');
    this.template = html.querySelector('template');
  }
}

function render(rootComponent, target) {
  const root = document.querySelector(target);
  const compiled = new Compile(rootComponent);
  component(compiled.template, compiled.script, root);
}

export {render, component};