class TodoItem {
    parent = 'Todo'

    view() {
      return `
        <div>Hello, {{name}}</div>
      `;
    }
    // data() {
    //   return {
    //     name: 'Johnny'
    //   }
    // }
    controller($data) {
      $data.name = 'Johnny';
    }
  }

export default TodoItem;
