export async function runQuery(queryPromise, errorMessage) {
  const { data, error } = await queryPromise

  if (error) {
    if (errorMessage) {
      console.error(errorMessage, error)
      throw new Error(errorMessage)
    }
    throw error
  }

  return data
}
