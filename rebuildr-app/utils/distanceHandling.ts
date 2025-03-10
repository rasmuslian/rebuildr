/**
 * Takes a distance in meters and converts it into a string representing the distance in km and rounded to closest 100 meters.
 * If distance is less than 100, the function will return '< 100 km'
 * @param distance in meters
 * @returns string representing distance converted to km. Rounded to closes 100 meters
 */
export const formatMetersToKm = (distance: number) => {
  if (distance < 100) {
    return "< 0,1";
  }

  //Rounds to closest 100 meters. e.g 1991m => 2000 => 20 (*100 meters)
  const oneDecimal = Math.round(distance / 100);
  //dividing by 10 converts the number from meters to km. Floor it to remove fractionals. 21 => 2
  const integerPart = Math.floor(oneDecimal / 10);
  //right most number will represent 100 meters. its the first decimal in the km number.
  const fractionalPart = oneDecimal % 10;
  return `${integerPart},${fractionalPart}`;
};
