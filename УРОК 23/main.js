let number = 7; // example number

if (number % 2 === 0) {
    console.log("Число четное");
} else {
    console.log("Число нечетное");
}

// 1. Объявите переменную age с числовым значением
let age = 25;

// 2. С помощью тернарного оператора присвойте переменной discount значение скидки
let discount = age < 18 ? 10 : (age <= 65 ? 20 : 30);

// 3. Выведите значение discount в консоль
console.log(`Скидка: ${discount}%`);

// 4. *Дополнительное задание: перепишите задачу на switch-case
let discountSwitch;
switch (true) {
    case age < 18:
        discountSwitch = 10;
        break;
    case age >= 18 && age <= 65:
        discountSwitch = 20;
        break;
    case age > 65:
        discountSwitch = 30;
        break;
    default:
        discountSwitch = 0;
}
console.log(`Скидка (switch-case): ${discountSwitch}%`);

// 1. Объявите переменные username и password
// 2. Используйте prompt для ввода имени пользователя и пароля
let username = prompt("Введите имя пользователя (admin или user):");
let password = prompt("Введите пароль:");

// 3. Проверка условий и вывод результата
if ((username === "admin" || username === "user") && password === "123456") {
    alert("Доступ разрешен");
} else {
    alert("Доступ запрещен");
}

// 1. Ввод данных
let weight = parseFloat(prompt("Введите вес посылки (в килограммах):"));
let deliveryType = prompt("Введите тип доставки (Стандарт, Экспресс, Премиум):");

// 2. Проверка корректности данных
if (isNaN(weight) || weight <= 0) {
    alert("Некорректный вес посылки");
} else if (deliveryType !== "Стандарт" && deliveryType !== "Экспресс" && deliveryType !== "Премиум") {
    alert("Неверный тип доставки");
} else {
    // 3. Расчёт базовой стоимости доставки
    let baseCost;
    if (weight < 1) {
        baseCost = 5;
    } else if (weight <= 5) {
        baseCost = 10;
    } else {
        baseCost = 15;
    }
    
    // 4. Определение коэффициента по типу доставки
    let coefficient;
    switch (deliveryType) {
        case "Стандарт":
            coefficient = 1;
            break;
        case "Экспресс":
            coefficient = 1.5;
            break;
        case "Премиум":
            coefficient = 2;
            break;
        default:
            coefficient = 0;
    }
    
    // 5. Расчёт итоговой стоимости доставки
    let totalCost = baseCost * coefficient;
    
    // 6. Вывод результата
    alert(`Итоговая стоимость доставки: ${totalCost}$.`);
}