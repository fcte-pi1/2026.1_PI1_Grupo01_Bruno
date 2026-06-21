#include "Floodfill.h"
#include "../config.h"

struct Cell { uint8_t x, y; };
static Cell _queue[TOTAL_CELLS];
static int  _head = 0, _tail = 0;

static void enqueue(uint8_t x, uint8_t y) {
    _queue[_tail] = {x, y};
    _tail = (_tail + 1) % TOTAL_CELLS;
}
static Cell dequeue() {
    Cell c = _queue[_head];
    _head = (_head + 1) % TOTAL_CELLS;
    return c;
}
static bool queueEmpty() { return _head == _tail; }

static void setWallAbsoluta(int x, int y, int dir) {
    auto& maze = robot.maze;
    if (dir == DIR_NORTH) {
        maze[x][y] |= WALL_NORTH;
        if (y < MAZE_SIZE - 1) maze[x][y+1] |= WALL_SOUTH;
    } else if (dir == DIR_EAST) {
        maze[x][y] |= WALL_EAST;
        if (x < MAZE_SIZE - 1) maze[x+1][y] |= WALL_WEST;
    } else if (dir == DIR_SOUTH) {
        maze[x][y] |= WALL_SOUTH;
        if (y > 0) maze[x][y-1] |= WALL_NORTH;
    } else if (dir == DIR_WEST) {
        maze[x][y] |= WALL_WEST;
        if (x > 0) maze[x-1][y] |= WALL_EAST;
    }
}

static void recalcularDistancias() {
    auto& dist = robot.distances;
    auto& maze = robot.maze;

    for (int i = 0; i < MAZE_SIZE; i++)
        for (int j = 0; j < MAZE_SIZE; j++)
            dist[i][j] = 255;

    _head = _tail = 0;

    uint8_t c1 = (MAZE_SIZE / 2) - 1;
    uint8_t c2 = (MAZE_SIZE / 2);
    dist[c1][c1] = 0; enqueue(c1, c1);
    dist[c1][c2] = 0; enqueue(c1, c2);
    dist[c2][c1] = 0; enqueue(c2, c1);
    dist[c2][c2] = 0; enqueue(c2, c2);

    while (!queueEmpty()) {
        Cell c = dequeue();
        uint8_t cx = c.x, cy = c.y, d = dist[cx][cy];

        if (cy < MAZE_SIZE-1 && !(maze[cx][cy] & WALL_NORTH) && dist[cx][cy+1]==255)
            { dist[cx][cy+1] = d+1; enqueue(cx, cy+1); }
        if (cy > 0           && !(maze[cx][cy] & WALL_SOUTH) && dist[cx][cy-1]==255)
            { dist[cx][cy-1] = d+1; enqueue(cx, cy-1); }
        if (cx < MAZE_SIZE-1 && !(maze[cx][cy] & WALL_EAST)  && dist[cx+1][cy]==255)
            { dist[cx+1][cy] = d+1; enqueue(cx+1, cy); }
        if (cx > 0           && !(maze[cx][cy] & WALL_WEST)  && dist[cx-1][cy]==255)
            { dist[cx-1][cy] = d+1; enqueue(cx-1, cy); }
    }
}


static void decidirEMover() {
    auto& dist = robot.distances;
    auto& maze = robot.maze;
    int x = robot.posX, y = robot.posY;

    uint8_t minDist = 255;
    int bestDir = robot.heading;

    if (y < MAZE_SIZE-1 && !(maze[x][y] & WALL_NORTH) && dist[x][y+1] < minDist)
        { minDist = dist[x][y+1]; bestDir = DIR_NORTH; }
    if (x < MAZE_SIZE-1 && !(maze[x][y] & WALL_EAST)  && dist[x+1][y] < minDist)
        { minDist = dist[x+1][y]; bestDir = DIR_EAST;  }
    if (y > 0           && !(maze[x][y] & WALL_SOUTH) && dist[x][y-1] < minDist)
        { minDist = dist[x][y-1]; bestDir = DIR_SOUTH; }
    if (x > 0           && !(maze[x][y] & WALL_WEST)  && dist[x-1][y] < minDist)
        { minDist = dist[x-1][y]; bestDir = DIR_WEST;  }

    robot.heading = bestDir;

    if      (robot.heading == DIR_NORTH) robot.posY++;
    else if (robot.heading == DIR_EAST)  robot.posX++;
    else if (robot.heading == DIR_SOUTH) robot.posY--;
    else if (robot.heading == DIR_WEST)  robot.posX--;
}

void Floodfill::init() {
    memset(robot.maze,      0,   sizeof(robot.maze));
    memset(robot.distances, 255, sizeof(robot.distances));
    robot.posX           = 0;
    robot.posY           = 0;
    robot.heading        = DIR_NORTH;
    robot.chegouAoCentro = false;
    recalcularDistancias();
}

// 1 ciclo completo: lê paredes → atualiza mapa → recalcula → decide
// Lê robot.wallFront/Right/Left (preenchidos pelo IRSensors antes desta chamada)
void Floodfill::step() {
    int dirFront = robot.heading;
    int dirRight = (robot.heading + 1) % 4;
    int dirLeft  = (robot.heading + 3) % 4;

    if (robot.wallFront) setWallAbsoluta(robot.posX, robot.posY, dirFront);
    if (robot.wallRight) setWallAbsoluta(robot.posX, robot.posY, dirRight);
    if (robot.wallLeft)  setWallAbsoluta(robot.posX, robot.posY, dirLeft);

    recalcularDistancias();
    decidirEMover();
}

bool Floodfill::finished() {
    return robot.distances[robot.posX][robot.posY] == 0;
}
