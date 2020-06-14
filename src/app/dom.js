import Compiler from './compiler';

export default class Dom extends Compiler{
  constructor(viewName){
    super()
    this.viewName = viewName;
    this.dom = document.querySelector('#root');
    this.vDom = []
  }

  buildDom(dom){
    let domparser = new DOMParser();
    var htmlobject = domparser.parseFromString(dom, 'text/html').querySelector('body');
    var switchCase = false;

    const buildNodes = (thisnode) => {

      return Array.prototype.map.call(thisnode.childNodes, (node => {

        // let nextNode = node.nextSibling;
        if(node.attributes){
          // let nextNode = node.nextSibling;
          let selector = node.getAttribute(`data-blade-if`);


          if(selector){

            var thisElm = window.blade.elements['id1'];
            let iou = document.createComment('element-hidden');

            if(typeof window.blade.view[this.viewName].data[selector] === 'boolean'){
              if(!eval(window.blade.view[this.viewName].data[selector])){
                window.blade.elements['hidden'] = {elm: node, state: false};
                node = iou;
              }else{
                window.blade.elements['hidden'] = {elm: node, state: true};
                node = window.blade.elements['hidden'].elm;
              }
            }else{
              var exp = (typeof selector === 'string' ? window.blade.view[this.viewName].data[selector] : selector);
              if(!eval(exp)){
                window.blade.elements['hidden'] = {elm: node, state: false};
                node = iou;
              }else{
                window.blade.elements['hidden'] = {elm: node, state: true};
                node = window.blade.elements['hidden'].elm;
              }
            }
          }
        }


        if(node.attributes){
          [...node.attributes].forEach((attr) => {
            switch(attr.name){
              case 'data-blade-for':
                this.directiveFor(attr.value, node, this.viewName)
              break;

              case 'data-blade-switch':
                window.blade.switch = attr.value;
              break;

              case 'data-blade-case':
                this.directiveCase(attr.value, node);
                let switchVal = window.blade.switch;
                let comment = document.createComment('case-element');
                if(attr.value !== window.blade.view[this.viewName].data[switchVal]){
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
                          newArgs.push(window.blade.view[this.viewName].data[args[i].trim()])
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
                        window.blade.view[this.viewName].data = Object.assign({}, window.blade.view[this.viewName].data, data);
                        let domparser = new DOMParser();
                        const root = document.querySelector('#root').innerHTML
                        var htmlObject = domparser.parseFromString(root, 'text/html').querySelector('body').innerHTML;

                        const htmlContent = this.virtualDom(window.blade.view[view].template);

                        window.blade.view[view].vDomNew = htmlContent;
                        const targetElm = document.querySelector('#root');

                        // this.updateDom(targetElm, window.blade.view[view].vDomNew[0], window.blade.view[view].vDomPure[0]);
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


                      let data = window.blade.view[this.viewName].data[value]

                      let nodeClass = node.classList.value.split(' ');
                      let targetClass = target.classList.value.split(' ');

                      if(window.blade.view[this.viewName].data[value]){
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

                    // console.log('~~~~~~~~~~~~')
                    // console.log(targetClass)
                    // console.log(JSON.stringify(newClasses));
                    // console.log(JSON.stringify(currentClasses))
                    // console.log('~~~~~~~~~~~~')

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

                    // for(let thisclass of newClasses){
                    //   target.classList.add(thisclass);
                    // }



                  }else{

                    // console.log('============');
                    // console.log(data);
                    // console.log(node.classList.value.split(' '));
                    // console.log(target.classList.value.split(' '));
                    // console.log('============');


                    let nodeClass = node.classList.value.split(' ');
                    let targetClass = target.classList.value.split(' ');

                    let newClasses = targetClass.filter(item => {
                      for(let thisClass of nodeClass){
                        return item !== thisClass;
                      }
                    })

                    let data = window.blade.view[this.viewName].data[attr.value];

                    console.log(JSON.stringify(newClasses));
                    console.log(JSON.stringify([data]));

                    if(JSON.stringify(newClasses) !== JSON.stringify([data])){
                      // Remove Blade Classes
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
                  document.querySelector(`[data-blade-src="${attr.value}"]`).src = window.blade.view[this.viewName].data[attr.value]
                }, 10)
              break;
            }
          });
        }


        if(node.nodeType === 1){
          // console.log(window.blade.component)
        }

        var map, thisNode = node.textContent.trim(), emptyArray = [];

        // console.log(node)
        // console.log(node.nodeType)

        // console.log('###############')
        // console.log(node.textContent)

        var map = {
          type: node.nodeType === 3 ? 'text' : (node.nodeType === 1 ? node.tagName.toLowerCase() : (node.nodeType === 8 ? 'comment' : null)),
          content: node.childNodes && node.childNodes.length > 0 ? null : (/{{(.*?)}}/g.test(node.textContent) ? this.expressions(node.textContent, this.viewName) : node.textContent),
          attr: node.attributes ? this.buildAttributes(node.attributes) : (node.nodeType === 8 ? emptyArray : null),
          node: node,
          children: buildNodes(node)
        }

        // console.log('++++++++++++++++++++++')
        // console.log(map)
        // console.log('++++++++++++++++++++++')

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
      // console.log(root.childNodes[index])
      if(root.childNodes[index] !== undefined){
        if(typeof root.childNodes[index].attributes !== 'undefined'){
          if(newNode.attr.length > 0){
            this.updateAttrs(root.childNodes[index], newNode.attr, oldNode.attr);
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
