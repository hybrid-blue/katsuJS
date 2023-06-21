class TodoItem {
    parent = 'Todo'

    view() {
      return `
      <div>
        <span>{{title}}</span> -
        <span>Hello, {{name}}</span>
      </div>
      `;
    }
    data() {
      return {
        name: 'Johnny'
      }
    }
    controller($data, $props) {
      console.log($props);
      console.log($data);
      $data.name = `${$props.title} David`;
    }
  }

export default TodoItem;
