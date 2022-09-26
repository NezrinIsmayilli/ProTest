/** Helper function for removing async/await try/catch litter ref:https://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/ */
/**
 * @description Take promise and returns [err, data]
 * @param {Promise} promise promise to resolve/reject
 */
export async function to(promise) {
  try {
    const data = await promise;
    if (data instanceof Error) return [data];
    return [null, data];
  } catch (error) {
    return [error];
  }
}
