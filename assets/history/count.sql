SELECT CAST(COUNT(id) AS INT) AS matchcount
FROM history
WHERE
	'$USER_ID' = ANY (players) AND
	game = ANY (ARRAY['$GAMES']) AND
	($RESULTS);