// Цикл, который выводит числа от 1 до 20, пропуская числа, делящиеся на 4
for (let i = 1; i <= 20; i++) {
    if (i % 4 === 0) {
        continue; // пропускаем числа, которые делятся на 4
    }
    console.log(i);
}

// Вычисление факториала числа
let number = parseInt(prompt("Введите число для вычисления факториала:"));
let factorial = 1;

if (isNaN(number) || number < 0) {
    console.log("Пожалуйста, введите неотрицательное число");
} else {
    for (let i = 1; i <= number; i++) {
        factorial *= i;
    }
    console.log(`Факториал числа ${number} равен ${factorial}`);
}

// Шахматная доска 8x8 с чередующимися символами # и пробел
for (let row = 0; row < 8; row++) {
    let line = "";
    for (let col = 0; col < 8; col++) {
        // Если сумма индексов строки и столбца четная, ставим #, иначе пробел
        if ((row + col) % 2 === 0) {
            line += "#";
        } else {
            line += " ";
        }
    }
    console.log(line);
}