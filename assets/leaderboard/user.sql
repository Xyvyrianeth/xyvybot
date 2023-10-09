SELECT
 id,
 $elos AS elo,
 $wins AS win,
 $loss AS los,
 (($wins + 1.9208) / ($wins + $loss) -1.96 * SQRT((($wins * $loss) / ($wins + $loss)) + 0.9604) / ($wins + $loss)) / (1 + 3.8416 / ($wins + $loss)) AS ci_lower_bound
FROM
 profiles
WHERE
 id = '$user'
 AND $wins + $loss > 0;