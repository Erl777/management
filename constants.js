const localStorageKey = "management_demo";

const TASK_PRIORITY = {
    DONE: -1,
    DEFERRED: 0,
    NORMAL: 1,
    IMPORTANT: 2,
    URGENT: 3,
    IMP_AND_URG: 4,
    TODAY: 5
}

const TODAY = new Date()
const TODO_OUTDATED_DAYS_VALUE = 2;

const STORE_DEFAULT_OBJECT = {
    date: TODAY.toDateString(),
    doneToday: 0,
    doneTotal: 0,
    todos: []
}