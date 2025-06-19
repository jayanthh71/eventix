export async function uploadProfileImage(
  file: File,
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload/profile-image", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to upload image",
      };
    }

    return {
      success: true,
      imageUrl: data.imageUrl,
    };
  } catch (error) {
    console.error("Image upload error:", error);
    return {
      success: false,
      error: "Network error occurred while uploading image",
    };
  }
}
