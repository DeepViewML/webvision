cmake_minimum_required(VERSION 3.20)

project(webvision CXX)

set(CMAKE_CXX_STANDARD 14)

find_package(Threads)
find_package(JPEG REQUIRED)
find_package(VideoStream REQUIRED)
find_package(VAAL REQUIRED)
find_package(DeepViewRT REQUIRED)

include_directories(ext/include)
file(GLOB SRC src/*.cpp)

add_executable(webvision ${SRC})
target_link_libraries(webvision Threads::Threads turbojpeg zmq videostream vaal DeepView::RT)
