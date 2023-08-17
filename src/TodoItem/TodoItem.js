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
      $event.on('changeText', () => {
        console.log($props);
        $data.name = `${$props.title} David`;
      });
    }
  }

export default TodoItem;
