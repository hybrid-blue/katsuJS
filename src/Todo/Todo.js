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
          "Draw Things"
        ]
      }
    }
    controller($data, $event) {
      setTimeout(() => {
        $data.parent = 'I`m the Parent';
      }, 1000);
      console.log($data);
    }
  }

  export default Todo;