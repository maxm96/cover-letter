/**
 * "Randomly" shuffle an array. https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
 * @param {Array} arr
 * @return {Array}
 */
module.exports = function (arr) {
    let j, temp

    for (let i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1))
        temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp
    }

    return arr
}