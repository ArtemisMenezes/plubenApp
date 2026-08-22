export type Empresa = {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  capital_social: number | null;
  porte: string | null;
  cnae_descricao: string | null;
  uf: string;
  municipio_descricao: string | null;
  email: string | null;
  telefone1: string | null;
  ddd1: string | null;
};

export type Socio = {
  id: string;
  nome: string;
  cpf_parcial: string;
  qualificacao: string;
  data_entrada: string;
  empresa_cnpj: string;
  empresa_razao_social: string;
  empresa_uf: string;
};

export type EmpresaSalva = {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  uf: string;
  municipio: string;
  cnae_descricao: string;
  salva_em: string;
  tags: string[];
};

export type Exportacao = {
  id: string;
  criada_em: string;
  filtros: Record<string, string>;
  linhas: number;
  arquivo: string;
  download_url: string;
  status: "concluida" | "processando" | "erro";
};

export type Email = {
  id: string;
  para: string;
  assunto: string;
  corpo: string;
  enviado_em: string;
  status: "enviado" | "rascunho" | "falhou";
};

export type NovoEmail = {
  para: string;
  assunto: string;
  corpo: string;
};

export type Anotacao = {
  id: string;
  titulo: string;
  descricao: string;
  vinculo_tipo: "empresa" | "socio";
  vinculo_nome: string;
  vinculo_ref: string;
  prazo: string;
  concluida: boolean;
};
