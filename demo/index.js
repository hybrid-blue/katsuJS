// module.exports = require('./app/katsu.js').default;
import './style.css';
import { render }  from '../src';
import App  from './App.html';
// import { default as TodoItem }  from './TodoItem/TodoItem';

// const app = new Katsu();

// app.init(($state, $global) => {
//     fetch('https://pokeapi.co/api/v2/pokedex/2/').then((res) => res.json()).then((json) => {
//         appState.setPokedex(json.pokemon_entries);
//         $global.ping();
//     })

//     const appState = $state.create({
//         state: {
//             pokedex: {}
//         },
//         getters: {
//             getPokedex: ($state) => {
//                 return $state.pokedex;
//             },
//             getPokemon: ($state, id) => {
//                 return $state.pokedex.filter((pokemon) => pokemon.entry_number === id)[0];
//             }
//         },
//         setters: {
//             setPokedex: ($state, val) => {
//                 $state.pokedex = val;
//             }
//         }
//     });
//     // access via $global.state.getTitle
//     // Stored via $global.state.saveTitle = 'New Ktasu App'
// });

// app.render([Todo, TodoItem], "#root");
render(App, "#root");
