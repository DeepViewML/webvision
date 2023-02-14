#include <cstdio>
#include <cstdlib>

#include <deepview_rt.h>
#include <turbojpeg.h>
#include <vaal.h>
#include <videostream.h>

// Handlers are not currently thread-safe
#define CPPHTTPLIB_THREAD_POOL_COUNT 1

#include "httplib.h"
#include "zmq.hpp"

int
main(int argc, char** argv)
{
    int         width   = 960;
    int         height  = 540;
    const char* vslpath = "/tmp/camera.vsl";
    const char* subpath = "ipc:///tmp/detect.pub";
    const char* topic   = "DETECTION";

    /*
     * Connects to the VSL socket to capture camera frames.
     */
    auto vsl = vsl_client_init(vslpath, nullptr, true);

    /*
     * Create CPU context which will only be used for load_frame optimized
     * rescale and pixel format conversion operations ahead of JPEG encoding.
     */
    auto vaal = vaal_context_create("cpu");
    if (!vaal) {
        fprintf(stderr, "failed to create vaal context\n");
        return EXIT_FAILURE;
    }

    /*
     * The image tensor is used as the target for the load_frame operation and
     * will then be mapped for reading by the JPEG encoder.
     */
    auto          image         = nn_tensor_init(nullptr, nullptr);
    const int32_t image_shape[] = {height, width, 4};
    auto          err = nn_tensor_alloc(image, NNTensorType_U8, 3, image_shape);
    if (err) {
        fprintf(stderr,
                "failed to allocate image tensor: %s\n",
                nn_strerror(err));
        return EXIT_FAILURE;
    }

    /*
     * The server will receive detection events using a ZeroMQ pub/sub socket
     * where the detection application publishes the results and this overlay
     * application subscribes to the results.
     */
    zmq::context_t ctx;
    zmq::socket_t  sub(ctx, zmq::socket_type::sub);
    sub.set(zmq::sockopt::conflate, 1);
    sub.set(zmq::sockopt::rcvhwm, 1);
    sub.set(zmq::sockopt::subscribe, topic);
    sub.connect(subpath);

    std::string jpeg;
    jpeg.resize(width * height * 2 / 3);

    auto codec = tjInitCompress();
    if (!codec) {
        fprintf(stderr,
                "failed to initialize jpeg codec: %s\n",
                tjGetErrorStr2(NULL));
        return EXIT_FAILURE;
    }

    httplib::Server svr;

    /*
     * The results route will capture the next detection message and return it.
     */
    svr.Get("/results",
            [&sub, topic](const httplib::Request&, httplib::Response& res) {
                zmq::message_t msg;
                auto           ret = sub.recv(msg);
                if (!ret) {
                    // Received empty message or error.
                    res.status = 204;
                    return;
                }

                size_t      topic_len = strlen(topic);
                const char* data      = (const char*) msg.data();
                size_t      size      = msg.size();

                if (size < topic_len) {
                    // Should never happen, topic length greater than message.
                    res.status = 204;
                    return;
                }

                data += topic_len;
                size -= topic_len;

                res.set_content(std::string(data, size), "application/json");
            });

    /*
     * The camera route will capture the next VSL frame then return it as JPEG
     */
    svr.Get("/camera",
            [vsl,
             vaal,
             image,
             width,
             height,
             codec,
             &jpeg](const httplib::Request&, httplib::Response& res) {
                auto frame = vsl_frame_wait(vsl, 0);
                if (!frame) {
                    // Timeout waiting for frame
                    res.status = 504;
                    return;
                }

                vaal_load_frame_dmabuf(vaal,
                                       image,
                                       vsl_frame_handle(frame),
                                       vsl_frame_fourcc(frame),
                                       vsl_frame_width(frame),
                                       vsl_frame_height(frame),
                                       nullptr,
                                       0);
                vsl_frame_release(frame);

                auto pix = static_cast<const uint8_t*>(nn_tensor_mapro(image));
                if (!pix) {
                    // Tensor has no memory, should never happen.
                    res.status = 507;
                    return;
                }

                auto jpeg_data = jpeg.data();
                auto jpeg_size = jpeg.size();

                if (tjCompress2(codec,
                                pix,
                                width,
                                0,
                                height,
                                TJPF_RGBX,
                                (uint8_t**) &jpeg_data,
                                &jpeg_size,
                                TJSAMP_420,
                                90,
                                TJFLAG_NOREALLOC)) {
                    auto        error = tjGetErrorStr2(codec);
                    std::string error_string(error);
                    tjFree((uint8_t*) error);
                    res.status = 500;
                    res.set_content(error_string, "text/plain");
                }

                nn_tensor_unmap(image);
                res.set_content(jpeg, "image/jpeg");
            });

    svr.set_mount_point("/", "assets");
    svr.listen("0.0.0.0", 8080);

    return EXIT_SUCCESS;
}