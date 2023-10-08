/**
 * @fileoverview Calculates the Levenshtein distance between two strings.
 *
 * @function levenshteinDistance
 * @description This function calculates the Levenshtein distance between two strings,
 *              which is the minimum number of single-character edits required to change one word into the other.
 *
 * @param {string} str1 - The first string.
 * @param {string} str2 - The second string.
 * @returns {number} - The Levenshtein distance between the two input strings.
 */
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;

    const dp = new Array(m + 1).fill(null).map(() => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) {
        for (let j = 0; j <= n; j++) {
            if (i === 0) {
                dp[i][j] = j;
            } else if (j === 0) {
                dp[i][j] = i;
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j - 1] + (str1[i - 1] !== str2[j - 1] ? 1 : 0),
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1
                );
            }
        }
    }

    return dp[m][n];
}


module.exports = {levenshteinDistance}