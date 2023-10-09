SELECT
  CAST(COUNT(id) + 1 AS int) AS place
FROM
  profiles
WHERE
  ( --user1 has won or lost at least once
    0 < ANY (SELECT $wins + $loss FROM profiles WHERE id = '$user')
  )
  AND
  ( --user2's ID != user1's ID
    id != '$user'
  )
  AND
  ( --user2 has won or lost at least once
    $wins + $loss > 0
  )
  AND
  (
    ( --user2's elo > user1's
      $elos > ANY (SELECT $elos FROM profiles WHERE id = '$user')
    )
    OR
    (
      ( --user2's elo = user1's
        $elos = ANY (SELECT $elos FROM profiles WHERE id = '$user')
	    )
      AND
      ( --user2's CI score > user1's
        ((($wins + 1.9208) / ($wins + $loss)) - (1.96 * (SQRT((($wins * $loss) / ($wins + $loss)) + 0.9604) / ($wins + $loss)))) / (1 + (3.8416 / ($wins + $loss))) > ANY (SELECT ((($wins + 1.9208) / ($wins + $loss)) - (1.96 * (SQRT((($wins * $loss) / ($wins + $loss)) + 0.9604) / ($wins + $loss)))) / (1 + (3.8416 / ($wins + $loss))) FROM profiles WHERE id = '$user')
      )
    )
  );