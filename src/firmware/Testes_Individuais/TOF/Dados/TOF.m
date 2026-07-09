clc;
clear;
close all;
pkg load statistics;

%arquivo = 'TOF Frontal.txt';
arquivo = 'TOF Lateral.txt';

dados_brutos = load(arquivo);

Q1_bruto = prctile(dados_brutos, 25);
Q3_bruto = prctile(dados_brutos, 75);
IQR_bruto = Q3_bruto - Q1_bruto;

limite_inferior = Q1_bruto - 1.5 * IQR_bruto;
limite_superior = Q3_bruto + 1.5 * IQR_bruto;

outliers = dados_brutos( ...
    dados_brutos < limite_inferior | ...
    dados_brutos > limite_superior);

dados = dados_brutos( ...
    dados_brutos >= limite_inferior & ...
    dados_brutos <= limite_superior);

n = length(dados);

media = mean(dados);
mediana = median(dados);
desvio_padrao = std(dados);

minimo = min(dados);
maximo = max(dados);
amplitude = maximo - minimo;

Q1 = prctile(dados, 25);
Q3 = prctile(dados, 75);
IQR = Q3 - Q1;

CV = (desvio_padrao / media) * 100;



fprintf('\n');
fprintf('Arquivo analisado      : %s\n', arquivo);
fprintf('Amostras originais     : %d\n', length(dados_brutos));
fprintf('Outliers removidos     : %d\n', length(outliers));
fprintf('Amostras utilizadas    : %d\n', n);

fprintf('\n');
fprintf('---------- Medidas de tendencia ----------\n');
fprintf('Media                 : %.3f\n', media);
fprintf('Mediana               : %.3f\n', mediana);

fprintf('\n');
fprintf('---------- Medidas de dispersao ----------\n');
fprintf('Desvio padrao         : %.3f\n', desvio_padrao);
fprintf('Coef. Variacao (CV)   : %.3f %%\n', CV);
fprintf('Amplitude             : %.3f\n', amplitude);

fprintf('\n');
fprintf('---------- Quartis ----------\n');
fprintf('Q1                    : %.3f\n', Q1);
fprintf('Q3                    : %.3f\n', Q3);
fprintf('IQR                   : %.3f\n', IQR);

fprintf('\n');
fprintf('---------- Extremos ----------\n');
fprintf('Minimo                : %.3f\n', minimo);
fprintf('Maximo                : %.3f\n', maximo);

fprintf('\n');
fprintf('---------- Limites IQR ----------\n');
fprintf('Limite inferior       : %.3f\n', limite_inferior);
fprintf('Limite superior       : %.3f\n', limite_superior);

fprintf('\n');
fprintf('---------- Outliers ----------\n');
fprintf('Quantidade            : %d\n', length(outliers));

if isempty(outliers)
    fprintf('Nenhum outlier encontrado.\n');
else
    disp('Valores removidos:');
    disp(outliers');
endif
