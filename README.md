# DeepView Web Vision

The DeepView Web Vision provides a full web application to deliver AI Middleware visualizations remotely through a browser application.  The camera feed and model results are pulled from the website to render the video and draw model overlays onto the screen.

Users can customize the application by adding additional visualizations and controls to the base application.

# Implementation

This webvision-cpp branch of the application implements the web server in C++ using the Crow HTTP library.  Camera frames are captured using VSL and resized to VGA using the VAAL library before encoding as JPEG for publishing to the /camera API endpoint.  The model results are captured using ZeroMQ and published to the /results API endpoint.  Finally the static site is published using the file serving services of Crow.

# Dependencies

- Boost ASIO (or stand-alone ASIO)
- ZeroMQ
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
