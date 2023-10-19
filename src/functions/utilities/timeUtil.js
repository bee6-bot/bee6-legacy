/**
 * @name convertToMilliseconds
 * @desc Converts a string with various time units and their values into milliseconds.
 * @param {string} input - The input string containing time values and units.
 * @returns {number} The total number of milliseconds equivalent to the input.
 *
 * @example
 *     const input = "50ms / 5s / 1min / 2hr / 1day / 2yr";
 *     const milliseconds = convertToMilliseconds(input);
 *     // Output: 62914800000
 */
function convertToMilliseconds(input) {

    const units = {
        'ms': 1,
        's': 1000,
        'second': 1000,
        'sec': 1000,
        'm': 60000,
        'minute': 60000,
        'min': 60000,
        'h': 3600000,
        'hour': 3600000,
        'hr': 3600000,
        'd': 86400000,
        'day': 86400000,
        'yr': 31536000000,
        'year': 31536000000
    };

    const regex = /([\d.]+)([a-z]+)/ig;
    let totalMilliseconds = 0;

    let match;
    while ((match = regex.exec(input)) !== null) {
        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        if (units[unit]) totalMilliseconds += value * units[unit];
    }

    return totalMilliseconds;
}

/**
 * @name millisecondsToTime
 * @desc Converts milliseconds into a human-readable time format.
 * @param {number} milliseconds - The number of milliseconds to convert.
 * @returns {string} A string representing the time in a human-readable format.
 */
function millisecondsToTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const years = Math.floor(days / 365);

    if (years > 0) return years + (years === 1 ? " year" : " years");
    else if (days > 0) return days + (days === 1 ? " day" : " days");
    else if (hours > 0) return hours + (hours === 1 ? " hour" : " hours");
    else if (minutes > 0) return minutes + (minutes === 1 ? " minute" : " minutes");
    else return seconds + (seconds === 1 ? " second" : " seconds");
}

module.exports = { convertToMilliseconds, millisecondsToTime };