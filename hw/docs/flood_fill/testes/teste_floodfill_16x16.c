#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include <string.h>

// --- PARÂMETROS DO LABIRINTO ---
#define SIZE 16
#define TOTAL_CELLS (SIZE * SIZE)

#define DIR_NORTH 0
#define DIR_EAST 1
#define DIR_SOUTH 2
#define DIR_WEST 3

#define WALL_NORTH 0x01
#define WALL_EAST 0x02
#define WALL_SOUTH 0x04
#define WALL_WEST 0x08

// Cores utilizadas para maior clareza
#define BRIGHT_RED "\x1b[91m"
#define DARK_RED "\x1b[2;31m"
#define COLOR_RESET "\x1b[0m"
#define GREEN "\x1b[42m"
#define BLACK "\x1b[30m"

uint8_t maze[SIZE][SIZE] = {0};
uint8_t knownMaze[SIZE][SIZE] = {0};
uint8_t distances[SIZE][SIZE];

int current_x = 0;
int current_y = 0;
int current_dir = DIR_NORTH;

int steps = 0;

typedef struct {
    uint8_t x, y;
} Cell;

Cell queue[TOTAL_CELLS];
int head = 0, tail = 0;

void enqueue(uint8_t x, uint8_t y)
{
    queue[tail].x = x;
    queue[tail].y = y;
    tail = (tail + 1) % TOTAL_CELLS;
}

Cell dequeue()
{
    Cell c = queue[head];
    head = (head + 1) % TOTAL_CELLS;
    return c;
}

bool isQueueEmpty() { return head == tail; }


//Função adicionada para visualização 
void addBorders()
{
    for (int i = 0; i < SIZE; i++)
    {
        maze[i][0] |= WALL_SOUTH;
        maze[i][SIZE - 1] |= WALL_NORTH;
        maze[0][i] |= WALL_WEST;
        maze[SIZE - 1][i] |= WALL_EAST;
    }
}

//Função adicionada para visualização
void buildClassicMaze()
{
    addBorders();

    uint8_t wall_data[][6] = {
    {0,0,0,1,1,1}, {0,1,0,1,0,1}, {0,2,1,0,0,1}, {0,3,0,0,1,1}, {0,4,0,0,0,1}, {0,5,0,0,0,1}, {0,6,0,1,0,1}, {0,7,0,1,0,1}, {0,8,0,1,0,1}, {0,9,0,1,0,1}, {0,10,0,0,0,1}, {0,11,0,0,0,1}, {0,12,1,0,0,1}, {0,13,0,0,1,1}, {0,14,0,1,0,1}, {0,15,1,1,0,1},
    
    {1,0,0,1,1,1}, {1,1,0,1,0,1}, {1,2,0,0,0,0}, {1,3,1,1,0,0}, {1,4,1,0,1,0}, {1,5,1,0,1,0}, {1,6,0,0,1,1}, {1,7,0,1,0,1}, {1,8,0,0,0,1}, {1,9,1,0,0,1}, {1,10,1,0,1,0}, {1,11,1,0,1,0}, {1,12,0,1,1,0}, {1,13,0,0,0,0}, {1,14,0,1,0,1}, {1,15,1,1,0,1},
    
    {2,0,0,1,1,1}, {2,1,0,0,0,1}, {2,2,0,1,0,0}, {2,3,0,1,0,1}, {2,4,1,1,0,0}, {2,5,1,0,1,0}, {2,6,0,0,1,0}, {2,7,1,0,0,1}, {2,8,1,0,1,0}, {2,9,1,0,1,0}, {2,10,1,0,1,0}, {2,11,0,1,1,0}, {2,12,0,1,0,1}, {2,13,0,1,0,0}, {2,14,0,0,0,1}, {2,15,1,1,0,1},
    
    {3,0,0,0,1,1}, {3,1,0,1,0,0}, {3,2,0,1,0,1}, {3,3,0,1,0,1}, {3,4,0,1,0,1}, {3,5,1,1,0,0}, {3,6,1,0,1,0}, {3,7,1,0,1,0}, {3,8,1,0,1,0}, {3,9,1,0,1,0}, {3,10,0,1,1,0}, {3,11,0,1,0,1}, {3,12,0,1,0,1}, {3,13,0,1,0,1}, {3,14,0,1,0,0}, {3,15,1,0,0,1},
    
    {4,0,1,0,1,0}, {4,1,0,0,1,1}, {4,2,0,1,0,1}, {4,3,0,1,0,1}, {4,4,0,1,0,1}, {4,5,0,1,0,1}, {4,6,1,1,0,0}, {4,7,1,0,1,0}, {4,8,1,0,1,0}, {4,9,0,1,1,0}, {4,10,0,1,0,1}, {4,11,0,1,0,1}, {4,12,0,1,0,1}, {4,13,0,1,0,1}, {4,14,1,0,0,1}, {4,15,1,0,1,0},
    
    {5,0,1,0,1,0}, {5,1,1,0,1,0}, {5,2,0,0,1,1}, {5,3,0,1,0,1}, {5,4,0,1,0,1}, {5,5,0,1,0,1}, {5,6,0,1,0,1}, {5,7,1,1,0,0}, {5,8,0,1,1,0}, {5,9,0,0,0,1}, {5,10,0,1,0,1}, {5,11,0,0,0,1}, {5,12,1,0,0,1}, {5,13,1,0,1,1}, {5,14,1,0,1,0}, {5,15,1,0,1,0},
    
    {6,0,1,0,1,0}, {6,1,1,0,1,0}, {6,2,1,0,1,0}, {6,3,0,0,1,1}, {6,4,1,0,0,1}, {6,5,0,0,1,1}, {6,6,0,0,0,1}, {6,7,1,1,0,1}, {6,8,0,1,1,1}, {6,9,0,0,0,0}, {6,10,1,0,0,1}, {6,11,1,0,1,0}, {6,12,1,0,1,0}, {6,13,1,0,1,0}, {6,14,1,0,1,0}, {6,15,1,0,1,0},
    
    {7,0,1,0,1,0}, {7,1,1,0,1,0}, {7,2,1,0,1,0}, {7,3,1,0,1,0}, {7,4,1,0,1,0}, {7,5,1,0,1,0}, {7,6,1,0,1,0}, {7,7,0,0,1,1}, {7,8,1,0,0,1}, {7,9,1,1,1,0}, {7,10,0,0,1,0}, {7,11,1,0,0,0}, {7,12,1,0,1,0}, {7,13,1,0,1,0}, {7,14,1,0,1,0}, {7,15,1,0,1,0},
    
    {8,0,1,0,1,0}, {8,1,1,0,1,0}, {8,2,1,0,1,0}, {8,3,1,0,1,0}, {8,4,1,0,1,0}, {8,5,1,0,1,0}, {8,6,1,0,1,0}, {8,7,0,1,1,0}, {8,8,0,1,0,0}, {8,9,1,0,0,1}, {8,10,1,1,1,0}, {8,11,0,0,1,0}, {8,12,0,0,0,0}, {8,13,1,1,0,0}, {8,14,1,0,1,0}, {8,15,1,0,1,0},
    
    {9,0,1,0,1,0}, {9,1,1,0,1,0}, {9,2,1,0,1,0}, {9,3,1,0,1,0}, {9,4,1,0,1,0}, {9,5,1,0,1,0}, {9,6,0,1,1,0}, {9,7,0,0,0,1}, {9,8,0,0,0,1}, {9,9,1,1,0,0}, {9,10,0,1,1,1}, {9,11,1,1,0,0}, {9,12,0,1,1,0}, {9,13,1,0,0,1}, {9,14,1,0,1,0}, {9,15,1,0,1,0},
    
    {10,0,1,0,1,0}, {10,1,1,0,1,0}, {10,2,1,0,1,0}, {10,3,1,0,1,0}, {10,4,1,0,1,0}, {10,5,1,0,1,0}, {10,6,0,0,1,1}, {10,7,1,0,0,0}, {10,8,1,0,1,0}, {10,9,0,0,1,1}, {10,10,1,0,0,1}, {10,11,0,0,1,1}, {10,12,1,0,0,1}, {10,13,1,0,1,0}, {10,14,1,0,1,0}, {10,15,1,0,1,0},
    
    {11,0,1,0,1,0}, {11,1,1,0,1,0}, {11,2,1,0,1,0}, {11,3,1,0,1,0}, {11,4,1,0,1,0}, {11,5,0,1,1,0}, {11,6,1,0,0,0}, {11,7,1,0,1,0}, {11,8,1,0,1,0}, {11,9,1,0,1,0}, {11,10,1,0,1,0}, {11,11,1,0,1,0}, {11,12,1,0,1,0}, {11,13,1,0,1,0}, {11,14,1,0,1,0}, {11,15,1,0,1,0},
    
    {12,0,1,0,1,0}, {12,1,1,0,1,0}, {12,2,1,0,1,0}, {12,3,1,0,1,0}, {12,4,1,0,1,0}, {12,5,0,0,1,1}, {12,6,0,0,0,0}, {12,7,1,0,0,0}, {12,8,1,0,1,0}, {12,9,1,0,1,0}, {12,10,1,0,1,0}, {12,11,1,0,1,0}, {12,12,1,0,1,0}, {12,13,1,0,1,0}, {12,14,1,0,1,0}, {12,15,1,0,1,0},
    
    {13,0,1,0,1,0}, {13,1,1,0,1,0}, {13,2,1,0,1,0}, {13,3,1,0,1,0}, {13,4,1,0,1,0}, {13,5,1,0,1,0}, {13,6,1,0,1,0}, {13,7,1,0,1,0}, {13,8,0,1,1,0}, {13,9,1,1,0,0}, {13,10,0,1,1,0}, {13,11,1,1,0,0}, {13,12,1,0,1,0}, {13,13,1,0,1,0}, {13,14,1,0,1,0}, {13,15,1,0,1,0},
    
    {14,0,1,0,1,0}, {14,1,1,0,1,0}, {14,2,0,1,1,0}, {14,3,1,1,0,0}, {14,4,0,0,1,0}, {14,5,0,1,0,0}, {14,6,0,1,0,0}, {14,7,1,0,0,0}, {14,8,0,1,1,1}, {14,9,0,1,0,1}, {14,10,0,1,0,1}, {14,11,0,1,0,1}, {14,12,0,1,0,0}, {14,13,1,1,0,0}, {14,14,1,0,1,0}, {14,15,1,0,1,0},
    
    {15,0,0,1,1,0}, {15,1,1,1,0,0}, {15,2,0,1,1,1}, {15,3,0,1,0,1}, {15,4,0,1,0,0}, {15,5,0,1,0,1}, {15,6,0,1,0,1}, {15,7,1,1,0,0}, {15,8,0,1,1,1}, {15,9,0,1,0,1}, {15,10,0,1,0,1}, {15,11,0,1,0,1}, {15,12,0,1,0,1}, {15,13,0,1,0,1}, {15,14,0,1,0,0}, {15,15,1,1,0,0}
};
    int total_elements = sizeof(wall_data) / sizeof(wall_data[0]);

    for (int i = 0; i < total_elements; i++)
    {
        int x = wall_data[i][0];
        int y = wall_data[i][1];

        if (wall_data[i][2])
            maze[x][y] |= WALL_NORTH;
        if (wall_data[i][3])
            maze[x][y] |= WALL_EAST;
        if (wall_data[i][4])
            maze[x][y] |= WALL_SOUTH;
        if (wall_data[i][5])
            maze[x][y] |= WALL_WEST;
    }
}

void floodFill()
{
    for (int i = 0; i < SIZE; i++)
        for (int j = 0; j < SIZE; j++)
            distances[i][j] = 255;

    head = 0;
    tail = 0;

    uint8_t c1 = (SIZE / 2) - 1;
    uint8_t c2 = (SIZE / 2);

    distances[c1][c1] = 0;
    enqueue(c1, c1);

    distances[c1][c2] = 0;
    enqueue(c1, c2);

    distances[c2][c1] = 0;
    enqueue(c2, c1);
    
    distances[c2][c2] = 0;
    enqueue(c2, c2);

    while (!isQueueEmpty())
    {
        Cell current = dequeue();
        uint8_t cx = current.x, cy = current.y;
        uint8_t d = distances[cx][cy];
        if (cy < SIZE - 1 && !(knownMaze[cx][cy] & WALL_NORTH) && distances[cx][cy + 1] == 255)
        {
            distances[cx][cy + 1] = d + 1;
            enqueue(cx, cy + 1);
        }
        if (cy > 0 && !(knownMaze[cx][cy] & WALL_SOUTH) && distances[cx][cy - 1] == 255)
        {
            distances[cx][cy - 1] = d + 1;
            enqueue(cx, cy - 1);
        }
        if (cx < SIZE - 1 && !(knownMaze[cx][cy] & WALL_EAST) && distances[cx + 1][cy] == 255)
        {
            distances[cx + 1][cy] = d + 1;
            enqueue(cx + 1, cy);
        }
        if (cx > 0 && !(knownMaze[cx][cy] & WALL_WEST) && distances[cx - 1][cy] == 255)
        {
            distances[cx - 1][cy] = d + 1;
            enqueue(cx - 1, cy);
        }
    }
}

void setWallAbsoluta(int x, int y, int dir)
{
    if (dir == DIR_NORTH)
    {
        knownMaze[x][y] |= WALL_NORTH;
        if (y < SIZE - 1)
            knownMaze[x][y + 1] |= WALL_SOUTH;
    }
    else if (dir == DIR_EAST)
    {
        knownMaze[x][y] |= WALL_EAST;
        if (x < SIZE - 1)
            knownMaze[x + 1][y] |= WALL_WEST;
    }
    else if (dir == DIR_SOUTH)
    {
        knownMaze[x][y] |= WALL_SOUTH;
        if (y > 0)
            knownMaze[x][y - 1] |= WALL_NORTH;
    }
    else if (dir == DIR_WEST)
    {
        knownMaze[x][y] |= WALL_WEST;
        if (x > 0)
            knownMaze[x - 1][y] |= WALL_EAST;
    }
}

bool API_wallFront() { return !!(maze[current_x][current_y] & (uint8_t[]){WALL_NORTH, WALL_EAST, WALL_SOUTH, WALL_WEST}[current_dir]); }
bool API_wallRight() { return !!(maze[current_x][current_y] & (uint8_t[]){WALL_NORTH, WALL_EAST, WALL_SOUTH, WALL_WEST}[(current_dir + 1) % 4]); }
bool API_wallLeft() { return !!(maze[current_x][current_y] & (uint8_t[]){WALL_NORTH, WALL_EAST, WALL_SOUTH, WALL_WEST}[(current_dir + 3) % 4]); }


void drawMaze()
{
    printf("\033[2J\033[H");

    const char *dir_arrows[] = {"^", ">", "v", "<"};
    const char *dir_names[] = {"NORTE", "LESTE", "SUL", "OESTE"};

    printf("XAROPi — Flood Fill Visual | Passo: %d | Pos: (%d,%d) | Dir: %s | Dist: %d\n",
           steps, current_x, current_y, dir_names[current_dir],
           distances[current_x][current_y] == 255 ? -1 : distances[current_x][current_y]);

    printf("Legenda: " BRIGHT_RED "||" COLOR_RESET " Conhecida, " DARK_RED "||" COLOR_RESET " Desconhecida\n\n");

    for (int y = SIZE - 1; y >= 0; y--)
    {

        printf("  ");
        for (int x = 0; x < SIZE; x++)
        {
            printf("+");

            if (maze[x][y] & WALL_NORTH)
            {
                if (knownMaze[x][y] & WALL_NORTH)
                {
                    printf(BRIGHT_RED "---" COLOR_RESET);
                }
                else
                {
                    printf(DARK_RED "---" COLOR_RESET);
                }
            }
            else
            {
                printf("   ");
            }
        }
        printf("+\n");

        printf("%2d", y);
        for (int x = 0; x < SIZE; x++)
        {

            if (maze[x][y] & WALL_WEST)
            {
                if (knownMaze[x][y] & WALL_WEST)
                {
                    printf(BRIGHT_RED "|" COLOR_RESET);
                }
                else
                {
                    printf(DARK_RED "|" COLOR_RESET);
                }
            }
            else
            {
                printf(" ");
            }

            bool isRobot = (x == current_x && y == current_y);
            bool isCenter = ((x == 7 || x == 8) && (y == 7 || y == 8));
            uint8_t d = distances[x][y];

            if (isRobot)
            {
                printf(GREEN BLACK " %s " COLOR_RESET, dir_arrows[current_dir]);
            }
            else if (isCenter)
            {
                printf(" * ");
            }
            else if (d < 255)
            {
                if (d < 100)
                    printf("%3d", d);
                else
                    printf("!!!");
            }
            else
            {
                printf("   ");
            }
        }

        if (maze[SIZE - 1][y] & WALL_EAST)
        {
            if (knownMaze[SIZE - 1][y] & WALL_EAST)
            {
                printf(BRIGHT_RED "|" COLOR_RESET "\n");
            }
            else
            {
                printf(DARK_RED "|" COLOR_RESET "\n");
            }
        }
        else
        {
            printf(" \n");
        }
    }

    printf("  ");
    for (int x = 0; x < SIZE; x++)
    {
        printf("+");
        if (maze[x][0] & WALL_SOUTH)
        {
            if (knownMaze[x][0] & WALL_SOUTH)
            {
                printf(BRIGHT_RED "---" COLOR_RESET);
            }
            else
            {
                printf(DARK_RED "---" COLOR_RESET);
            }
        }
        else
        {
            printf("   ");
        }
    }
    printf("+\n");

    printf("  ");
    for (int x = 0; x < SIZE; x++)
        printf("  %2d", x);
    printf("\n");
}

// --- LÓGICA DE DECISÃO E MOVIMENTO ---
char last_action[64] = "Inicio";

void decidirEMover()
{
    uint8_t min_dist = 255;
    int best_dir = current_dir;

    if (current_y < SIZE - 1 && !(knownMaze[current_x][current_y] & WALL_NORTH) && distances[current_x][current_y + 1] < min_dist)
    {
        min_dist = distances[current_x][current_y + 1];
        best_dir = DIR_NORTH;
    }
    if (current_x < SIZE - 1 && !(knownMaze[current_x][current_y] & WALL_EAST) && distances[current_x + 1][current_y] < min_dist)
    {
        min_dist = distances[current_x + 1][current_y];
        best_dir = DIR_EAST;
    }
    if (current_y > 0 && !(knownMaze[current_x][current_y] & WALL_SOUTH) && distances[current_x][current_y - 1] < min_dist)
    {
        min_dist = distances[current_x][current_y - 1];
        best_dir = DIR_SOUTH;
    }
    if (current_x > 0 && !(knownMaze[current_x][current_y] & WALL_WEST) && distances[current_x - 1][current_y] < min_dist)
    {
        min_dist = distances[current_x - 1][current_y];
        best_dir = DIR_WEST;
    }

    int turn_diff = (best_dir - current_dir + 4) % 4;

    strcpy(last_action, "");
    if (turn_diff == 1)
    {
        strcat(last_action, "Virou direita. ");
    }
    else if (turn_diff == 2)
    {
        strcat(last_action, "Meia-volta. ");
    }
    else if (turn_diff == 3)
    {
        strcat(last_action, "Virou esquerda. ");
    }
    strcat(last_action, "Avancou.");

    current_dir = best_dir;

    if (current_dir == DIR_NORTH)
        current_y++;
    else if (current_dir == DIR_EAST)
        current_x++;
    else if (current_dir == DIR_SOUTH)
        current_y--;
    else if (current_dir == DIR_WEST)
        current_x--;

    steps++;
}

int main()
{
    for (int i = 0; i < SIZE; i++)
    {
        knownMaze[i][0] |= WALL_SOUTH;
        knownMaze[i][SIZE - 1] |= WALL_NORTH;
        knownMaze[0][i] |= WALL_WEST;
        knownMaze[SIZE - 1][i] |= WALL_EAST;
    }

    buildClassicMaze();
    floodFill();
    drawMaze();
    printf("\nLabirinto carregado. Micromouse em (0,0) olhando NORTE.\n");
    printf("Pressione ENTER para avancar (q + ENTER para sair)...\n");

    char buf[8];
    while (1)
    {
        if (fgets(buf, sizeof(buf), stdin) == NULL)
            break;
        if (buf[0] == 'q')
            break;

        if (distances[current_x][current_y] == 0)
        {
            drawMaze();
            printf("\n*** CHEGOU AO CENTRO em %d passos! ***\n", steps);
            break;
        }

        // Passo 1: lê sensores
        bool wallFront = API_wallFront();
        bool wallRight = API_wallRight();
        bool wallLeft = API_wallLeft();

        // Passo 2: registra paredes no mapa conhecido
        int dirFront = current_dir;
        int dirRight = (current_dir + 1) % 4;
        int dirLeft = (current_dir + 3) % 4;
        if (wallFront)
            setWallAbsoluta(current_x, current_y, dirFront);
        if (wallRight)
            setWallAbsoluta(current_x, current_y, dirRight);
        if (wallLeft)
            setWallAbsoluta(current_x, current_y, dirLeft);

        // Passo 3: flood fill com o mapa atualizado
        floodFill();

        // Passo 4: decide e move
        decidirEMover();

        drawMaze();
        printf("\nAcao: %s\n", last_action);
        printf("Sensores - Frente: %s  Direita: %s  Esquerda: %s\n",
               wallFront ? "PAREDE" : "livre",
               wallRight ? "PAREDE" : "livre",
               wallLeft ? "PAREDE" : "livre");
        printf("Pressione ENTER para avancar (q + ENTER para sair)...\n");
    }

    return 0;
}
