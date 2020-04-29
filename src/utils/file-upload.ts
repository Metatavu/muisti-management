/**
 * Interface describing an uploaded file
 */
export interface OutputFile {
  uri: string;
  meta: {
    contentType: string;
    fileName: string;
  }
}

/**
 * Utility class for uploading files
 */
export default class FileUpload {

  /**
   * Uploads a file into the server
   * 
   * @param file file as file or blob object
   * @param folder folder
   * @returns promise of created file
   */
  public static async uploadFile(file: File | Blob, folder: string): Promise<OutputFile> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    
    const response = await fetch(FileUpload.getUploadUrl().toString(), {
      method: "POST",
      body: formData
    });

    return await response.json();
  }

  /**
   * Returns upload URL
   * 
   * @returns upload URL
   */
  private static getUploadUrl = () => {
    const apiUrl = new URL(process.env.REACT_APP_API_BASE_PATH || "");
    apiUrl.pathname = "/files";
    return apiUrl;
  }

}