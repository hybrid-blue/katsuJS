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
    controller($data, $props, $event, $created, $destroyed, $updated) {
      $created((name) => {
        console.log('Component Created: ', name);
      });

      $updated((data) => {
        console.log('Component Updated: ', data);
      });

      $destroyed(() => {
        console.log('Component Destoryed');
      })

      $event.on('changeText', () => {
        console.log($props);
        $data.name = `${$props.title} David`;
      });
    }
  }

export default TodoItem;
