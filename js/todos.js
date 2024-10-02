const isToday = (deferred) => TODAY.toDateString() === new Date(deferred).toDateString()

class Todos {
    constructor() {
        const { date, doneToday, doneTotal, todos} = JSON.parse(localStorage.getItem(localStorageKey))
        this.date = date
        this.doneToday = parseInt(doneToday)
        this.doneTotal = parseInt(doneTotal)
        this.tasks = todos

        this.init()
    }

    init() {
        this.checkOutdatedTasks()
        this.checkRepeatedTodos()
        this.checkHiddenTodos()
        if (!isToday(this.date)) {
            this.resetDayDoneCounter();
        }
    }

    checkRepeatedTodos() {
        this.tasks.filter(item => item.repeated).forEach(item => {
            if(item.isDone && !isToday(item.done)) {
                item.isDone = false
                item.done = null
            }
            item.deferred = TODAY.toISOString()
            item.urgent = true
        })
    }

    checkHiddenTodos() {
        this.tasks.filter(item => item.hidden).forEach(item => {
            if(!isToday(item.hidden)) {
                item.hidden = null
            }
        })
    }

    checkOutdatedTasks() {
        const outdatedTodosId = this.getDoneTodos().reduce((accum, item) => {
            const Difference_In_Time = TODAY.getTime() - new Date(item.done).getTime();
            const Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));
            if(Difference_In_Days > TODO_OUTDATED_DAYS_VALUE) {
                accum.push(item.id)
            }
            return accum
        }, [])
        if(outdatedTodosId.length) this.deleteTodosSilent(outdatedTodosId)
    }

    deleteTodosSilent(todoIds) {
        this.tasks = this.tasks.filter(item => !todoIds.includes(item.id))
    }

    increaseCounter() {
        this.doneToday += 1
        this.doneTotal += 1
        this.saveAll()
    }

    resetDayDoneCounter() {
        this.date = TODAY.toDateString()
        this.doneToday = 0
    }

    getTodoById(id) {
        return this.tasks.find(item => item.id === id)
    }

    saveAll() {
        const payload = {
            date: this.date,
            doneToday: this.doneToday,
            doneTotal: this.doneTotal,
            todos: this.tasks
        }
        localStorage.setItem(localStorageKey, JSON.stringify(payload))
        this.render()
    }

    getTodosCount() {
        return this.tasks.length
    }

    getDoneCount() {
        return this.doneTotal
    }

    getDoneTodos() {
        return this.tasks.filter(item => item.isDone)
    }

    getDoneToday() {
        return this.tasks.filter(item => item.isDone && isToday(item.done))
    }

    getToday() {
        return this.tasks.filter(item => getTodoPriority(item) === TASK_PRIORITY.TODAY)
    }

    getImportantAndUrgent() {
        return this.tasks.filter(item => getTodoPriority(item) === TASK_PRIORITY.IMP_AND_URG)
    }

    getImportant() {
        return this.tasks.filter(item => getTodoPriority(item) === TASK_PRIORITY.IMPORTANT)
    }

    getUrgent() {
        return this.tasks.filter(item => getTodoPriority(item) === TASK_PRIORITY.URGENT)
    }

    getOther() {
        return this.tasks.filter(item => {
            const priority = getTodoPriority(item)
            return priority === TASK_PRIORITY.NORMAL || priority === TASK_PRIORITY.DEFERRED
        })
    }

    addTodo(todo) {
        this.tasks.push(todo)
        this.saveAll()
    }

    setTodoDoneById(id) {
        const todo = this.getTodoById(id)
        if(todo) {
            todo.isDone = true
            todo.done = new Date().toISOString()
            this.increaseCounter()
        }
    }

    deleteTodoById(id) {
        this.tasks = this.tasks.filter(item => item.id !== id)
        this.saveAll()
    }

    hideTodoForToday(id) {
        const todo = this.getTodoById(id)
        if(todo) {
            todo.hidden = new Date().toISOString()
            this.saveAll()
        }
    }

    clearLists() {
        const columns = document.querySelectorAll(".column__body")
        columns.forEach(column => column.innerHTML = '')
    }

    renderLists() {
        this.clearLists()
        const columns = document.querySelectorAll(".column__body")
        columns.forEach(column => {
            const attr = column.getAttribute("id")
            const content = getTodosByColumnIdAttr(attr).reduce((accum, item) => {
                accum+= cardTemplate(item)
                return accum
            }, [])
            column.insertAdjacentHTML("beforeend", content)
        })
    }

    renderDoneCount() {
        const node = document.getElementById('done-count')
        node.innerHTML = ` ${this.getDoneCount()}`
    }

    render() {
        this.renderLists()
        this.renderDoneCount()
        calcEfficient()
    }

    debugById(id) {
        const todo = this.tasks.find(item => item.id === id)
        if(todo) {
            console.log(todo)
        } else {
            console.error(`${id} не найден`)
        }
    }
}

function cardTemplate(todo) {
    return`
    <div id='todo_${todo.id}' class='todo ${templateClassList(todo)}'>
        <header>
            <p class="title">${todo.title}</p>
        </header>
        <p class="description">${todo.description}</p>
        <div class="chips">
            ${getChips(todo)}
        </div>
        <div class="todo__actions">
            <button class="done-btn" onclick="todos.setTodoDoneById(${todo.id})">Готово</button>
            <button onclick="todos.deleteTodoById(${todo.id})">Удалить</button>
            <button onclick="todos.hideTodoForToday(${todo.id})">Скрыть</button>
        </div>
    </div>
    `
}

function templateClassList({hidden}) {
    let classesStr = '';
    if(hidden) classesStr += 'hidden'
    return classesStr
}

function getChips({important, urgent, deferred, done}) {
    let result = '';
    if (urgent && !deferred) result+= `<span class="chip urgent">Срочная</span>`
    if (important) result+= `<span class="chip important">Важная</span>`
    if (done) result+= `<span class="chip done">Выполнена</span>`
    if (deferred && isToday(deferred)) result+= `<span class="chip urgent">Срочная</span>`
    if (deferred && !isToday(deferred)) result+= `<span class="chip deferred">Отложенная</span>`
    return result
}

function getTodoPriority(todo) {
    const { important, urgent, deferred, done, repeated } = todo
    if(done) return TASK_PRIORITY.DONE
    if(deferred && !isToday(deferred)) {
        return TASK_PRIORITY.DEFERRED
    }
    if(important && !urgent) return TASK_PRIORITY.IMPORTANT
    if(urgent && !important || repeated && !important) return TASK_PRIORITY.URGENT
    if(important && urgent || important && repeated) return TASK_PRIORITY.IMP_AND_URG
    return TASK_PRIORITY.NORMAL
}

function getTodosByColumnIdAttr(columnIdAttr) {
    switch (columnIdAttr) {
        case 'list':
            return [...todos.getImportantAndUrgent(), ...todos.getUrgent(), ...todos.getImportant().reverse(), ...todos.getOther().reverse()]  //.sort((a, b) => b.id - a.id)
        case 'imp_and_urgent':
            return todos.getImportantAndUrgent()
        case 'urgent':
            return todos.getUrgent()
        case 'important':
            return todos.getImportant().reverse()
        case 'other':
            return todos.getOther().reverse()
        case 'done':
            return todos.getDoneToday()
            // .slice(0, 20) // (-20) ???
    }
}

function calcEfficient() {
    const deferredTodayTodos = todos.tasks.filter(item => item.urgent || isToday(item.deferred)) // item.urgent &&
    const doneTodayTodosCount = todos.doneToday
    const efficientValue = doneTodayTodosCount / (deferredTodayTodos.length || 1)
    const efficientPercent = Math.round(efficientValue * 100)
    console.log('calcEfficient', `${doneTodayTodosCount}/${deferredTodayTodos.length}`, efficientValue, efficientPercent)
    const meter = document.getElementById('progress')
    meter.value = efficientPercent
    const node = document.getElementById('progress-percent')
    node.innerHTML = efficientPercent + '%'
}
