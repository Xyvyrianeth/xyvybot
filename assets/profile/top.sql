SELECT
	id,
	elos AS elo,
	wins AS win,
	loss AS los,
	(
		(wins + 1.9208) / (wins + loss) -1.96 * SQRT(
			(
				trunc(
					(wins) * (loss),
					1
				) / (wins + loss)
			) + 0.9604
		) / (wins + loss)
	) / (
		1 + 3.8416 / (wins + loss)
	) AS ci_lower_bound
FROM
	profiles
WHERE
	wins + loss > 0
ORDER BY
	elo DESC,
	ci_lower_bound DESC,
	id ASC
LIMIT
	10;


SELECT
	id,
	elos AS elo,
	wins AS win,
	loss AS los,
	(
		(wins + 1.9208) / (wins + loss) -1.96 * SQRT(
			(
				trunc(
					(wins) * (loss),
					1
				) / (wins + loss)
			) + 0.9604
		) / (wins + loss)
	) / (
		1 + 3.8416 / (wins + loss)
	) AS ci_lower_bound
FROM
	profiles
WHERE
	id = id_user
	AND wins + loss > 0;


SELECT
	CAST(
		COUNT(id) + 1 AS int
	) AS place
FROM
	profiles
WHERE
	0 < ANY (
		SELECT
			wins + loss
		FROM
			profiles
		WHERE
			id = id_user
	)
	AND id != id_user
	AND wins + loss > 0
	AND (
		elos > ANY (
			SELECT
				elos
			FROM
				profiles
			WHERE
				id = id_user
		)
		OR (
			elos = ANY (
				SELECT
					elos
				FROM
					profiles
				WHERE
					id = id_user
			)
			AND (
				(wins + 1.9208) / (wins + loss) -1.96 * SQRT(
					(
						trunc(
							(wins) * (loss),
							1
						) / (wins + loss)
					) + 0.9604
				) / (wins + loss)
			) / (
				1 + 3.8416 / (wins + loss)
			) > ANY (
				SELECT
					(
						(wins + 1.9208) / (wins + loss) -1.96 * SQRT(
							(
								trunc(
									(wins) * (loss),
									1
								) / (wins + loss)
							) + 0.9604
						) / (wins + loss)
					) / (
						1 + 3.8416 / (wins + loss)
					)
				FROM
					profiles
				WHERE
					id = id_user
			)
		)
	);
