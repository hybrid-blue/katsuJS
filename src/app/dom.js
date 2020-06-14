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

        this.directives(node, this.viewName, this.virtualDom)

        if(node.nodeType === 1){
          // console.log(window.blade.component)
        }

        var map, thisNode = node.textContent.trim(), emptyArray = [];

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
