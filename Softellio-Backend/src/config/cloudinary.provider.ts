import { ConfigService } from '@nestjs/config';
import { v2 as Cloudinary } from 'cloudinary';

export const CLOUDINARY = 'Cloudinary';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (config: ConfigService) => {
    Cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
    });
    console.log('☁️  Cloudinary configured successfully');
    return Cloudinary;
  },
  inject: [ConfigService],
};