export type AdminUser = {
  id: number
  name: string
  email: string
  company: {
    name: string
  }
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await fetch("https://jsonplaceholder.typicode.com/users")

  if (!response.ok) {
    throw new Error("Failed to fetch admin users")
  }

  const data = (await response.json()) as AdminUser[]
  return data.slice(0, 5)
}


