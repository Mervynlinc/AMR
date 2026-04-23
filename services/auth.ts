import { Role, User } from "../types/index";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function login(
  id: string,
  password: string,
): Promise<{ token: string; role: Role; user: User }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let role: Role;
  if (id === "LAB-001") {
    role = "lab_tech";
  } else if (id === "CLIN-001") {
    role = "clinician";
  } else {
    throw new AuthError("Invalid credentials");
  }

  return {
    token: "mock-jwt-token-" + id + "-" + Date.now(),
    role,
    user: {
      id,
      name: role === "lab_tech" ? "Joan Mugisha" : "Dr. Sarah Okello",
      facility: "MUST Microbiology Lab",
    },
  };
}
