import type {
  Anotacao,
  Email,
  EmpresaSalva,
  Exportacao,
  Socio,
} from "./types";

// Dados simulados usados enquanto as áreas 2–6 não estão integradas à API real.
// Tudo isolado aqui para que a troca por fetch() seja feita só em lib/api.ts.

export const SOCIOS_MOCK: Socio[] = [
  {
    id: "soc-001",
    nome: "MARIA CLARA ANDRADE",
    cpf_parcial: "***.412.881-**",
    qualificacao: "Sócio-Administrador",
    data_entrada: "2015-03-11",
    empresa_cnpj: "12.345.678/0001-90",
    empresa_razao_social: "ANDRADE TECNOLOGIA LTDA",
    empresa_uf: "SP",
  },
  {
    id: "soc-002",
    nome: "JOÃO PEDRO MOREIRA",
    cpf_parcial: "***.907.220-**",
    qualificacao: "Sócio",
    data_entrada: "2018-07-02",
    empresa_cnpj: "98.765.432/0001-10",
    empresa_razao_social: "MOREIRA COMERCIO DE ALIMENTOS EIRELI",
    empresa_uf: "MG",
  },
  {
    id: "soc-003",
    nome: "ANA BEATRIZ LIMA",
    cpf_parcial: "***.115.334-**",
    qualificacao: "Administrador",
    data_entrada: "2021-01-20",
    empresa_cnpj: "45.221.909/0001-55",
    empresa_razao_social: "LIMA LOGISTICA E TRANSPORTES SA",
    empresa_uf: "PR",
  },
  {
    id: "soc-004",
    nome: "CARLOS EDUARDO SANTOS",
    cpf_parcial: "***.778.001-**",
    qualificacao: "Sócio-Administrador",
    data_entrada: "2012-11-05",
    empresa_cnpj: "33.019.442/0001-08",
    empresa_razao_social: "SANTOS ENGENHARIA E PROJETOS LTDA",
    empresa_uf: "RJ",
  },
  {
    id: "soc-005",
    nome: "FERNANDA COSTA RIBEIRO",
    cpf_parcial: "***.640.912-**",
    qualificacao: "Sócio",
    data_entrada: "2019-09-17",
    empresa_cnpj: "77.884.120/0001-31",
    empresa_razao_social: "RIBEIRO SAUDE E BEM ESTAR LTDA",
    empresa_uf: "SC",
  },
];

export const EMPRESAS_SALVAS_MOCK: EmpresaSalva[] = [
  {
    cnpj: "12.345.678/0001-90",
    razao_social: "ANDRADE TECNOLOGIA LTDA",
    nome_fantasia: "Andrade Tech",
    uf: "SP",
    municipio: "Campinas",
    cnae_descricao: "Desenvolvimento de programas de computador sob encomenda",
    salva_em: "2026-08-02",
    tags: ["prioridade", "software"],
  },
  {
    cnpj: "45.221.909/0001-55",
    razao_social: "LIMA LOGISTICA E TRANSPORTES SA",
    nome_fantasia: "Lima Log",
    uf: "PR",
    municipio: "Curitiba",
    cnae_descricao: "Transporte rodoviário de carga",
    salva_em: "2026-07-28",
    tags: ["logística"],
  },
  {
    cnpj: "33.019.442/0001-08",
    razao_social: "SANTOS ENGENHARIA E PROJETOS LTDA",
    nome_fantasia: null,
    uf: "RJ",
    municipio: "Niterói",
    cnae_descricao: "Serviços de engenharia",
    salva_em: "2026-07-11",
    tags: ["follow-up"],
  },
];

export const EXPORTACOES_MOCK: Exportacao[] = [
  {
    id: "exp-2041",
    criada_em: "2026-08-18T14:22:00Z",
    filtros: { uf: "SP", cnae: "6201500", capital_social_min: "50000" },
    linhas: 12480,
    arquivo: "empresas_sp_software.csv",
    download_url: "#",
    status: "concluida",
  },
  {
    id: "exp-2035",
    criada_em: "2026-08-15T09:05:00Z",
    filtros: { uf: "MG", porte: "03" },
    linhas: 4310,
    arquivo: "empresas_mg_pequeno_porte.csv",
    download_url: "#",
    status: "concluida",
  },
  {
    id: "exp-2030",
    criada_em: "2026-08-12T18:47:00Z",
    filtros: { razao_social: "transportes", uf: "PR" },
    linhas: 878,
    arquivo: "transportes_pr.csv",
    download_url: "#",
    status: "processando",
  },
];

export const EMAILS_MOCK: Email[] = [
  {
    id: "mail-301",
    para: "contato@andradetech.com.br",
    assunto: "Proposta de parceria comercial",
    corpo: "Olá, identificamos sinergia entre nossas operações e gostaríamos de agendar uma conversa.",
    enviado_em: "2026-08-17T13:10:00Z",
    status: "enviado",
  },
  {
    id: "mail-298",
    para: "comercial@limalog.com.br",
    assunto: "Follow-up — cotação de fretes",
    corpo: "Retomando nosso contato sobre a cotação enviada na semana passada.",
    enviado_em: "2026-08-14T10:32:00Z",
    status: "enviado",
  },
  {
    id: "mail-291",
    para: "financeiro@santosengenharia.com.br",
    assunto: "Apresentação institucional",
    corpo: "Segue material com nosso portfólio de projetos.",
    enviado_em: "2026-08-09T16:58:00Z",
    status: "falhou",
  },
];

export const ANOTACOES_MOCK: Anotacao[] = [
  {
    id: "task-77",
    titulo: "Ligar para o sócio-administrador",
    descricao: "Confirmar interesse na proposta enviada por e-mail.",
    vinculo_tipo: "socio",
    vinculo_nome: "MARIA CLARA ANDRADE",
    vinculo_ref: "soc-001",
    prazo: "2026-08-21",
    concluida: false,
  },
  {
    id: "task-74",
    titulo: "Validar dados de contato",
    descricao: "Telefone da base pública está desatualizado; buscar no site.",
    vinculo_tipo: "empresa",
    vinculo_nome: "LIMA LOGISTICA E TRANSPORTES SA",
    vinculo_ref: "45.221.909/0001-55",
    prazo: "2026-08-20",
    concluida: false,
  },
  {
    id: "task-70",
    titulo: "Enviar apresentação institucional",
    descricao: "Material adaptado para o setor de engenharia.",
    vinculo_tipo: "empresa",
    vinculo_nome: "SANTOS ENGENHARIA E PROJETOS LTDA",
    vinculo_ref: "33.019.442/0001-08",
    prazo: "2026-08-14",
    concluida: true,
  },
];
