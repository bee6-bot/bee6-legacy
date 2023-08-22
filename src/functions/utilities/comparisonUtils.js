/**
 * @name levenshteinDistance
 * @description Calculate the Levenshtein distance between two strings
 * @param str1
 * @param str2
 * @returns {any}
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