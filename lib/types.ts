export interface DisponibilidadeDia {
  ativo: boolean;
  periodos: ("manha" | "tarde" | "noite" | "madrugada")[];
}

export interface Disponibilidade {
  domingo: DisponibilidadeDia;
  segunda: DisponibilidadeDia;
  terca: DisponibilidadeDia;
  quarta: DisponibilidadeDia;
  quinta: DisponibilidadeDia;
  sexta: DisponibilidadeDia;
  sabado: DisponibilidadeDia;
}

export interface Acompanhante {
  id: number;
  nome: string;
  telefone: string;
  avatar: string | null;
  cor: string;
  disponibilidade?: Disponibilidade;
}

export interface Turno {
  id: number;
  acompanhanteId: number;
  data: string;
  periodo: "manha" | "tarde" | "noite" | "madrugada";
  horaInicio: string;
  horaFim: string;
  observacao: string;
  pontosAtencao: string;
  checkinHora?: string;      // Hora real de entrada (formato HH:mm)
  checkoutHora?: string;     // Hora real de saida (formato HH:mm)
  checkinAt?: string;        // Timestamp do checkin
  checkoutAt?: string;       // Timestamp do checkout
}

export interface Periodo {
  id: string;
  nome: string;
  horaInicio: string;
  horaFim: string;
}

export interface Database {
  acompanhantes: Acompanhante[];
  turnos: Turno[];
  registrosAcompanhamento: RegistroAcompanhamento[];
  configuracoes: {
    periodos: Periodo[];
  };
}

export interface Gap {
  inicio: string;
  fim: string;
  duracao: number;
  periodo?: string;
}

export interface CoberturaData {
  data: string;
  gaps: Gap[];
  horasDescobertasTotal: number;
  horasCobertas: number;
  porcentagemCobertura: number;
  turnos: Turno[];
}

export interface RegistroAcompanhamento {
  id: number;
  data: string;
  tipo: "intercorrencia" | "dia_bom" | "observacao";
  titulo: string;
  descricao: string;
  gravidade?: "leve" | "moderada" | "grave";
  createdAt: string;
}
