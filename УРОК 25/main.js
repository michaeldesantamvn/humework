function calculateFinalPrice(basePrice, discountPercent, taxRate) {
    const discount = basePrice * (discountPercent / 100);
    const priceAfterDiscount = basePrice - discount;
    const finalPrice = priceAfterDiscount * (1 + taxRate);
    return finalPrice;
}

console.log(calculateFinalPrice(100, 10, 0.2)); // 108
console.log(calculateFinalPrice(100, 10, 0)); // 90

function checkAccess(username, password) {
    if (username === "admin" && password === "123456") {
        return "Доступ разрешен";
    }
    return "Доступ запрещен";
}

function getTimeOfDay(hour) {
    if (hour < 0 || hour > 23) {
        return "Некорректное время";
    }
    
    if (hour >= 0 && hour <= 5) {
        return "Ночь";
    } else if (hour >= 6 && hour <= 11) {
        return "Утро";
    } else if (hour >= 12 && hour <= 17) {
        return "День";
    } else {
        return "Вечер";
    }
}

function findFirstEven(start, end) {
    for (let i = start; i <= end; i++) {
        if (i % 2 === 0) {
            return i;
        }
    }
    return "Чётных чисел нет";
}

console.log(findFirstEven(1, 10)); // 2
console.log(findFirstEven(9, 9)); // "Чётных чисел нет"