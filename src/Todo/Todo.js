import View from './Todo.html';

class Todo {
    view() {
        return View;
    }
    data() {
      return {
        pokemon: [],
        items: [
          "Do washing up",
          "Make Dinner",
          "Finish KatsuJS alpha build",
          "Draw Things"
        ],
        buttonStyle: [
          'button--style-a',
          'button--style-b',
          'button--style-c',
        ],
        switch: 'one',
        display: true,
        currentPokemon: null,
        movies: [
          {name: 'Fellowship fo the Ring', isFav: false},
          {name: 'Two Towers', isFav: false},
          {name: 'Return of the King', isFav: false},
        ],
        formInput: 'Hello'
      }
    }
    controller($data, $event, $watch, $state, $global) {
      // List rendering with Functional Data
      $data.filteredMovies = () => $data.movies.filter((movie) => movie.isFav);

      $event.on('changeFilteredData', (e, data) => {
        $data.movies[data.index].isFav = e.target.checked;
      });

      $event.on('forceChange', () => {
        $data.formInput = 'GoodBye';
      });

      $global.pinged(() => {
        $data.pokemon = $state.getPokedex();
      })

      setTimeout(() => {
        $data.parent = 'I`m the Parent';
      }, 1000);

      $watch('display', (oldVal, newVal) => {
        console.log('Display has been updated');
        $data.switch = 'three';
      })

      $event.on('getPokemon', (e) => {
        console.log('Get Pokemon');
        fetch(`https://pokeapi.co/api/v2/pokemon/${e.target.value}/`).then((res) => res.json()).then((json) => {
          $data.currentPokemon = json;
        })
      });

      $event.on('changeText', (e, index) => {
        console.log(index);
        alert(`Hello World - ${index}`);
      });

      $event.on('changeStyle', (e, text, text2) => {
        $data.buttonStyle[1] = 'button--style-d';
      });

      $event.on('changeCase', () => {
        $data.switch = 'two';
      });

      $event.on('removeElm', () => {
        $data.display = !$data.display;
      });

      $event.on('editElm', (e) => {
        console.log(e);
      });

      $event.on('editChange', (e) => {
        console.log(e.target.value);
      });
    }
    components() {
      return [
        'TodoItem'
      ]
    }
  }

  export default Todo;