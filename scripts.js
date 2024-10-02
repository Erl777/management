const structure = {
    tasks: [
        {
            id: 0,
            title: 'Задача 1',
            description: 'описание задачи 1',
            urgent: false,
            important: false,
            deferred: '2024-07-05', // String || null
            isDone: false,
            done: '2024-07-31T08:11:54.823Z', // String || null
            repeated: false,
            // priority: 0 - рассчитывается на лету
            hidden: null // String || null
        },
    ]
}

if(!localStorage.hasOwnProperty(localStorageKey)) {
    localStorage.setItem(localStorageKey, JSON.stringify(STORE_DEFAULT_OBJECT))
}

const todos = new Todos()
todos.render()

const createForm = new Form()

function dateString() {
    const day = TODAY.getUTCDate()
    const month = TODAY.toLocaleString('default', { month: 'long' });
    const year = TODAY.getFullYear()
    const daysForNewYear = dateDiff(new Date('2025-01-01').getTime())
    return `Сегодня: ${day} ${month} ${year}. До нового года осталось ${daysForNewYear} дней`
}

function dateDiff(targetDate) {
    return Math.round((targetDate - TODAY.getTime()) / (1000 * 60 * 60 * 24));
}

function initEvents() {
    const deferredCheckbox = document.querySelector('.form input[name="deferred"]')
    const dateField = document.querySelector('.form-date')
    const modal = document.querySelector('.modal')
    const modalCancelBtn = document.querySelector('.create-todo-cancel')
    const addRoundedBtn = document.getElementById('add-rounded')
    const todayInfo = document.querySelector("#today-info")
    const focusModeCheckbox = document.querySelector('.mode-switch input[name="focus"]')

    deferredCheckbox.addEventListener('click', toggleDateVisibility)
    addRoundedBtn.addEventListener('click', toggleModalVisibility)
    modalCancelBtn.addEventListener('click', toggleModalVisibility)
    focusModeCheckbox.addEventListener('change', toggleFocusMode)
    todayInfo.innerHTML = dateString()

    function toggleModalVisibility() {
        if(modal) modal.classList.toggle('hidden')
    }
    function toggleDateVisibility() {
        if(dateField) dateField.classList.toggle('hidden')
    }
    function toggleFocusMode() {
        document.body.classList.toggle('mode-focus')
    }
    toggleFocusMode()
}

initEvents()