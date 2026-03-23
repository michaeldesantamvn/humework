// Создайте объект person с несколькими свойствами, содержащими информацию о вас
const person = {
    name: "Алексей",
    age: 25,
    city: "Москва",
    profession: "Разработчик",
    hobby: "Чтение книг"
};

// Выведите значения этих свойств в консоль
console.log("Имя:", person.name);
console.log("Возраст:", person.age);
console.log("Город:", person.city);
console.log("Профессия:", person.profession);
console.log("Хобби:", person.hobby);

// Альтернативный способ - вывести весь объект
console.log(person);

// Создайте функцию isEmpty, которая проверяет является ли переданный объект пустым
function isEmpty(obj) {
    // Проверяем количество ключей в объекте
    return Object.keys(obj).length === 0;
}

// Примеры использования:
console.log(isEmpty({})); // true
console.log(isEmpty({ name: "Алексей" })); // false
console.log(isEmpty({ a: 1, b: 2 })); // false

// Создайте объект task с несколькими свойствами
const task = {
    title: "Изучить JavaScript",
    description: "Понять работу с объектами и функциями",
    isCompleted: false
};

// Напишите функцию cloneAndModify
function cloneAndModify(object, modifications) {
    // Создаем копию объекта с помощью spread оператора и применяем изменения
    const clonedObject = { ...object, ...modifications };
    
    // Выводим все свойства полученного объекта с помощью цикла for in
    console.log("Свойства нового объекта:");
    for (let key in clonedObject) {
        console.log(`${key}: ${clonedObject[key]}`);
    }
    
    return clonedObject;
}

// Пример использования:
const modifiedTask = cloneAndModify(task, {
    isCompleted: true,
    priority: "high"
});

console.log("Оригинальный объект:", task);
console.log("Модифицированная копия:", modifiedTask);

// Создайте функцию callAllMethods, которая принимает объект и вызывает все его методы
function callAllMethods(obj) {
    for (let key in obj) {
        // Проверяем, является ли свойство функцией (методом)
        if (typeof obj[key] === 'function') {
            // Вызываем метод
            obj[key]();
        }
    }
}

// Пример использования:
const myObject = {
    method1() {
        console.log('Метод 1 вызван');
    },
    method2() {
        console.log('Метод 2 вызван');
    },
    method3() {
        console.log('Метод 3 вызван');
    },
    property: 'Это не метод',
    value: 42
};

callAllMethods(myObject);
// Вывод:
// Метод 1 вызван
// Метод 2 вызван
// Метод 3 вызван