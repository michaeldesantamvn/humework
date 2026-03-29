const users = [
  { name: 'Alex', age: 24, isAdmin: false },
  { name: 'Bob', age: 13, isAdmin: false },
  { name: 'John', age: 31, isAdmin: true },
  { name: 'Jane', age: 20, isAdmin: false },
];

// Добавляем двух пользователей в конец массива
users.push(
  { name: 'Ann', age: 19, isAdmin: false },
  { name: 'Jack', age: 43, isAdmin: true }
);

console.log(users);

function getUsersAverageAge(users) {
    const totalAge = users.reduce((sum, user) => sum + user.age, 0);
    return totalAge / users.length; // Исправлено: length, а не lenght
}

const averageAge = getUsersAverageAge(users);
console.log(averageAge); // 25

function getAllAdmins(users) {
  // Фильтруем пользователей, оставляя только администраторов
  return users.filter(user => user.isAdmin === true);
}

// Проверка работы функции
const admins = getAllAdmins(users);
console.log(admins); // [{ name: 'John', age: 31, isAdmin: true }, { name: 'Jack', age: 43, isAdmin: true }]

function first(arr, n) {
  if (n === undefined) return arr.slice(0, 1);
  return arr.slice(0, n);
}

// Проверка функции first
const numbers = [10, 20, 30, 40, 50];
console.log(first(numbers));     // [10]
console.log(first(numbers, 3));  // [10, 20, 30]
console.log(first(numbers, 0));  // []