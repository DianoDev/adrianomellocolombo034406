export interface Anexo {
  id: number;
  nome: string;
  contentType: string;
  url: string;
}

export interface Tutor {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cpf?: number;
  foto?: Anexo;
}

export interface Pet {
  id: number;
  nome: string;
  raca: string;
  idade: number;
  foto?: Anexo;
}

export interface PetCompleto extends Pet {
  tutores?: Tutor[];
}

export interface PagedResponse<T> {
  page: number;
  size: number;
  total: number;
  pageCount: number;
  content: T[];
}

export interface PetRequestDto {
  nome: string;
  raca?: string;
  idade?: number;
}
