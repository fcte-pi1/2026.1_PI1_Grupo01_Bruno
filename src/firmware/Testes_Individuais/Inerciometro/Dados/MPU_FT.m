pkg load signal;


A = csvread('mpu_raw.csv');
B = csvread('mpu_filter1.csv');

Fs = 50; % Hz

pasta_saida = 'FigFFT';

if ~exist(pasta_saida, 'dir')
    mkdir(pasta_saida);
end

nomes = {
    'Acelerômetro X',
    'Acelerômetro Y',
    'Acelerômetro Z',
    'Giroscópio X',
    'Giroscópio Y',
    'Giroscópio Z'
};

n_colunas = min([6, columns(A), columns(B)]);


for coluna = 1:n_colunas

    %% Sinal Original
    xA = A(:, coluna);
    xA = xA - mean(xA);
    xA = xA .* hamming(length(xA));

    %% Sinal Filtrado
    xB = B(:, coluna);
    xB = xB - mean(xB);
    xB = xB .* hamming(length(xB));

    N = length(xA);

    XA = fft(xA);

    P2A = abs(XA)/N;
    P1A = P2A(1:floor(N/2)+1);
    P1A(2:end-1) = 2*P1A(2:end-1);
    P1A(1) = 0;


    XB = fft(xB);

    P2B = abs(XB)/N;
    P1B = P2B(1:floor(N/2)+1);
    P1B(2:end-1) = 2*P1B(2:end-1);
    P1B(1) = 0;

    f = Fs*(0:floor(N/2))/N;

    [pks, locs] = findpeaks(P1A);

    if isempty(pks)
        fprintf('%s: nenhum pico encontrado.\n', nomes{coluna});
        continue;
    end

    [~, idx] = sort(pks, 'descend');

    n_picos = min(10, length(idx));

    locs_top = locs(idx(1:n_picos));
    pks_top  = pks(idx(1:n_picos));

    [freqs_top, ordem] = sort(f(locs_top));
    amps_top = pks_top(ordem);


    fprintf('\n=========================================\n');
    fprintf('%s\n', nomes{coluna});
    fprintf('Freq (Hz)\tAmplitude\n');
    fprintf('-----------------------------------------\n');

    for k = 1:length(freqs_top)
        fprintf('%8.3f\t%10.6f\n', ...
                freqs_top(k), amps_top(k));
    end

    %% Gráfico
    figure(coluna);
    clf;

    plot(f, P1A, ...
         'b', ...
         'linewidth', 1.5);

    hold on;

    plot(f, P1B, ...
         'r', ...
         'linewidth', 1.5);

    plot(freqs_top, amps_top, ...
         'ko', ...
         'MarkerSize', 5);

    grid on;

    xlabel('Frequência (Hz)');
    ylabel('Amplitude');

    title(sprintf('Comparação FFT - %s', nomes{coluna}));

    legend('Original', ...
           'Filtrado (Passa-baixa 5 Hz)', ...
           '10 maiores picos', ...
           'Location', 'northeast');


    nome_arquivo = sprintf('%s/FFT_%s.png', ...
                           pasta_saida, ...
                           nomes{coluna});

    print(gcf, nome_arquivo, '-dpng', '-r300');

    hold off;

end
