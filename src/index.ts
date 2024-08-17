import express, { Request, Response } from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

interface Metadata {
  title: string;
  description: string;
  author: string;
  keywords: string;
}

// Extend the Request interface to include files property
interface MulterRequest extends Request {
  files:
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | undefined;
}

app.post(
  '/upload',
  upload.fields([{ name: 'videos' }, { name: 'songs' }]),
  async (req: Request, res: Response) => {
    const multerReq = req as MulterRequest;

    if (
      !multerReq.files ||
      !multerReq.files['videos'] ||
      !multerReq.files['songs']
    ) {
      return res.status(400).send('No files uploaded.');
    }

    const videos = multerReq.files['videos'];
    const songs = multerReq.files['songs'];
    const { title, description, author, keywords } = req.body as Metadata;

    try {
      for (let video of videos) {
        for (let song of songs) {
          const videoPath = path.join(
            __dirname.replace('/dist', ''),
            video.path
          );
          const songPath = path.join(__dirname.replace('/dist', ''), song.path);
          const outputPath = generateOutputFileName(
            title,
            song.originalname,
            path.join(__dirname, '../outputs')
          );

          await processVideoSong(videoPath, songPath, outputPath, {
            title,
            description,
            author,
            keywords,
          });
        }
      }
      res.send('Files processed successfully!');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error processing files.');
    } finally {
      // Cleanup uploaded files
      [...videos, ...songs].forEach((file) => fs.unlinkSync(file.path));
    }
  }
);

function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(`Error getting video duration for ${videoPath}: ${err.message}`);
      } else {
        const duration = metadata.format.duration || 5;
        resolve(duration);
      }
    });
  });
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function generateOutputFileName(
  title: string,
  song: string,
  outputDir: string
): string {
  const trimmedTitle = sanitizeFileName(title).substring(0, 20);
  const trimmedSong = sanitizeFileName(song).substring(0, 20);
  const fileName = `${trimmedTitle}_${trimmedSong}.mp4`;
  return path.join(outputDir, fileName);
}

function processVideoSong(
  videoPath: string,
  songPath: string,
  outputPath: string,
  metadata: Metadata
): Promise<unknown> {
  return getVideoDuration(videoPath)
    .then((videoDuration) => {
      const randomStartTime = Math.random() * Math.min(10, videoDuration);
      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .input(songPath)
          .inputOptions([`-ss ${randomStartTime}`]) // Start the audio at randomStartTime
          .outputOptions('-shortest')
          .outputOptions(
            '-map',
            '0:v', // Map the video stream from the first input (videoPath)
            '-map',
            '1:a', // Map the audio stream from the second input (songPath)
            '-c:v',
            'copy', // Copy the video codec
            '-c:a',
            'aac', // Encode the audio to AAC format
            '-metadata',
            `title=${metadata.title}`,
            '-metadata',
            `description=${metadata.description}`,
            '-metadata',
            `author=${metadata.author}`,
            '-metadata',
            `keywords=${metadata.keywords}`
          )
          .output(outputPath)
          .on('end', () => resolve({}))
          .on('error', (err) => {
            reject(
              new Error(
                `ffmpeg error for video: ${videoPath}, song: ${songPath}, error: ${err.message}`
              )
            );
          })
          .run();
      });
    })
    .catch((err) => {
      throw new Error(
        `Failed to process video: ${videoPath}, song: ${songPath}, error: ${err.message}`
      );
    });
}

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
