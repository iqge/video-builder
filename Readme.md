# Video Builder
Video Builder is a simple web application that allows users to select multiple videos and audio files, combine them, and add metadata for SEO purposes. The application processes the selected files and generates output videos with the specified metadata.

## Features

- Upload multiple videos and audio files.
- Combine each video with each audio file.
- Add metadata (title, description, author, keywords) for SEO.
- Automatically trim audio to match the length of the video.
- Processed files are saved with the specified metadata.

## Technologies Used

- Node.js
- Express
- Multer
- Fluent-FFmpeg
- HTML
- JavaScript

## Prerequisites

- Node.js and npm installed.
- FFmpeg installed.


## Example

### Input

- Videos: `video1.mp4`, `video2.mp4`
- Songs: `song1.mp3`, `song2.mp3`, `song3.mp3`

### Metadata

- Title: "My Video"
- Description: "This is a sample video."
- Author: "John Doe"
- Keywords: "sample, video, test"

### Output

- `video1-song1.mp4`
- `video1-song2.mp4`
- `video1-song3.mp4`
- `video2-song1.mp4`
- `video2-song2.mp4`
- `video2-song3.mp4`

Each output video will have the specified metadata.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Acknowledgements

- [Express](https://expressjs.com/)
- [Multer](https://github.com/expressjs/multer)
- [Fluent-FFmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- [FFmpeg](https://ffmpeg.org/)
