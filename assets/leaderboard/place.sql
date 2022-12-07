SELECT
 CAST(COUNT(id) + 1 AS int) AS place
FROM
 profiles
WHERE
  0 < ANY (SELECT $wins + $loss FROM profiles WHERE id = '$user')
  --returns nothing if user has not played a game and won or lost
 AND
  id != '$user'
  --calls a different user
 AND
  $wins + $loss > 0
  --different user has, in fact, played a game
 AND (
   $elos > ANY (SELECT $elos FROM profiles WHERE id = '$user')
   --user's elo is lower than different user's
  OR (
    $elos = ANY (SELECT $elos FROM profiles WHERE id = '$user')
	--user's elo is the same as different user's
   AND
    (($wins + 1.9208) / ($wins + $loss) -1.96 * SQRT((trunc(($wins) * ($loss), 1) / ($wins + $loss)) + 0.9604) / ($wins + $loss)) / (1 + 3.8416 / ($wins + $loss)) > ANY (SELECT (($wins + 1.9208) / ($wins + $loss) -1.96 * SQRT((trunc(($wins) * ($loss), 1) / ($wins + $loss)) + 0.9604) / ($wins + $loss)) / (1 + 3.8416 / ($wins + $loss)) FROM profiles WHERE id = '$user'))
	--user's CI lower bound score is lower than different user's
 );