export interface RatingItem {
  rating: number;
  weight: number;
}

export const calculateWeightedAverage = (ratings: RatingItem[]): number => {
  if (ratings.length === 0) return 0;

  const totalWeightedScore = ratings.reduce(
    (sum, item) => sum + item.rating * item.weight,
    0
  );
  const totalWeight = ratings.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight === 0) return 0;

  return parseFloat((totalWeightedScore / totalWeight).toFixed(2));
};

export const getClassification = (average: number): string => {
  if (average <= 5.0) return 'RUIM';
  if (average < 8.0) return 'REGULAR';
  if (average < 9.0) return 'BOM';
  return 'EXCELENTE';
};
