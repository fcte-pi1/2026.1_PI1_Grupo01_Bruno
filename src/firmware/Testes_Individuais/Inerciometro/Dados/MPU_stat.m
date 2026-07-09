A = csvread('mpu_filter2.csv');

n_colunas = min(6, columns(A));

fprintf("\n");
fprintf("Col | Média      | DesvPad    | Variância  | RMS        | Min        | Max        \n");
fprintf("----------------------------------------------------------------------------------\n");

for coluna = 1:n_colunas

    x = A(:, coluna);

    media = mean(x);
    desvio = std(x);
    variancia = var(x);
    rms_val = rms(x);

    minimo = min(x);
    maximo = max(x);


    fprintf("%3d | %10.5f | %10.5f | %10.5f | %10.5f | %10.5f | %10.5f \n", ...
            coluna, media, desvio, variancia, rms_val, ...
            minimo, maximo);

end
