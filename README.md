# KatsuJS

A reactive, directive-based library for creating User Interfaces with simple components.

KatsuJS is the go-to solution for front-end development using an minimal coding and vast array of built-in directives.

This library is currently in Beta/Development stage and may contain error that are currently being address

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
      msg: 'Hello World'
    }
  }
}

```

```javascript
app.render([Hello], '#root')
```


```javascript
// Functional Component

class Hello{
  view(){
    return `
      <h1>{{message}}</h1>
    `
  }
  controller($data){
    $data.message = 'Hello World'
  }
}

```
