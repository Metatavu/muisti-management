/**
 * Parse string to given json object type
 *
 * @param data data to be parsed
 * @returns parsed data or undefined
 */
export function parseStringToJsonObject<T, R>(data: string): R | undefined {
  if (data.length < 1) {
    return;
  }

  try {
    const parsed: R = JSON.parse(data);
    return parsed;
  } catch (error) {
    console.log(error);
  }
}
