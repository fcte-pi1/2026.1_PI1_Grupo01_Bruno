#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include "API.h"

// --- PARÂMETROS DO LABIRINTO ---
#define SIZE 16
#define TOTAL_CELLS (SIZE * SIZE)

#define DIR_NORTH 0
#define DIR_EAST  1
#define DIR_SOUTH 2
#define DIR_WEST  3

#define WALL_NORTH 0x01
#define WALL_EAST  0x02
#define WALL_SOUTH 0x04
#define WALL_WEST  0x08

uint8_t maze[SIZE][SIZE] = {0}; 
uint8_t distances[SIZE][SIZE]; 

int current_x = 0;
int current_y = 0;
int current_dir = DIR_NORTH; 

// --- FILA PARA O FLOOD FILL ---
typedef struct { uint8_t x, y; } Cell;
Cell queue[TOTAL_CELLS];
int head = 0, tail = 0;

void enqueue(uint8_t x, uint8_t y) {
    queue[tail].x = x; queue[tail].y = y;
    tail = (tail + 1) % TOTAL_CELLS; 
}

Cell dequeue() {
    Cell c = queue[head];
    head = (head + 1) % TOTAL_CELLS;
    return c;
}

bool isQueueEmpty() { return head == tail; }

void setWallAbsoluta(int x, int y, int dir) {
    if (dir == DIR_NORTH) {
        maze[x][y] |= WALL_NORTH;
        if (y < SIZE - 1) maze[x][y + 1] |= WALL_SOUTH; // Vizinho ganha parede no Sul
    } else if (dir == DIR_EAST) {
        maze[x][y] |= WALL_EAST;
        if (x < SIZE - 1) maze[x + 1][y] |= WALL_WEST;  // Vizinho ganha parede no Oeste
    } else if (dir == DIR_SOUTH) {
        maze[x][y] |= WALL_SOUTH;
        if (y > 0) maze[x][y - 1] |= WALL_NORTH;        // Vizinho ganha parede no Norte
    } else if (dir == DIR_WEST) {
        maze[x][y] |= WALL_WEST;
        if (x > 0) maze[x - 1][y] |= WALL_EAST;         // Vizinho ganha parede no Leste
    }
}

// --- ALGORITMO FLOOD FILL ---
void floodFill() {
    for (int i = 0; i < SIZE; i++) {
        for (int j = 0; j < SIZE; j++) {
            distances[i][j] = 255;
        }
    }

    head = 0; tail = 0;
    
    uint8_t c1 = (SIZE / 2) - 1;
    uint8_t c2 = (SIZE / 2);

    distances[c1][c1] = 0; enqueue(c1, c1);
    distances[c1][c2] = 0; enqueue(c1, c2);
    distances[c2][c1] = 0; enqueue(c2, c1);
    distances[c2][c2] = 0; enqueue(c2, c2);

    while (!isQueueEmpty()) {
        Cell current = dequeue();
        uint8_t cx = current.x;
        uint8_t cy = current.y;
        uint8_t d = distances[cx][cy];

        if (cy < (SIZE - 1) && !(maze[cx][cy] & WALL_NORTH) && distances[cx][cy + 1] == 255) { 
            distances[cx][cy + 1] = d + 1; enqueue(cx, cy + 1); 
        }
        if (cy > 0 && !(maze[cx][cy] & WALL_SOUTH) && distances[cx][cy - 1] == 255) {
            distances[cx][cy - 1] = d + 1; enqueue(cx, cy - 1);
        }
        if (cx < (SIZE - 1) && !(maze[cx][cy] & WALL_EAST) && distances[cx + 1][cy] == 255) {
            distances[cx + 1][cy] = d + 1; enqueue(cx + 1, cy);
        }
        if (cx > 0 && !(maze[cx][cy] & WALL_WEST) && distances[cx - 1][cy] == 255) {
            distances[cx - 1][cy] = d + 1; enqueue(cx - 1, cy);
        }
    }
}

// --- LÓGICA DE DECISÃO E MOVIMENTO ---
void decidirEMover() {
    uint8_t min_dist = 255;
    int best_dir = current_dir; 

    if (current_y < (SIZE - 1) && !(maze[current_x][current_y] & WALL_NORTH)) {
        if (distances[current_x][current_y + 1] < min_dist) {
            min_dist = distances[current_x][current_y + 1]; best_dir = DIR_NORTH;
        }
    }
    if (current_x < (SIZE - 1) && !(maze[current_x][current_y] & WALL_EAST)) {
        if (distances[current_x + 1][current_y] < min_dist) {
            min_dist = distances[current_x + 1][current_y]; best_dir = DIR_EAST;
        }
    }
    if (current_y > 0 && !(maze[current_x][current_y] & WALL_SOUTH)) {
        if (distances[current_x][current_y - 1] < min_dist) {
            min_dist = distances[current_x][current_y - 1]; best_dir = DIR_SOUTH;
        }
    }
    if (current_x > 0 && !(maze[current_x][current_y] & WALL_WEST)) {
        if (distances[current_x - 1][current_y] < min_dist) {
            min_dist = distances[current_x - 1][current_y]; best_dir = DIR_WEST;
        }
    }

    int turn_diff = (best_dir - current_dir + 4) % 4;

    if (turn_diff == 1) {
        API_turnRight();
    } else if (turn_diff == 2) {
        API_turnRight();
        API_turnRight(); 
    } else if (turn_diff == 3) {
        API_turnLeft();
    }

    current_dir = best_dir;
    API_moveForward();

    if (current_dir == DIR_NORTH) current_y += 1;
    else if (current_dir == DIR_EAST)  current_x += 1;
    else if (current_dir == DIR_SOUTH) current_y -= 1;
    else if (current_dir == DIR_WEST)  current_x -= 1;
}

// --- LOOP PRINCIPAL ---
int main() {
    API_setColor(0, 0, 'G'); 
    API_setText(0, 0, "START");

    floodFill(); 

    while(true) {
        if (distances[current_x][current_y] == 0) {
            API_setText(current_x, current_y, "WIN!");
            API_setColor(current_x, current_y, 'G'); 
            break; 
        }

        // PASSO 1: Lê Sensores Relativos
        bool wallFront = API_wallFront();
        bool wallRight = API_wallRight();
        bool wallLeft  = API_wallLeft();
        
        // PASSO 2: Traduz Paredes Relativas para Absolutas (Nova Lógica Limpa)
        int dirFront = current_dir;
        int dirRight = (current_dir + 1) % 4;
        int dirLeft  = (current_dir + 3) % 4;

        if (wallFront) setWallAbsoluta(current_x, current_y, dirFront);
        if (wallRight) setWallAbsoluta(current_x, current_y, dirRight);
        if (wallLeft)  setWallAbsoluta(current_x, current_y, dirLeft);

        // Atualiza a interface gráfica do MMS (Paredes)
        if (maze[current_x][current_y] & WALL_NORTH) API_setWall(current_x, current_y, 'n');
        if (maze[current_x][current_y] & WALL_EAST)  API_setWall(current_x, current_y, 'e');
        if (maze[current_x][current_y] & WALL_SOUTH) API_setWall(current_x, current_y, 's');
        if (maze[current_x][current_y] & WALL_WEST)  API_setWall(current_x, current_y, 'w');

        // PASSO 3: Inunda o Labirinto 
        floodFill();

        // Atualiza a interface gráfica do MMS (Textos)
        char text_dist[5];
        sprintf(text_dist, "%d", distances[current_x][current_y]);
        API_setText(current_x, current_y, text_dist);
        API_setColor(current_x, current_y, 'Y'); 

        // PASSO 4: Decide e move
        decidirEMover();
    }
    
    return 0;
}