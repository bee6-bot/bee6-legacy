/**
 * @name formatting
 * @type {module}
 * @description Format dates to Discord timestamps and more (soon)
 */

module.exports = {

    /**
     * @name formatDate
     * @type {function}
     * @description Format a date to a Discord timestamp
     * @param {Date} date Date to format
     * @param countdown Whether to format as a countdown
     * @returns {string} Formatted date
     */

    formatDate: (date, countdown = false) => {
        if (countdown) return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
        else return `<t:${Math.floor(date.getTime() / 1000)}>`;
    }
}
