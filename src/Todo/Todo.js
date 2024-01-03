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
        parent: 'Im the parent',
        buttonStyle: [
          'button--style-a',
          'button--style-b',
          'button--style-c',
        ],
        switch: 'one',
        display: true,
        currentPokemon: null,
        movies: [
          {name: 'Fellowship of the Ring', isFav: false},
          {name: 'Two Towers', isFav: true},
          {name: 'Return of the King', isFav: false},
        ],
        formInput: { name: 'Hello' }
      }
    }
    controller($data, $event, $watch, $state, $global, $preCreated, $created, $preUpdate, $updated, $destroyed) {
      // $preCreated((name) => {
      //   console.log('Component Before Created: ',name);
      // });

      // $preUpdate(() => {
      //   console.log('$preUpdate');
      // });

      $updated((obj) => {
        console.log('$updated');
        if (obj.currentPokemon) {
          if (obj.currentPokemon.name === 'vaporeon') {
            console.log('This is a Vaporeon!');
            console.log(obj);
          }
        }
      });

      // List rendering with Functional Data
      $data.filteredMovies = () => $data.movies.filter((movie) => movie.isFav);

      $event.on('changeFilteredData', (e, index) => {
        console.log(e, index);
        $data.movies[index].isFav = e.target.checked;
      });

      $event.on('forceChange', () => {
        $data.formInput.name = 'GoodBye';
      });

      $global.pinged(() => {
        $data.pokemon = $state.getPokedex();
      })

      $event.on('toggleComponent', () => {
        $data.display = !$data.display;
      })

      $event.on('getPokemon', (e) => {
        console.log('Get Pokemon');
        fetch(`https://pokeapi.co/api/v2/pokemon/${e.target.value}/`).then((res) => res.json()).then((json) => {
          console.log(json);
          $data.currentPokemon = json;
        })
      });

      $event.on('changeText', (e, data, index) => {
        alert(`${data} - ${index}`);
      });

      $event.on('changeStyle', (e, text, text2) => {
        $data.buttonStyle[1] = 'button--style-d';
      });

      $event.on('changeCase', () => {
        $data.switch = 'three';
      });
    }
    components() {
      return [
        'TodoItem'
      ]
    }
  }

  export default Todo;