SELECT
    id,
    elo1 AS elo,
    win1 AS win,
    los1 AS los,
    ((win1 + 1.9208) / (win1 + los1) - 1.96 * SQRT((trunc(win1 * los1, 1) / (win1 + los1)) + 0.9604) / (win1 + los1)) / (1 + 3.8416 / (win1 + los1)) AS ci_lower_bound
FROM test
WHERE win1 + los1 > 0
ORDER BY
    elo DESC,
    ci_lower_bound DESC,
    id ASC
LIMIT 10;

SELECT
    id,
    elo1 AS elo,
    win1 AS win1,
    los1 AS los1,
    ((win1 + 1.9208) / (win1 + los1) - 1.96 * SQRT((trunc(win1 * los1, 1) / (win1 + los1)) + 0.9604) / (win1 + los1)) / (1 + 3.8416 / (win1 + los1)) AS ci_lower_bound
FROM test
WHERE
    id = 'user1'
    AND
    win1 + los1 > 0;

SELECT CAST(COUNT(id) + 1 AS int) AS place
FROM test
WHERE
    0 < ANY (SELECT win1 + los1 FROM test WHERE id = 'user1')
    AND
    id != 'user1'
    AND
    win1 + los1 > 0
    AND
    elo1 >= ANY (SELECT elo1 FROM test WHERE id = 'user1')
    AND
    ((win1 + 1.9208) / (win1 + los1) - 1.96 * SQRT((trunc(win1 * los1, 1) / (win1 + los1)) + 0.9604) / (win1 + los1)) / (1 + 3.8416 / (win1 + los1)) > ANY (SELECT ((win1 + 1.9208) / (win1 + los1) - 1.96 * SQRT((trunc(win1 * los1, 1) / (win1 + los1)) + 0.9604) / (win1 + los1)) / (1 + 3.8416 / (win1 + los1)) FROM test WHERE id = 'user1');