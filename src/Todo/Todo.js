import View from './Todo.html';

class Todo {
    view() {
        return View;
    }
    data() {
      return {
        items: [
          "Do washing up",
          "Make Dinner",
          "Finish KatsuJS alpha build",
          "Draw Booba"
        ]
      }
    }
    controller($data, $event) {
      // $event.on('addToList', () => {
      //   console.log($data.newItem)
      //   $data.items.push($data.newItem)
      //   $data.newItem = '';
      // })
      // $event.on('deleteItem', (e) => {
      //   let array = $data.items;
      //   array.splice(e.index, 1);
      // })
      // $event.on('changeVal', (val) => {
      //   console.log(val)
      //   $data.three = parseInt(val);
      // })
      $data.parent = 'I`m the Parent';
    }
  }

  export default Todo;