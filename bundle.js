!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Katsu=t():e.Katsu=t()}(window,(function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var a=t[n]={i:n,l:!1,exports:{}};return e[n].call(a.exports,a,a.exports,r),a.l=!0,a.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)r.d(n,a,function(t){return e[t]}.bind(null,a));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="/",r(r.s=5)}([function(e,t){function r(t){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?e.exports=r=function(e){return typeof e}:e.exports=r=function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},r(t)}e.exports=r},function(e,t){e.exports=function(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}},function(e,t,r){var n=r(7),a=r(8),o=r(9),i=r(10);e.exports=function(e){return n(e)||a(e)||o(e)||i()}},function(e,t){e.exports=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}},function(e,t){function r(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}e.exports=function(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}},function(e,t,r){e.exports=r(6).default},function(module,__webpack_exports__,__webpack_require__){"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,"default",(function(){return Katsu}));var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(2),_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__),_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(0),_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1__),_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(3),_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__),_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(4),_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3___default=__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__),_style_css__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__(11),_style_css__WEBPACK_IMPORTED_MODULE_4___default=__webpack_require__.n(_style_css__WEBPACK_IMPORTED_MODULE_4__);function _createForOfIteratorHelper(e,t){var r;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(r=_unsupportedIterableToArray(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,a=function(){};return{s:a,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:a}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,i=!0,c=!1;return{s:function(){r=e[Symbol.iterator]()},n:function(){var e=r.next();return i=e.done,e},e:function(e){c=!0,o=e},f:function(){try{i||null==r.return||r.return()}finally{if(c)throw o}}}}function _unsupportedIterableToArray(e,t){if(e){if("string"==typeof e)return _arrayLikeToArray(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?_arrayLikeToArray(e,t):void 0}}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var Katsu=function(){function Katsu(){_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2___default()(this,Katsu),this.viewName,this.targetElement,this.component={},this.forLoop=[],this.forCount=[],this.currentIteration,this.switchCase,this.expressStr,this.state={},this.root}return _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3___default()(Katsu,[{key:"poller",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return new Promise((function(r,n){var a=0,o=t?"document.querySelectorAll("+e+")["+t+"]":"document.querySelectorAll("+e+")",i=setInterval((function(){o||1e3===a?(clearInterval(i),r(!0)):a++}),1)}))}},{key:"pollerCase",value:function(e){return new Promise((function(t,r){var n=setInterval((function(){clearInterval(n),t(e)}),1)}))}},{key:"checkListener",value:function(e,t){if(e.getAttribute("data-kat-listening")){var r=e.getAttribute("data-kat-listening");return r.indexOf(t)>-1||(r+=",".concat(t),e.setAttribute("data-kat-listening",r),!1)}return e.setAttribute("data-kat-listening",t),!1}},{key:"expressions",value:function(e,t){var r,n=e.match(/(?<={{)(.*?)(?=\s*}})/g),a=e,o=_createForOfIteratorHelper(n);try{for(o.s();!(r=o.n()).done;){var i=r.value;if(i.indexOf(".")>-1)for(var c=i.split("."),l=this.component[t].data,s=0;s<c.length;s++)if(s===c.length-1)try{return a.replace("{{".concat(i,"}}"),l[c[s]])}catch(e){return a.replace("{{".concat(i,"}}"),"")}else try{l=l[c[s]]}catch(e){l=""}else null!==this.component[t].data[i]&&this.component[t].data[i]&&(a=a.replace("{{".concat(i,"}}"),this.component[t].data[i]))}}catch(e){o.e(e)}finally{o.f()}return a}},{key:"generateExp",value:function(e,t){return"object"===_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default()(e[t])?(this.expressStr+="".concat(t,"."),this.generateExp(e[t],Object.keys(e[t])[0])):this.expressStr+=t,this.expressStr}},{key:"getEventValues",value:function(e,t,r,n){var a,o=this,i={},c=function(e){e.parentNode.children;for(var n=e,a=Array.prototype.slice.call(document.querySelectorAll('[data-kat-for="'.concat(n.getAttribute("data-kat-for"),'"]'))),i=o.component[t].data[r].length,c=a.length/i,l=0;l<c;l++)for(var s=0;s<i;s++){if(a[i*l+s].getAttribute("key-active"))return a[i*l+s].removeAttribute("key-active"),i*l+s-i*l}};if(function e(t){var r;t.parentNode.getAttribute("data-kat-for")?(t,(r=t.parentNode).setAttribute("key-active",!0),a=c(r)):t.getAttribute("data-kat-for")?(t.setAttribute("key-active",!0),a=c(t)):"BODY"!==t.tagName&&e(t.parentNode)}(e),"index"===n.trim())i.index=a;else{var l=n.trim();if(l.indexOf(".")>-1){var s=this.component[t].data[r][a];i.data=s[l.split(".")[1]]}else i.data=this.component[t].data[l]}return i}},{key:"directiveFor",value:function(e,t,r){var n,a=this,o=e.split(" ").pop(),i=e.split(" ")[0],c=t.outerHTML,l=this.component[r].data?this.component[r].data[o]:null,s=(document.createRange().createContextualFragment(t.innerHTML),function(e,t,r){return t||(t=[]),t.map((function(t,n){return function(e,t,r,n){var o;if("object"===_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default()(t))for(var i=0,c=Object.keys(t);i<c.length;i++){var l=c[i];a.expressStr="";var s,u=a.generateExp(t,l),f="".concat(r,".").concat(u);/[\.]/g.test(u)?(o=void 0,o=u.split("."),s=function e(t,r){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;if("string"==typeof Object.values(r[t[n]])[0])return Object.values(r[t[n]])[0];e(t,r[t[++n]],n)}(o,t)):s=t[l],e=(e=e.replace("{{".concat(f,"}}"),"{{".concat(l,"}}"))).replace("{{".concat(l,"}}"),s)}else e=e.replace("{{".concat(r,"}}"),t);return e}(function(e,t,r){var n;function a(e,t,r){var n=e;if(r.length>1){var a,o=_createForOfIteratorHelper(r);try{for(o.s();!(a=o.n()).done;){for(var i=a.value,c=!0,l=0,s=Object.keys(t);l<s.length;l++){var u=s[l];i.indexOf(u)>-1&&(c=!1)}n=c?n.replace(i,""):n}}catch(e){o.e(e)}finally{o.f()}}else{var f=r[0];c=!0;t&&(c=!1),n=c?n.replace(f,""):n}return n}if("object"===_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default()(t))for(var o=0,i=Object.keys(t);o<i.length;o++){i[o];var c=new RegExp("{{".concat(r,"(.*?)}}"),"g"),l=e.match(c);n=a(e,t,l)}else{var s=new RegExp("{{".concat(r,"(.*?)}}"),"g"),u=e.match(s);n=a(e,t,u)}return n}(e,t,r),t,r)})).join("")}(c,l,i));return s.length>0?(t.parentNode.replaceChild(document.createRange().createContextualFragment(s),t),n=l.length):n=0,n}},{key:"directives",value:function(e,t,r){var n=this,a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"default",o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:null,i=arguments.length>5&&void 0!==arguments[5]?arguments[5]:null,c=arguments.length>6?arguments[6]:void 0,l=(this.virtualDom.bind(this),this.updateDom.bind(this),this.updateData.bind(this),function(e){var t,a=e.split(".");if(e.indexOf(".")>-1)for(var c=0;c<a.length;c++)0===c?n.component[r].data[i]&&(t=n.component[r].data[i][o]):t=t[a[c]];else t=n.component[r].data[e];return t});e.attributes&&_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(e.attributes).forEach((function(t){switch(t.name){case"data-kat-switch":var s=t.value,u=document.createComment("element-removed"),f=e.childNodes,d=function(e,t){if(t){var r,n=_createForOfIteratorHelper(e);try{for(n.s();!(r=n.n()).done;){var a=r.value;if("data-kat-case"===a.name&&a.value!==t)return!0}}catch(e){n.e(e)}finally{n.f()}}else{var o,i=_createForOfIteratorHelper(e);try{for(i.s();!(o=i.n()).done;){if("data-kat-default"===o.value.name)return!0}}catch(e){i.e(e)}finally{i.f()}}return!1};if(function(e){for(var t=l(s),r=0;r<f.length;r++)1===f[r].nodeType&&(d(f[r].attributes,t)?e.childNodes[r].replaceWith(u):e.childNodes[r].getAttribute("data-kat-default")||(n.switchCase=!0))}(e),n.switchCase)for(var p=0;p<f.length;p++)1===f[p].nodeType&&d(f[p].attributes,null)&&e.childNodes[p].replaceWith(u);break;case"data-kat-click":var v=n.component;setTimeout((function(){var l,s=function(e){n.checkListener(e,"click")||e.addEventListener("click",(function(a){setTimeout((function(){for(var a=t.value.match(/(?<=\()(.*?)(?=\s*\))/g),o=n.component[r].events[t.value.split("(")[0]],c={},l=a[0].split(","),s=0;s<l.length;s++)if(/\'(.*?)\'/g.test(l[s])){var u=l[s].trim(),f=u.substr(1,u.length-2);c.args=f}else c=n.getEventValues(e,r,i,l[s]);try{if(!o)throw'Cannot find event "'.concat(t.value.split("(")[0],'"');o(c)}catch(e){console.error(e)}}),1)}))};if(e.getAttribute("data-kat-click")===t.value)if("for"===a){if(l=c.querySelectorAll('[data-kat-click="'.concat(t.value,'"]'))[o]){var u=l.getAttribute("data-kat-listening");if(u)!function e(r,n,a){if(Array.isArray(r)){var i,l=_createForOfIteratorHelper(r);try{for(l.s();!(i=l.n()).done;){var s=i.value;if("click"===s){var u=c.querySelectorAll('[data-kat-click="'.concat(s.value,'"]'))[o+a];u&&(u.getAttribute("data-kat-listening")?e(r,u,a+=a):m=u)}}}catch(e){l.e(e)}finally{l.f()}}else if("click"===r){var f=c.querySelectorAll('[data-kat-click="'.concat(t.value,'"]'))[o+a],d=n.getAttribute("data-kat-listening");f&&(f.getAttribute("data-kat-listening")?e(d,f,a+=a):m=f)}}(u,l,v[r].localStore.store[i].length),l=m;l&&s(l)}}else{var f,d=_createForOfIteratorHelper(l=document.querySelectorAll('[data-kat-click="'.concat(t.value,'"]')));try{for(d.s();!(f=d.n()).done;){s(f.value)}}catch(e){d.e(e)}finally{d.f()}}}),1);break;case"data-kat-key":var m;v=n.component;setTimeout((function(){var l,s=function(e){n.checkListener(e,"key")||e.addEventListener("keydown",(function(a){setTimeout((function(){for(var a=t.value.match(/(?<=\()(.*?)(?=\s*\))/g),o=n.component[r].events[t.value.split("(")[0]],c={},l=a[0].split(","),s=0;s<l.length;s++)if(/\'(.*?)\'/g.test(l[s])){var u=l[s].trim(),f=u.substr(1,u.length-2);c.args=f}else c=n.getEventValues(e,r,i,l,s);try{if(!o)throw"Cannot find event ".concat(t.value.split("(")[0]);o(c)}catch(e){console.error(e)}}),1)}))};if(e.getAttribute("data-kat-key")===t.value)if("for"===a){var u=(l=c.querySelectorAll('[data-kat-key="'.concat(t.value,'"]'))[o]).getAttribute("data-kat-listening");if(u)!function e(r,n,a){if(Array.isArray(r)){var i,l=_createForOfIteratorHelper(r);try{for(l.s();!(i=l.n()).done;){var s=i.value;if("key"===s){var u=c.querySelectorAll('[data-kat-key="'.concat(s.value,'"]'))[o+a];u&&(u.getAttribute("data-kat-listening")?e(r,u,a+=a):m=u)}}}catch(e){l.e(e)}finally{l.f()}}else if("key"===r){var f=c.querySelectorAll('[data-kat-key="'.concat(t.value,'"]'))[o+a],d=n.getAttribute("data-kat-listening");f&&(f.getAttribute("data-kat-listening")?e(d,f,a+=a):m=f)}}(u,l,v[r].localStore.store[i].length),l=m;l&&s(l)}else{var f,d=_createForOfIteratorHelper(l=document.querySelectorAll('[data-kat-key="'.concat(t.value,'"]')));try{for(d.s();!(f=d.n()).done;){s(f.value)}}catch(e){d.e(e)}finally{d.f()}}}),1);break;case"data-kat-bind":var _=n.checkListener,h=(v=n.component,function(e,n){var a;_(e,"bind")||(a="text"===e.getAttribute("type")?"keydown":"checkbox"===e.getAttribute("type")?"click":"keydown",e.addEventListener(a,(function(c){setTimeout((function(){var l="keydown"===a?c.target.value:c.target.checked,s={};if("for"!==n)s[t.value]=l,v[r].localStore.store[t.value]=l;else{for(var u,f,d=function e(t){t.parentNode.getAttribute("data-kat-for")?u=t.parentNode:e(t.parentNode)},p=t.value.split("."),m=v[r].data,_=0;_<p.length;_++){if(0===_)d(e),f=m[u.getAttribute("data-kat-for").split(" ").pop()];else f[o][p[_]]=l}s[i]=f,v[r].localStore.store[i]=s[i]}}),1)})))});e.getAttribute("data-kat-bind")===t.value&&n.poller('[data-kat-bind="'.concat(t.value,'"]')).then((function(e){var n,l;if("for"===a){if(n=c.querySelectorAll('[data-kat-bind="'.concat(t.value,'"]'))[o])var s=n.getAttribute("data-kat-listening");if(s){var u=v[r].localStore.store[i].length;findNextValidElm(s,n,u),n=l}n&&h(n,a)}else{var f,d=_createForOfIteratorHelper(n=document.querySelectorAll('[data-kat-bind="'.concat(t.value,'"]')));try{for(d.s();!(f=d.n()).done;){var p=f.value;p.value=v[r].localStore.store[t.value]||"",h(p,a)}}catch(e){d.e(e)}finally{d.f()}}}));break;case"data-kat-class":setTimeout((function(){var i,c,s=function(a,o){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"default";if(t.value.indexOf("{")>-1){W=(W=(W=t.value).substr(1,t.value.length)).substr(0,t.value.length-2);var c,l=[],s=[],u=[],f=W.split(","),d=_createForOfIteratorHelper(f);try{for(d.s();!(c=d.n()).done;){var p=c.value,v=p.split(":");l.push(v)}}catch(e){d.e(e)}finally{d.f()}for(var m=0,_=l;m<_.length;m++){for(var h=_[m],y=void 0,b=void 0,g=0;g<h.length;g++)0===g?y=h[g].trim():b=h[g].trim();u.push(y),s.push(JSON.parse('{"'.concat(y,'": "').concat(b,'"}')))}a.classList.add(e.classList.value);for(var k=[],A=0,O=s;A<O.length;A++){var w=O[A],E=Object.keys(w),S=Object.values(w);e.classList.value.split(" "),a.classList.value.split(" ");n.component[r].data[S]&&k.push(E[0])}var x=e.classList.value.split(" "),N=a.classList.value.split(" "),C=k.filter((function(e){var t,r=[],n=_createForOfIteratorHelper(u);try{for(n.s();!(t=n.n()).done;){var a=t.value;r.push(e!==a)}}catch(e){n.e(e)}finally{n.f()}return r})),D=N.filter((function(e){var t,r=_createForOfIteratorHelper(x);try{for(r.s();!(t=r.n()).done;){return e!==t.value}}catch(e){r.e(e)}finally{r.f()}}));if(JSON.stringify(C)!==JSON.stringify(D)){var L;L=C.length>0?D.filter((function(e){var t,r=_createForOfIteratorHelper(C);try{for(r.s();!(t=r.n()).done;){return e!==t.value}}catch(e){r.e(e)}finally{r.f()}})):D;var I,M=_createForOfIteratorHelper(L);try{for(M.s();!(I=M.n()).done;){var P=I.value;a.classList.remove(P)}}catch(e){M.e(e)}finally{M.f()}var T,j=e.classList.value.split(", "),q=j.concat(C),F=_createForOfIteratorHelper(q);try{for(F.s();!(T=F.n()).done;){var H=T.value;a.classList.add(H)}}catch(e){F.e(e)}finally{F.f()}}}else{var R=e.classList.value.split(" "),K=a.classList.value.split(" "),U=K.filter((function(e){var t,r=_createForOfIteratorHelper(R);try{for(r.s();!(t=r.n()).done;){return e!==t.value}}catch(e){r.e(e)}finally{r.f()}}));if("boolean"===i){var B,W,$=_createForOfIteratorHelper(U);try{for($.s();!(B=$.n()).done;){var J=B.value;a.classList.remove(J)}}catch(e){$.e(e)}finally{$.f()}l=[],s=[];var V,z=(W=(W=(W=JSON.stringify(o)).substr(1,W.length)).substr(0,W.length-1)).split(","),Y=(u=[],_createForOfIteratorHelper(z));try{for(Y.s();!(V=Y.n()).done;){var G=V.value,Q=G.split(":");l.push(Q)}}catch(e){Y.e(e)}finally{Y.f()}for(var X=0,Z=l;X<Z.length;X++){for(var ee=Z[X],te=void 0,re=void 0,ne=0;ne<ee.length;ne++)0===ne?te=ee[ne].trim():re=ee[ne].trim();u.push(te),s.push(JSON.parse("{".concat(te,": ").concat(re,"}")))}a.classList.add(e.classList.value);k=[];for(var ae=0,oe=s;ae<oe.length;ae++){var ie=oe[ae],ce=Object.keys(ie),le=Object.values(ie);le[0]&&k.push(ce[0])}e.classList.value.split(" "),a.classList.value.split(" ");k.length>0&&k.forEach((function(e){a.classList.add(e)}))}else if(JSON.stringify(U)!==JSON.stringify([o])){var se,ue=_createForOfIteratorHelper(U);try{for(ue.s();!(se=ue.n()).done;){var fe=se.value;a.classList.remove(fe)}}catch(e){ue.e(e)}finally{ue.f()}for(var de=[e.classList.value,o],pe=0,ve=de;pe<ve.length;pe++){var me=ve[pe];a.classList.add(me)}}}};if(e.getAttribute("data-kat-class")===t.value)if(c=t.value,"for"===a){var u=function e(t){t.parentNode.getAttribute("data-kat-for")?f=t.parentNode:e(t.parentNode)};i=document.querySelectorAll('[data-kat-class="'.concat(t.value,'"]'))[o];c.split(".").pop();for(var f,d=c,p=n.component[r].data,v=c.split("."),m=0;m<v.length;m++){if(0===m)u(i),d=p[f.getAttribute("data-kat-for").split(" ").pop()][o];else d=d[v[m]]}if("boolean"==typeof d){var _={};_[t.value.split(".").pop()]=d,s(i,_,"boolean",o)}else{var h,y=_createForOfIteratorHelper(i);try{for(y.s();!(h=y.n()).done;){var b=h.value;!b.classList.contains(c)&&c&&s(b,c)}}catch(e){y.e(e)}finally{y.f()}}}else{var g,k=_createForOfIteratorHelper(i=document.querySelectorAll('[data-kat-class="'.concat(t.value,'"]')));try{for(k.s();!(g=k.n()).done;){var A=g.value,O=l(t.value);({})[t.value]=O,s(A,O)}}catch(e){k.e(e)}finally{k.f()}}}),1);break;case"data-kat-src":n.poller('[data-kat-src="'.concat(t.value,'"]')).then((function(r){if(e.getAttribute("data-kat-src")===t.value){var n=l(t.value);if("for"===a)document.querySelectorAll('[data-kat-src="'.concat(t.value,'"]'))[o].setAttribute("src",n);else{var i,c=_createForOfIteratorHelper(document.querySelectorAll('[data-kat-src="'.concat(t.value,'"]')));try{for(c.s();!(i=c.n()).done;){i.value.setAttribute("src",n)}}catch(e){c.e(e)}finally{c.f()}}}}))}}))}},{key:"buildDom",value:function(e,t,r,n){var a=this,o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:"body",i=arguments.length>5&&void 0!==arguments[5]?arguments[5]:"default",c=arguments.length>6&&void 0!==arguments[6]?arguments[6]:null,l=new DOMParser,s=null!==c?l.parseFromString(e,"text/html").querySelectorAll(o)[0]:l.parseFromString(e,"text/html").querySelector(o),u=function e(o){return Array.prototype.map.call(o.childNodes,(function(o){var l;o.children&&function(){for(var e=o.children,r=e.length,n=function(n){if(e[n].attributes&&e[n].getAttribute("data-kat-for"))if(a.forLoop.includes(e[n].getAttribute("data-kat-for")))a.forCount.forEach((function(t,r){t.name===e[n].getAttribute("data-kat-for")&&t.count-1===n&&(a.forCount.splice(r,1),a.forLoop=a.forLoop.filter((function(e){return e.name!==a.forLoop.name})))}));else{if((l=a.directiveFor(e[n].getAttribute("data-kat-for"),e[n],t))>0){for(var o=e[n].getAttribute("data-kat-for").split(" ")[2],i=0;i<e.length;i++)e[i].setAttribute("data-index","".concat(o,"-").concat(i));a.forLoop.push(e[n].getAttribute("data-kat-for")),a.forCount.push({name:e[n].getAttribute("data-kat-for"),count:l+n})}r+=l-1}},i=0;i<r;i++)n(i)}();if(("#text"!==o.nodeName&&(o.getAttribute("data-index")?(c=parseInt(o.getAttribute("data-index").split("-")[1]),i="for",a.currentIteration=o.getAttribute("data-index").split("-")[0]):i=null),o.attributes)&&o.getAttribute("data-kat-if")){var s=function(e){var r,n=e.split(".");if(e.indexOf(".")>-1)for(var o=0;o<n.length;o++)0===o?a.component[t].data[a.currentIteration]&&(r=a.component[t].data[a.currentIteration][c]):r=r[n[o]];else r=a.component[t].data[e];return r};if(function(e,t){var r,n=_createForOfIteratorHelper(e);try{for(n.s();!(r=n.n()).done;){var a=r.value;if("data-kat-if"===a.name)if(!s(a.value))return!0}}catch(e){n.e(e)}finally{n.f()}return!1}(o.attributes)){var u=document.createComment("element-hidden");o=u}else a.switchCase=!0}a.directives(o,r,t,i,c,a.currentIteration,n);o.textContent.trim();return{type:3===o.nodeType?"text":1===o.nodeType?o.tagName.toLowerCase():8===o.nodeType?"comment":null,content:o.childNodes&&o.childNodes.length>0?null:/{{(.*?)}}/g.test(o.textContent)?a.expressions(o.textContent,t):o.textContent,attr:o.attributes?a.buildAttributes(o.attributes):8===o.nodeType?[]:null,node:o,children:e(o)}}))};return u(s)}},{key:"virtualDom",value:function(e,t,r,n){var a=this.buildDom(e,t,r,n);return this.forLoop=[],a}},{key:"buildAttributes",value:function(e){var t=this,r=[];return Object.values(e).map((function(e){var n,a=e.value.match(/(?<={{)(.*?)(?=\s*}})/g);if(a)for(var o=0;o<a.length;o++)n=e.value.replace("{{".concat(a[o],"}}"),t.component[t.viewName].data[a[o]]);else n=e.value;var i={};i[e.name]=n,r.push(i)})),r}},{key:"removeAttr",value:function(e,t){e.removeAttribute(t)}},{key:"setAttr",value:function(e,t,r){r.match(/(?<={{)(.*?)(?=\s*}})/g);e.setAttribute(t,r)}},{key:"setAttrs",value:function(e,t){var r=this;Object.keys(t).forEach((function(n){var a=Object.keys(t[n])[0],o=Object.values(t[n])[0];r.setAttr(e,a,o)}))}},{key:"updateAttr",value:function(e,t,r,n){r?n&&r===n||this.setAttr(e,t,r):this.removeAttr(e,t)}},{key:"updateAttrs",value:function(e,t,r){var n=this,a=t||{},o=r||{},i=Object.assign({},t,r);Object.values(i).forEach((function(t,r){var i=Object.keys(t)[0],c=a[r]?Object.values(a[r])[0]:null,l=o[r]?Object.values(o[r])[0]:null;n.updateAttr(e,i,c,l)}))}},{key:"createElm",value:function(e){if(!e)return document.createTextNode("");if("text"===e.type)return document.createTextNode(e.content);if("comment"===e.type)return document.createComment(e.content);if("string"==typeof e)return document.createTextNode(e);var t=document.createElement(e.type);return e.attr&&this.setAttrs(t,e.attr),e.children.map(this.createElm.bind(this)).forEach(t.appendChild.bind(t)),t}},{key:"changed",value:function(e,t){return _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default()(e)!==_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default()(t)||"string"==typeof e&&e!==t||e.type!==t.type||e.content!==t.content}},{key:"updateDom",value:function(e,t,r){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:0;if(r){if(!t&&e.childNodes[n])e.removeChild(e.childNodes[n]);else if(this.changed(t,r)&&e.childNodes[n])e.replaceChild(this.createElm(t),e.childNodes[n]);else if(t){void 0!==e&&void 0!==e.childNodes[n]&&void 0!==e.childNodes[n].attributes&&null!==t.attr&&t.attr.length>0&&this.updateAttrs(e.childNodes[n],t.attr,r.attr);for(var a=t.children.length,o=r.children.length,i=0;i<a||i<o;i++)this.updateDom(e.childNodes[n],t.children[i],r.children[i],i)}}else e.appendChild(this.createElm(t))}},{key:"dataProxy",value:function(e,t,r,n){var a=c(this.component[t].data,"data",console.log),o=this.updateData.bind(this),i=function(e){return Object.prototype.toString.call(e).slice(8,-1).toLowerCase()};function c(e,r,a){var s=arguments.length>3&&void 0!==arguments[3]?arguments[3]:[],u={get:function(e,t,r){return["object","array"].indexOf(i(e[t]))>-1?new Proxy(e[t],u):e[t]},set:function(e,a,i,c){var l={},u=s.concat(a);if(u.length>1)for(var f=0;f<u.length;f++)if(f===u.length-1){var d={};d[u[f]]=i,l[u[f-1]]=d}else 0===f?l[u[f]]={}:l[u[f-1]]={};else l[u[0]]=i;return e[a]=i,o(l,t,n,r),!0}};return new Proxy(Object.keys(e).reduce((function(t,n){return l(e[n])?t[n]=c(e[n],r,a,s.concat(n)):t[n]=e[n],t}),{}),u)}function l(e){return"object"===_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default()(e)&&!Array.isArray(e)}"state"===e?this.state&&Object.defineProperty(this.state,"store",{get:function(){return a},set:function(e){return a=c(e,"state",console.log),!0}}):this.component[t].data&&Object.defineProperty(this.component[t].localStore,"store",{get:function(){return a},set:function(e){return a=c(e,"data",console.log),!0}})}},{key:"state",value:function(e){if("object"!==_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default()(e))return this.state;this.state=e}},{key:"updateData",value:function(e,t,r){var n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"data";"data"===n?this.component[t].data=Object.assign({},this.component[t].data,e):this.state=Object.assign({},this.state,e);var a=new DOMParser,o=r?document.querySelector('[data-kat-component="'.concat(t,'"]')).innerHTML:document.querySelector(this.component[t].root).innerHTML,i=(a.parseFromString(o,"text/html").querySelector("body").innerHTML,r?document.querySelector('[data-kat-component="'.concat(t,'"]')):document.querySelector(this.component[t].root)),c=this.virtualDom(this.component[t].template,t,r,i);if(this.component[t].vDomNew=c,this.updateDom(i,this.component[t].vDomNew[0],this.component[t].vDomPure[0]),this.component[t].vDomPure=this.component[t].vDomNew,this.component[t].components){var l,s=this.component[t].components,u=_createForOfIteratorHelper(s);try{for(u.s();!(l=u.n()).done;){var f=l.value;if(this.component[f].data){var d={},p=document.querySelectorAll('[data-kat-component="'.concat(f,'"]'))[0],v=p.getAttribute("props");d[v]=this.component[t].data[v],this.component[f].data=d,this.updateData(d[v],f,!0,n="data")}}}catch(e){u.e(e)}finally{u.f()}}}},{key:"render",value:function render(module,target){var _this9=this,childComponent=arguments.length>2&&void 0!==arguments[2]&&arguments[2],parent=arguments.length>3&&void 0!==arguments[3]?arguments[3]:null,viewName;if(childComponent)viewName=target,this.component[viewName].parent=parent;else{var mod=new module[0];this.viewName=module[0].name,this.component[this.viewName]={},this.component[this.viewName].template=mod.view(),mod.data?this.component[this.viewName].data=mod.data():this.component[this.viewName].data={},mod.controller?this.component[this.viewName].controller=mod.controller:this.component[this.viewName].controller=null,module[1]?this.component[this.viewName].katsuMeta=module[1]:this.component[this.viewName].katsuMeta=null,viewName=module[0].name}this.component[viewName].root=target;var $event=function(e){return{on:function(t,r){_this9.component[e].events[t]=r},receive:function(t,r){_this9.component[e].emit[t]=r}}},$emit=function(e){return{send:function(t){try{if(!t)throw"There was not data sent from ".concat(e);_this9.component;var r=_this9.component[e].parent,n=_this9.component[r].emit[e];try{if(!(Object.keys(_this9.component[r].emit).length>0))throw"Parent component ".concat(r," needs an $event.recieve()");n(t)}catch(e){console.error(e)}}catch(e){console.error(e)}}}},serviceHandler={get:function(e,t,r){return e[t]}},$service=function(e){return new Proxy(_this9.component[e].service,serviceHandler)},updateData=this.updateData.bind(this);this.component[viewName].targetData={},this.component[viewName].events={},this.component[viewName].emit={},this.component[viewName].service={},this.component[viewName].localStore={},this.dataProxy("data",viewName,childComponent);var params={$data:this.component[viewName].localStore.store,$event:$event(viewName),$emit:$emit(viewName),$service:$service(viewName)},pollerComponent=function(e){return new Promise((function(t,r){var n=0,a="document.querySelector('[data-kat-component=\"".concat(e,"\"]')"),o=setInterval((function(){a||1e3===n?(clearInterval(o),t(!0)):n++}),1)}))},rendered;this.component[viewName].katsuMeta&&this.component[viewName].katsuMeta.length>0&&function(){var e=_this9.component[viewName].katsuMeta;_this9.component[viewName].components=[],rendered=[];for(var t=function(t){var r=new e[t];r.service?_this9.component[viewName].service[e[t].name]=r.service():pollerComponent(e[t].name).then((function(n){try{if(!r.view)throw e[t].name;if(_this9.component[e[t].name]={},_this9.component[e[t].name].template=r.view(),r.data){var a=document.querySelectorAll('[data-kat-component="'.concat(e[t].name,'"]'))[0].getAttribute("props");r.data(_this9.component[viewName].data[a]),_this9.component[e[t].name].data=_this9.component[viewName].data[a]}else _this9.component[e[t].name].data={};r.controller?_this9.component[e[t].name].controller=r.controller:_this9.component[e[t].name].controller=null,_this9.component[viewName].components.push(e[t].name)}catch(e){return console.error("Class ".concat(e," is not a valid block")),!1}if(_this9.component[viewName].components){var o,i=_createForOfIteratorHelper(_this9.component[viewName].components);try{for(i.s();!(o=i.n()).done;){var c=o.value;rendered.includes(c)||_this9.render(c,c,!0,viewName),rendered.push(c)}}catch(e){i.e(e)}finally{i.f()}}}))},r=0;r<e.length;r++)t(r)}();var template=this.component[viewName].template,targetElm=document.querySelector(target)||document.querySelectorAll('[data-kat-component="'.concat(viewName,'"]'))[0],htmlContent=this.virtualDom(template,viewName,childComponent,targetElm);this.component[viewName].vDomPure=htmlContent;var domparser=new DOMParser,htmlObject=domparser.parseFromString(template,"text/html").querySelector("body");this.updateDom(targetElm,htmlContent[0]),this.component[viewName].oldDom=domparser.parseFromString(template,"text/html").querySelector("body");var controller=this.component[viewName].controller||null;if(controller){var regex=/\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g,augs=controller.toString().match(regex)[0],attr=[],argsArray=augs.substr(1,augs.length-2).split(",");argsArray.forEach((function(e,t){attr.push(params[e.trim()])}));var extScript=function extScript(){eval(controller.apply(void 0,attr))},event=new Event("executeScript");window.addEventListener("executeScript",extScript),window.dispatchEvent(event),window.removeEventListener("executeScript",extScript)}}}]),Katsu}()},function(e,t,r){var n=r(1);e.exports=function(e){if(Array.isArray(e))return n(e)}},function(e,t){e.exports=function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}},function(e,t,r){var n=r(1);e.exports=function(e,t){if(e){if("string"==typeof e)return n(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?n(e,t):void 0}}},function(e,t){e.exports=function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}},function(e,t,r){var n=r(12),a=r(13);"string"==typeof(a=a.__esModule?a.default:a)&&(a=[[e.i,a,""]]);var o={insert:"head",singleton:!1};n(a,o);e.exports=a.locals||{}},function(e,t,r){"use strict";var n,a=function(){return void 0===n&&(n=Boolean(window&&document&&document.all&&!window.atob)),n},o=function(){var e={};return function(t){if(void 0===e[t]){var r=document.querySelector(t);if(window.HTMLIFrameElement&&r instanceof window.HTMLIFrameElement)try{r=r.contentDocument.head}catch(e){r=null}e[t]=r}return e[t]}}(),i=[];function c(e){for(var t=-1,r=0;r<i.length;r++)if(i[r].identifier===e){t=r;break}return t}function l(e,t){for(var r={},n=[],a=0;a<e.length;a++){var o=e[a],l=t.base?o[0]+t.base:o[0],s=r[l]||0,u="".concat(l," ").concat(s);r[l]=s+1;var f=c(u),d={css:o[1],media:o[2],sourceMap:o[3]};-1!==f?(i[f].references++,i[f].updater(d)):i.push({identifier:u,updater:_(d,t),references:1}),n.push(u)}return n}function s(e){var t=document.createElement("style"),n=e.attributes||{};if(void 0===n.nonce){var a=r.nc;a&&(n.nonce=a)}if(Object.keys(n).forEach((function(e){t.setAttribute(e,n[e])})),"function"==typeof e.insert)e.insert(t);else{var i=o(e.insert||"head");if(!i)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");i.appendChild(t)}return t}var u,f=(u=[],function(e,t){return u[e]=t,u.filter(Boolean).join("\n")});function d(e,t,r,n){var a=r?"":n.media?"@media ".concat(n.media," {").concat(n.css,"}"):n.css;if(e.styleSheet)e.styleSheet.cssText=f(t,a);else{var o=document.createTextNode(a),i=e.childNodes;i[t]&&e.removeChild(i[t]),i.length?e.insertBefore(o,i[t]):e.appendChild(o)}}function p(e,t,r){var n=r.css,a=r.media,o=r.sourceMap;if(a?e.setAttribute("media",a):e.removeAttribute("media"),o&&btoa&&(n+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(o))))," */")),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}var v=null,m=0;function _(e,t){var r,n,a;if(t.singleton){var o=m++;r=v||(v=s(t)),n=d.bind(null,r,o,!1),a=d.bind(null,r,o,!0)}else r=s(t),n=p.bind(null,r,t),a=function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(r)};return n(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap)return;n(e=t)}else a()}}e.exports=function(e,t){(t=t||{}).singleton||"boolean"==typeof t.singleton||(t.singleton=a());var r=l(e=e||[],t);return function(e){if(e=e||[],"[object Array]"===Object.prototype.toString.call(e)){for(var n=0;n<r.length;n++){var a=c(r[n]);i[a].references--}for(var o=l(e,t),s=0;s<r.length;s++){var u=c(r[s]);0===i[u].references&&(i[u].updater(),i.splice(u,1))}r=o}}}},function(e,t,r){(t=r(14)(!1)).push([e.i,':root {\n  font-family: "helvetica";\n  font-size: 16px;\n  color: #222;\n}\n',""]),e.exports=t},function(e,t,r){"use strict";e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var r=function(e,t){var r=e[1]||"",n=e[3];if(!n)return r;if(t&&"function"==typeof btoa){var a=(i=n,c=btoa(unescape(encodeURIComponent(JSON.stringify(i)))),l="sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(c),"/*# ".concat(l," */")),o=n.sources.map((function(e){return"/*# sourceURL=".concat(n.sourceRoot||"").concat(e," */")}));return[r].concat(o).concat([a]).join("\n")}var i,c,l;return[r].join("\n")}(t,e);return t[2]?"@media ".concat(t[2]," {").concat(r,"}"):r})).join("")},t.i=function(e,r,n){"string"==typeof e&&(e=[[null,e,""]]);var a={};if(n)for(var o=0;o<this.length;o++){var i=this[o][0];null!=i&&(a[i]=!0)}for(var c=0;c<e.length;c++){var l=[].concat(e[c]);n&&a[l[0]]||(r&&(l[2]?l[2]="".concat(r," and ").concat(l[2]):l[2]=r),t.push(l))}},t}}])}));
