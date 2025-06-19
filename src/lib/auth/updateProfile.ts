export default async function updateProfile(
  email?: string,
  name?: string,
  password?: string,
  currentPassword?: string,
) {
  if (email || name || password) {
    try {
      const updateData: {
        email?: string;
        name?: string;
        password?: string;
        currentPassword?: string;
      } = {};

      if (email) updateData.email = email;
      if (name) updateData.name = name;
      if (password) {
        updateData.password = password;
        updateData.currentPassword = currentPassword;
      }

      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error: data.error || "Failed to update profile",
        };
      }

      return {
        success: true,
        status: response.status,
        data,
      };
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        status: 500,
        error: "Network error occurred while updating profile",
      };
    }
  }

  return {
    success: false,
    status: 400,
    error: "No fields provided to update",
  };
}
