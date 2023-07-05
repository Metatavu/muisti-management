import { Config } from "../constants/configuration";

/**
 * Interface describing an uploaded file
 */
export interface OutputFile {
  uri: string;
  meta: {
    contentType: string;
    fileName: string;
  };
}

/**
 * Interface describing a presigned post response
 */
export interface PresignedPostResponse {
  error: boolean;
  data: PresignedPostData;
  message: string | null;
}

/**
 * Interface describing a presigned post data
 */
export interface PresignedPostData {
  url: string;
  fields: any;
}

/**
 * Utility class for uploading files
 */
export default class FileUpload {
  /**
   * Retrieve pre-signed POST data from a dedicated API endpoint.
   *
   * @param folder folder
   * @param file file
   * @returns presigned post response
   */
  public static getPresignedPostData = (
    folder: string,
    file: File
  ): Promise<PresignedPostResponse> => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      const url = Config.getConfig().userContentUploadUrl;

      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(
        JSON.stringify({
          path: `${folder}/${file.name}`,
          type: file.type
        })
      );
      xhr.onload = function () {
        resolve(JSON.parse(this.responseText));
      };
    });
  };

  /**
   * Upload file to S3 with previously received pre-signed POST data.
   *
   * @param presignedPostData
   * @param file
   */
  public static uploadFileToS3 = (presignedPostData: PresignedPostData, file: File) => {
    return new Promise<void>((resolve, reject) => {
      const formData = new FormData();
      Object.keys(presignedPostData.fields).forEach((key) => {
        formData.append(key, presignedPostData.fields[key]);
      });

      formData.append("file", file);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", presignedPostData.url, true);
      xhr.send(formData);
      xhr.onload = function () {
        this.status === 204 ? resolve() : reject(this.responseText);
      };
    });
  };

  /**
   * Uploads a file into the server
   *
   * @param file file as file or blob object
   * @param folder folder
   * @returns promise of created file
   */
  public static async uploadFile(file: File | Blob, folder: string): Promise<OutputFile> {
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
    const apiUrl = new URL(Config.getConfig().apiBasePath);
    apiUrl.pathname = "/files";
    return apiUrl;
  };
}
