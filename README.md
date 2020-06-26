# bladeJS

A front-end framework for building Single Page Applications.

This framework comes with a built-in router, scalable state management and template handling, so all you need to worry about is providing the content. Let BladeJS handle the heavy work!

This Framework is still under a lot of work and is not in a fully workable state.



```javascript

const app = new Blade();

class greetingMod{
  view(){
    return `
      <div>
        <h1>{{message}}</h1>
      </div>
    `
  }
  data(){
    return {
      message: 'Hello World'
    }
  }
}

const greeting = new app.module(greetingMod);

greeting.render('#root')

```
