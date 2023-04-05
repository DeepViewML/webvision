CXX ?= g++
CXXFLAGS ?= -std=c++17 -O3 -Wall
APP ?= webvision
VERSION ?= -DVERSION=\""$(shell git describe || cat VERSION)\""

INC := -Iext/include
LIB := -lpthread -lturbojpeg -lzmq -lvideostream -lvaal -ldeepview-rt

all: $(APP)

$(APP): src/main.cpp
	$(CXX) $(CXXFLAGS) $(INC) $(VERSION) -o $(APP) src/main.cpp $(LIB)

clean:
	$(RM) $(APP)
