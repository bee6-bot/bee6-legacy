/**
 * @name draw
 * @description For drawing things, like progress bars!
 */

/**
 * @name drawProgressBar
 * @description Draw a progress bar
 * @param {number} percent Percent of the progress bar to fill
 * @param {number} length Length of the progress bar
 * @param {string} [fillChar] Character to fill the progress bar with
 * @param {string} [emptyChar] Character to fill the empty space with
 * @returns {string} The progress bar
 * @throws {Error} If the percent is not between 0 and 100
 * @throws {Error} If the length is not positive
 */

function drawProgressBar(percent, length, fillChar = `🟦`, emptyChar = `⬛`) {

    if (percent < 0 || percent > 100) throw new Error(`Percent must be between 0 and 100.`);
    if (length <= 0) throw new Error(`Length must be positive.`);

    // Calculate the number of characters to fill and return the progress bar
    const fillLength = Math.ceil((percent / 100) * length);
    return `${fillChar.repeat(fillLength)}${emptyChar.repeat(length - fillLength)}`;

}

module.exports = { drawProgressBar };