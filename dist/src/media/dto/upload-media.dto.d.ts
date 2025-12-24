export declare enum MediaType {
    IMAGE = "image",
    VIDEO = "video",
    DOCUMENT = "document",
    AUDIO = "audio"
}
export declare class UploadMediaDto {
    fileName?: string;
    type?: MediaType;
    folder?: string;
}
