// module.exports = require('./app/katsu.js').default;
import { default as Katsu }  from './app/katsu';
import { default as Todo }  from './Todo/Todo';
import { default as TodoItem }  from './TodoItem/TodoItem';

const app = new Katsu();

// app.init(() => {

// });

app.render([Todo, TodoItem], "#root");
