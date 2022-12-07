SELECT CAST(COUNT(id) AS INT) AS matchcount
FROM matches
WHERE
	'$USER_ID' = ANY (players) AND
	game = ANY (ARRAY['$GAMES']) AND
	($RESULTS);