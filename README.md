# DeepView Web Vision

The DeepView Web Vision provides a full web application to deliver AI Middleware visualizations remotely through a browser application.  The camera feed and model results are pulled from the website to render the video and draw model overlays onto the screen.

Users can customize the application by adding additional visualizations and controls to the base application.

# Implementation

This webvision-cpp branch of the application implements the web server in C++ using the [C++ HTTP library](1).  Camera frames are captured using VSL and resized down using the VAAL library before encoding as JPEG for publishing to the /camera API endpoint.  The model results are captured using ZeroMQ and published to the /results API endpoint.  Finally the static site is published using the file serving services of Crow.

The design is meant to be simple to implement and extend though a number of improvements could be made to improve performance and scalability.  Instead of having the client javascript poll the server for camera and detection updates these could be published over a websocket connection, and using an hevc codec would allow higher resolution and framerates to be provided.  These updates are planned in a future update.

# Detection

It is important to note that the javascript expects a particular format for the detection JSON while the web server simply forwards the JSON it receives from the message queue over to the client.  So if the model service is updated for an alternative JSON format it will also need to be updated in the javascript.

# Dependencies

ZeroMQ is used for the message queue, this could easily be changed for an alternative message queue framework.  If changing the message queue framework then the model service which provides detection messages will need to be updated as well.

The VideoStream Library is used to capture camera frames while VAAL is used for optimized image format conversion and resize.

- ZeroMQ
- TurboJPEG
- DeepView VisionPack
  - VAAL
  - VideoStream Library

# Building

```shell
cmake -Bbuild
cmake --build build
```

# Running

Copy webvision along with the assets folder to your target device.  The webvision application will be default look for a camera using VSL at /tmp/camera.vsl and listen for detection events on ipc:///tmp/detect.pub and host the webserver on port 80.  It will look for the assets in the local working directory, otherwise the --assets parameter can be used to point to the desired location.

Use `webvision --help` for usage instructions which allow overriding the VSL and ZeroMQ socket locations, port mapping, and camera streaming options such as resolution.


[1]: https://github.com/yhirose/cpp-httplib	"C++ HTTP Library"
