import os
import csv
import time

PASTA_DADOS = '../dados'
ARQUIVO_SAIDA = '../dados/estabelecimentos_ativos_brasil.csv'

# Código '02' na Receita Federal significa empresa ATIVA
STATUS_ATIVO = '02'
INDICE_SITUACAO = 5 # A Situação Cadastral é a 6ª coluna

print("=== INICIANDO LIMPEZA EM MASSA (BRASIL TODO) ===")
inicio_geral = time.time()

# Encontrar todos os arquivos que terminam com .ESTABELE na pasta dados
arquivos_estabelecimentos = [f for f in os.listdir(PASTA_DADOS) if f.endswith('.ESTABELE')]

if not arquivos_estabelecimentos:
    print(f"ERRO: Nenhum arquivo .ESTABELE encontrado na pasta {PASTA_DADOS}")
    exit()

print(f"Encontrados {len(arquivos_estabelecimentos)} arquivos para processar.\n")

total_lidas = 0
total_ativas = 0

# Abrir o arquivo de saída (aqui usamos UTF-8 para salvar modernizado)
with open(ARQUIVO_SAIDA, 'w', encoding='utf-8', newline='') as f_out:
    escritor = csv.writer(f_out, delimiter=';')
    
    # Processar cada arquivo um por vez
    for nome_arquivo in arquivos_estabelecimentos:
        caminho_arquivo = os.path.join(PASTA_DADOS, nome_arquivo)
        print(f"Processando: {nome_arquivo}...")
        
        # Arquivos da Receita usam latin1 (ISO-8859-1)
        with open(caminho_arquivo, 'r', encoding='latin1') as f_in:
            leitor = csv.reader(f_in, delimiter=';')
            
            lidas_no_arquivo = 0
            ativas_no_arquivo = 0
            
            for linha in leitor:
                lidas_no_arquivo += 1
                total_lidas += 1
                
                if len(linha) > INDICE_SITUACAO and linha[INDICE_SITUACAO] == STATUS_ATIVO:
                    escritor.writerow(linha)
                    ativas_no_arquivo += 1
                    total_ativas += 1
                    
        print(f"  -> Concluído! Lidas: {lidas_no_arquivo:,} | Ativas: {ativas_no_arquivo:,}")

tempo_total = round(time.time() - inicio_geral, 2)
print("\n=== RESUMO FINAL ===")
print(f"Tempo total: {tempo_total} segundos")
print(f"Total de registros originais processados: {total_lidas:,}")
print(f"Total de empresas ATIVAS salvas: {total_ativas:,}")
print(f"Arquivo final gerado: {ARQUIVO_SAIDA}")