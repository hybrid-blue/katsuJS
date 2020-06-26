# bladeJS

A reactive, directive-based library for creating User Interfaces.

BladeJS is the go-to solution for creating fully functional UI components in short-time, by using an minimal coding and vast array of built-in directives.

Rather than competing to be the smallest UI library, BladeJs focuses on offering the best tools to create awesome User Interfaces!


This library is currently in Beta/Development stage and may contain error that are currently being address



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
