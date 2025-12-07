import { ConfigService } from '@nestjs/config';
import { v2 as Cloudinary } from 'cloudinary';
export declare const CLOUDINARY = "Cloudinary";
export declare const CloudinaryProvider: {
    provide: string;
    useFactory: (config: ConfigService) => typeof Cloudinary;
    inject: (typeof ConfigService)[];
};
