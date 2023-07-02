class TodoItem {
    parent = 'Todo'

    view() {
      return `
      <div class="todo-item">
        <span>{{title}}</span> -
        <span data-kat-click="changeText()">Hello, {{name}}</span>
      </div>
      `;
    }
    data() {
      return {
        name: 'Johnny'
      }
    }
    controller($data, $props, $event) {
      // console.log($props);
      // console.log($data);
      $event.on('changeText', () => {
        $data.name = `${$props.title} David`;
      });
    }
  }

export default TodoItem;
