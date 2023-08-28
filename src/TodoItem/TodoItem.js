class TodoItem {
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
    controller($data, $props, $event, $created, $destroyed) {
      $created((name) => {
        console.log('Component Created: ', name);
      });

      $destroyed((name) => {
        console.log('Component Destoryed: ', name);
      })

      $event.on('changeText', () => {
        console.log($props.title);
        $data.name = `${$props.title} David`;
      });
    }
  }

export default TodoItem;
