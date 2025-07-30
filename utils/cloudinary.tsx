// Cloudinary upload utility
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

export const uploadToCloudinary = async (
  imageUri: string,
  folder: string = 'water-delivery-docs'
): Promise<CloudinaryUploadResult> => {
  try {
    // Replace with your Cloudinary cloud name and upload preset
    const CLOUDINARY_CLOUD_NAME = 'hackers-heaven';
    const CLOUDINARY_UPLOAD_PRESET = 'vrwxuiof';
    
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'document.jpg',
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
