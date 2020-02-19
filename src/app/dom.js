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

    const buildNodes = (thisnode) => {

      return Array.prototype.map.call(thisnode.childNodes, (node => {


        // let nextNode = node.nextSibling;
        if(node.attributes){
          // let nextNode = node.nextSibling;
          let selector = node.getAttribute(`data-blade-if`);


          if(selector){

            var thisElm = window.blade.elements['id1'];
            let iou = document.createComment('element-hidden');

            if(typeof window.blade.data[selector] === 'boolean'){
              if(!eval(window.blade.data[selector])){
                window.blade.elements['hidden'] = {elm: node, state: false};
                node = iou;
              }else{
                window.blade.elements['hidden'] = {elm: node, state: true};
                console.log(thisnode)
                node = window.blade.elements['hidden'].elm;
              }
            }else{
              console.log(typeof selector)
              var exp = (typeof selector === 'string' ? window.blade.data[selector] : selector);
              if(!eval(exp)){
                window.blade.elements['hidden'] = {elm: node, state: false};
                node = iou;
              }else{
                window.blade.elements['hidden'] = {elm: node, state: true};
                node = window.blade.elements['hidden'].elm;
              }
            }
            console.log('-------------');
            console.log(node);
            console.log('-------------');
          }
        }


        if(node.attributes){
          [...node.attributes].forEach((attr) => {
            switch(attr.name){
              case 'data-blade-for':
                this.directiveFor(attr.value, node)
              break;

              case 'data-blade-switch':
                this.directiveSwitch(attr.value, node)
              break;

              case 'data-blade-case':
                this.directiveCase(attr.value, node)
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

                      func(...arg);
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
                        window.blade.data = Object.assign({}, window.blade.data, data);
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
            }
          });
        }

        var map, thisNode = node.textContent.trim(), emptyArray = [];

        var map = {
          type: node.nodeType === 3 ? 'text' : (node.nodeType === 1 ? node.tagName.toLowerCase() : (node.nodeType === 8 ? 'comment' : null)),
          content: node.childNodes && node.childNodes.length > 0 ? null : (/{{(.*?)}}/g.test(node.textContent) ? this.expressions(node.textContent) : node.textContent),
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
      var attrObj = {};
      attrObj[attr.name] = attr.value;
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
