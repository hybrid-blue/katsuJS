# KatsuJS

A reactive, directive-based library for creating User Interfaces with simple components.

KatsuJS is the go-to solution for front-end development using an minimal coding and vast array of built-in directives.

This library is currently in InDev/Development stage and may contain errors and missing core features that are currently being address

```javascript
const app = new Katsu();
```

```javascript
// Basic Component

class Hello{
  view(){
    return `
      <h1>{{message}}</h1>
    `
  }
  data(){
    return {
      message: 'Hello World'
    }
  }
}

```

```javascript
app.render([Hello], '#root')
```

Basic Component example => https://codepen.io/hybrid-blue/pen/KKVozgj

Clock example => https://codepen.io/hybrid-blue/pen/WNrzxbv

TODO list => https://codepen.io/hybrid-blue/pen/ZEQgGMV
