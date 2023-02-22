cmake_minimum_required(VERSION 3.20)

project(webvision CXX)

set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} ${CMAKE_CURRENT_SOURCE_DIR}/cmake)

include(Version)
set(PROJECT_VERSION "${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}")

set(CMAKE_CXX_STANDARD 17)

file(WRITE ${CMAKE_CURRENT_BINARY_DIR}/version.h
     "#define VERSION \"${PROJECT_VERSION}${VERSION_EXTRA}\"\n")

find_package(Threads)
find_package(JPEG REQUIRED)
find_package(VideoStream REQUIRED)
find_package(VAAL REQUIRED)
find_package(DeepViewRT REQUIRED)

include_directories(${CMAKE_CURRENT_BINARY_DIR})
include_directories(ext/include)
file(GLOB SRC src/*.cpp)

add_executable(webvision ${SRC})
target_link_libraries(webvision Threads::Threads turbojpeg zmq videostream vaal DeepView::RT)
