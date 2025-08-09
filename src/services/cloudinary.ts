import axios from 'axios';

type CloudinaryUploadResponse = {
  secure_url: string;
};

function getCloudNameFromUrl(url?: string): string | null {
  if (!url) return null;
  // cloudinary://<api_key>:<api_secret>@<cloud_name>
  const match = url.match(/^cloudinary:\/\/[^:]+:[^@]*@([^/?#]+)/);
  return match ? match[1] : null;
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudNameEnv = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const cloudinaryUrl =
    process.env.REACT_APP_CLOUDINARY_URL || process.env.CLOUDINARY_URL;
  const cloudName = cloudNameEnv || getCloudNameFromUrl(cloudinaryUrl);
  if (!cloudName) throw new Error('Invalid CLOUDINARY_URL');

  const unsignedPreset = process.env.REACT_APP_CLOUDINARY_UNSIGNED_PRESET;
  if (!unsignedPreset) {
    throw new Error('Missing REACT_APP_CLOUDINARY_UNSIGNED_PRESET');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', String(unsignedPreset));

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const { data } = await axios.post<CloudinaryUploadResponse>(endpoint, form, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
  return data.secure_url;
}


