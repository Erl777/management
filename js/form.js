class Form {
    constructor() {
        this.modal = document.getElementById('create-todo-modal')
        this.modal_title = document.querySelector('.form .input-title')
        this.modal_description = document.querySelector('.form textarea')
        this.modal_important = document.querySelector('.form input[name="important"]')
        this.modal_urgent = document.querySelector('.form input[name="urgent"]')
        this.modal_repeated = document.querySelector('.form input[name="repeated"]')
        this.modal_need_date = document.querySelector('.form input[name="deferred"]')
        this.modal_date_input = document.querySelector('.form input[type="date"]')
    }

    createTodo() {
        const form = {
            id: new Date().getTime(),
            title: this.modal_title.value,
            description: this.modal_description.value,
            important: this.modal_important.checked,
            urgent: this.modal_urgent.checked,
            deferred: null,
            isDone: false,
            done: null,
            repeated: this.modal_repeated.checked,
        }
        const needDate = this.modal_need_date.checked // отмечен ли чекбокс запланировать
        if (form.repeated) {
            form.deferred = TODAY.toISOString()
            form.urgent = true
        }
        if (needDate) {
            form.deferred = this.modal_date_input.value
            form.urgent = true
        }
        todos.addTodo(form)
        this.clear()
    }

    clear() {
        this.modal.reset()
        document.querySelector('.form-date').classList.add('hidden')
    }
}
