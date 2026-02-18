import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import toStream = require('streamifier');
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    async uploadImage(
        file: Express.Multer.File,
    ): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { folder: 'toyshare_items' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );
            toStream.createReadStream(file.buffer).pipe(upload);
        });
    }
}
