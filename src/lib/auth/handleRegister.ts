import { Role } from "@prisma/client";

export default async function handleRegister(
  name: string,
  email: string,
  password: string,
  role: Role,
) {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
      };
    }

    return {
      success: true,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
    };
  }
}
