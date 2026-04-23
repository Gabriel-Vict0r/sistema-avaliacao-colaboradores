UPDATE [dbo].[employees]
SET
  [avaliador01] = LOWER([avaliador01]),
  [avaliador02] = LOWER([avaliador02]),
  [avaliador03] = LOWER([avaliador03]),
  [avaliador04] = LOWER([avaliador04]),
  [avaliador05] = LOWER([avaliador05]),
  [avaliador06] = LOWER([avaliador06]),
  [avaliador07] = LOWER([avaliador07]),
  [avaliador08] = LOWER([avaliador08])
WHERE
  [avaliador01] IS NOT NULL
  OR [avaliador02] IS NOT NULL
  OR [avaliador03] IS NOT NULL
  OR [avaliador04] IS NOT NULL
  OR [avaliador05] IS NOT NULL
  OR [avaliador06] IS NOT NULL
  OR [avaliador07] IS NOT NULL
  OR [avaliador08] IS NOT NULL;
