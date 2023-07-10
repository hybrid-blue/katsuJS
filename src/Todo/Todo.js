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
        ],
        buttonStyle: [
          'button--style-a',
          'button--style-b',
          'button--style-c',
        ],
        switch: 'one',
        display: true
      }
    }
    controller($data, $event) {
      setTimeout(() => {
        $data.parent = 'I`m the Parent';
      }, 1000);

      $event.on('changeText', (e, index) => {
        alert(`Hello World - ${index}`);
      });

      $event.on('changeStyle', (e, text, text2) => {
        console.log(text, text2)
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