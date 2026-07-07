import { Task, Discipline, TeamMember, SmartInsights } from "./types";

export const rawDefaultCSV = `Gerencia;Campo;rea;Proyecto;Paquete;Estado Actual Global;Mes Programado;% peso;% de avance ejecutado
GOR;Cao Sur;Proyecto EDP;ECU17049_CSE MDULO 3;CASE0020;COMPLETADO;Abril;0,68%;0,68%
GOR;Cao Sur;Proyecto EDP;ECU17049_CSE MDULO 3;CASE0021;COMPLETADO;Mayo;0,67%;0,67%
GOR;Cao Sur;Proyecto EDP;ECU17049_CSE MDULO 3;CASE0095;COMPLETADO;Junio;0,67%;0,67%
GOR;Cao Sur;Proyecto EDP;ECU17049_CSE MDULO 3;CASE0384;SIN INICIAR;Julio;0,67%;
GOR;Cao Sur;Proyecto EDP;ECU17049_CSE MDULO 3;CASE0390;SIN INICIAR;Agosto;0,67%;
GOR;Cao Sur;Proyecto EDP;ECU17049_CSE MDULO 3;EMB0001;SIN INICIAR;Septiembre;0,67%;
GPA;Huila;Proyecto EDP;ECU17002 CLASIFICACIN DE AREAS Y APANTALLAMIENTO;Batera Balcn;COMPLETADO;Abril;2,13%;2,13%
GPA;Huila;Proyecto EDP;ECU17002 CLASIFICACIN DE AREAS Y APANTALLAMIENTO;Batera Brisas;COMPLETADO;Mayo;2,13%;2,13%
GPA;Huila;Proyecto EDP;ECU17002 CLASIFICACIN DE AREAS Y APANTALLAMIENTO;Batera Ceb;COMPLETADO;Junio;2,13%;2,13%
GPA;Huila;Proyecto EDP;ECU17002 CLASIFICACIN DE AREAS Y APANTALLAMIENTO;Batera Dina Cretceos;SIN INICIAR;Julio;2,13%;
GPA;Huila;Proyecto EDP;ECU17002 CLASIFICACIN DE AREAS Y APANTALLAMIENTO;Batera Dina Norte;SIN INICIAR;Agosto;2,13%;
GPA;Huila;Proyecto EDP;ECU17002 CLASIFICACIN DE AREAS Y APANTALLAMIENTO;Batera Monal;SIN INICIAR;Septiembre;2,13%;
GPA;Huila;Proyecto EDP;ECU17002 CLASIFICACIN DE AREAS Y APANTALLAMIENTO;Batera Rio Ceibas Norte;SIN INICIAR;Octubre;2,13%;
GPA;Huila;Proyecto EDP;ECU17002 CLASIFICACIN DE AREAS Y APANTALLAMIENTO;Batera Santa Clara;SIN INICIAR;Noviembre;2,13%;
GPA;Huila;Proyecto EDP;ECU17002 CLASIFICACIN DE AREAS Y APANTALLAMIENTO;Batera Satlite;SIN INICIAR;Diciembre;2,13%;
GPA;Huila;Proyecto EDP;ECU17002 CLASIFICACIN DE AREAS Y APANTALLAMIENTO;Batera Tello;COMPLETADO;Abril;2,13%;2,13%
GPA;Huila;Proyecto EDP;ECU17002 CLASIFICACIN DE AREAS Y APANTALLAMIENTO;Batera Yaguar;COMPLETADO;Mayo;2,13%;2,13%
GPA;Huila;Proyecto EDP;ECU17026 ENDULZAMIENTO DE GAS GDH;Batera Balcn;COMPLETADO;Junio;2,13%;2,13%
GPA;Huila;Proyecto EDP;ECU17026 ENDULZAMIENTO DE GAS GDH;Batera Dina Cretceos;SIN INICIAR;Julio;2,13%;
GPA;Huila;Proyecto EDP;ECU17026 ENDULZAMIENTO DE GAS GDH;Batera Terciarios;SIN INICIAR;Agosto;2,13%;
GPA;Huila;Proyecto EDP;ECU17027 OPTI SIST TRATA AGUA TELLO;Sistema de Filtracin;SIN INICIAR;Septiembre;2,13%;
GPA;Huila;Proyecto EDP;ECU17046_APROVECHAMIENTO DE GAS GDH_LNEA;BATERA CEB;SIN INICIAR;Octubre;2,13%;
GPA;Huila;Proyecto EDP;ECU18022 APROV Y ASEG CALIDAD GAS ENVIADO AL CGT;Batera Santa Clara;SIN INICIAR;Noviembre;2,13%;
GPA;Huila;Proyecto EDP;ECU18022 APROV Y ASEG CALIDAD GAS ENVIADO AL CGT;Batera Tello;SIN INICIAR;Diciembre;2,13%;
GPA;Huila;Proyecto EDP;ECU18022 APROV Y ASEG CALIDAD GAS ENVIADO AL CGT;Lneas de GAS;COMPLETADO;Abril;2,13%;2,13%
GPA;Huila;Proyecto EDP;ECU18039 DESARROLLO SAN FRANCISCO;SF-002;COMPLETADO;Mayo;2,13%;2,13%
GPA;Huila;Proyecto EDP;ECU18039 DESARROLLO SAN FRANCISCO;SF-008;COMPLETADO;Junio;2,13%;2,13%
GPA;Huila;Proyecto EDP;ECU18039 DESARROLLO SAN FRANCISCO;SF-034;SIN INICIAR;Julio;2,13%;
GPA;Huila;Proyecto EDP;ECU18039 DESARROLLO SAN FRANCISCO;SF-047;SIN INICIAR;Agosto;2,13%;
GPA;Huila;Proyecto EDP;ECU18039 DESARROLLO SAN FRANCISCO;SF-051;SIN INICIAR;Septiembre;2,13%;
GPA;Huila;Proyecto EDP;ECU18039 DESARROLLO SAN FRANCISCO;SF-075;SIN INICIAR;Octubre;2,13%;
GPA;Huila;Proyecto EDP;ECU19012 DISPOSICION DE AGUA ASOCIADA A PRODUCCION;Dina Cretceos;SIN INICIAR;Noviembre;2,13%;
GPA;Huila;Proyecto EDP;ECU19012 DISPOSICION DE AGUA ASOCIADA A PRODUCCION;SANTA CLARA;SIN INICIAR;Diciembre;2,13%;
GPA;Huila;Proyecto EDP;ECU21027_DESARROLLO HONDA POZOS APPRAISAL;CB-04;COMPLETADO;Abril;2,13%;2,13%
GPA;Huila;Proyecto EDP;ECU21027_DESARROLLO HONDA POZOS APPRAISAL;PG-03;COMPLETADO;Mayo;2,13%;2,13%
GPA;Huila;Proyecto EDP;ECU21027_DESARROLLO HONDA POZOS APPRAISAL;PG-39;COMPLETADO;Junio;2,13%;2,13%
GPA;Putumayo;Proyecto EDP;ECU17097_MDULO 1 CLASIFICACIN DE REAS Y PUESTA A TIERRA;BATERA CARIBE;COMPLETADO;Abril;2,13%;2,13%
GPA;Putumayo;Proyecto EDP;ECU17097_MDULO 1 CLASIFICACIN DE REAS Y PUESTA A TIERRA;BATERA CHURUYACO;COMPLETADO;Mayo;2,13%;2,13%
GPA;Putumayo;Proyecto EDP;ECU17097_MDULO 1 CLASIFICACIN DE REAS Y PUESTA A TIERRA;BATERA COLON;COMPLETADO;Junio;2,13%;2,13%
GPA;Putumayo;Proyecto EDP;ECU17097_MDULO 1 CLASIFICACIN DE REAS Y PUESTA A TIERRA;BATERA DOS;SIN INICIAR;Julio;2,13%;
GPA;Putumayo;Proyecto EDP;ECU17097_MDULO 1 CLASIFICACIN DE REAS Y PUESTA A TIERRA;BATERA MANSOYA;SIN INICIAR;Agosto;2,13%;
GPA;Putumayo;Proyecto EDP;ECU17097_MDULO 1 CLASIFICACIN DE REAS Y PUESTA A TIERRA;BATERA UNO;SIN INICIAR;Septiembre;2,13%;
GPA;Putumayo;Proyecto EDP;ECU17097_MDULO 1 CLASIFICACIN DE REAS Y PUESTA A TIERRA;PLANTA PROCESOS;SIN INICIAR;Octubre;2,13%;
GPA;Putumayo;Proyecto EDP;ECU17098 MOD2 CENTRO DE CONTROL DE MOTORES;Batera Caribe;SIN INICIAR;Noviembre;2,13%;
GPA;Putumayo;Proyecto EDP;ECU17098 MOD2 CENTRO DE CONTROL DE MOTORES;Batera Churuyaco;SIN INICIAR;Diciembre;2,13%;
GPA;Putumayo;Proyecto EDP;ECU17098 MOD2 CENTRO DE CONTROL DE MOTORES;Despacho - Planta de Procesos;COMPLETADO;Abril;2,13%;2,13%
GPA;Putumayo;Proyecto EDP;ECU17098 MOD2 CENTRO DE CONTROL DE MOTORES;Planta de procesos;COMPLETADO;Mayo;2,13%;2,13%
GPA;Putumayo;Proyecto EDP;ECU17098 MOD2 CENTRO DE CONTROL DE MOTORES;Uno Orito;COMPLETADO;Junio;2,13%;2,13%
GPA;Putumayo;Proyecto EDP;ECU18005 MOD 1_TECNOLOGIAS LIMPIAS SUR;ACAE 14;SIN INICIAR;Julio;2,13%;
GPA;Putumayo;Proyecto EDP;ECU18031_DESARROLLO_AREA_SUR_MOD_1;AC 12;SIN INICIAR;Agosto;2,13%;
GPA;Putumayo;Proyecto EDP;ECU18031_DESARROLLO_AREA_SUR_MOD_1;AC 13;SIN INICIAR;Septiembre;2,13%;
GPA;Putumayo;Proyecto EDP;ECU18031_DESARROLLO_AREA_SUR_MOD_1;LR 12D_TRONCAL;SIN INICIAR;Octubre;2,13%;
GPA;Putumayo;Proyecto EDP;ECU18031_DESARROLLO_AREA_SUR_MOD_1;ECU18031_DESARROLLO_AREA_SUR_MOD_1;SIN INICIAR;Noviembre;2,13%;
GOR;Rubiales;Proyecto EDP;ECU17114_INFILL_MODULO_B4;RB-116;COMPLETADO;Abril;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU17114_INFILL_MODULO_B4;RB-139;COMPLETADO;Mayo;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU17114_INFILL_MODULO_B4;RB-403;COMPLETADO;Junio;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU17114_INFILL_MODULO_B4;RB-442;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyecto EDP;ECU17114_INFILL_MODULO_B4;RB-560;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyecto EDP;ECU17114_INFILL_MODULO_B4;RB-563;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU17114_INFILL_MODULO_B4;RB-688;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU17114_INFILL_MODULO_B4;RB-739;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU17114_INFILL_MODULO_B4;RB-935;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU17114_INFILL_MODULO_B4;TRONCAL 10;COMPLETADO;Abril;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU18023 NORMA_ SIST_DE_ALIVIOS;CPF 2;COMPLETADO;Mayo;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU18023 NORMA_ SIST_DE_ALIVIOS;PAD 2;COMPLETADO;Junio;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU18023 NORMA_ SIST_DE_ALIVIOS;PAD 3;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18023 NORMA_ SIST_DE_ALIVIOS;PAD 4;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18023 NORMA_ SIST_DE_ALIVIOS;PAD 5;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18023 NORMA_ SIST_DE_ALIVIOS;PAD 6;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18023 NORMA_ SIST_DE_ALIVIOS;PAD 7;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-026;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-090;COMPLETADO;Abril;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-119;COMPLETADO;Mayo;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-129;COMPLETADO;Junio;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-147;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-158;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-165;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-220;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-244;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-252;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-280;COMPLETADO;Abril;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-283;COMPLETADO;Mayo;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-320;COMPLETADO;Junio;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-411;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-558;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-561;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-624;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU18046 MOD_INTEGRADO_RUBIALES_2019_2025;RB-770;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19009 RETIE FACILIDADES RUBIALES CSE MODULO 1;RETIE FACILIDADES RUB-CSE;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-004NE;COMPLETADO;Abril;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-082;COMPLETADO;Mayo;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-092;COMPLETADO;Junio;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-1053;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-112;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-115;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-117;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-118;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-119;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-128;COMPLETADO;Abril;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-129;COMPLETADO;Mayo;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-130;COMPLETADO;Junio;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-143;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-146;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-148;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-150;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-151;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-159;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-160;COMPLETADO;Abril;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-161;COMPLETADO;Mayo;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-199;COMPLETADO;Junio;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-218;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-219;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-220;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-221;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-222;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-224;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-233;COMPLETADO;Abril;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-243;COMPLETADO;Mayo;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-245;COMPLETADO;Junio;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-269;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-270;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-271;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-274;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-276;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-280;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-282;COMPLETADO;Abril;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-283;COMPLETADO;Mayo;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-287;COMPLETADO;Junio;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-288;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-293;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-315;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-316;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-317;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-320;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-353;COMPLETADO;Abril;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-359;COMPLETADO;Mayo;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-361;COMPLETADO;Junio;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-362;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-365;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-400;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-410;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-415;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-433;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-441;COMPLETADO;Abril;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-446;COMPLETADO;Mayo;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-453;COMPLETADO;Junio;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-486;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-489;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-490H;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-523;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-529;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-558;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-559;COMPLETADO;Abril;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-561;COMPLETADO;Mayo;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-562 act;COMPLETADO;Junio;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-628;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-632;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-638;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-707H;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-714;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-739;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;RB-863;COMPLETADO;Abril;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19035 MDULO INTEGRADO RUBIALES ETAPA 2;Troncal 5;COMPLETADO;Mayo;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU21015 SISTEMA INSTRUMENTADO DE SEGURIDAD;SISTEMA INSTRUMENTADO DE  SEGURIDAD (SIS).url;COMPLETADO;Junio;0,67%;0,67%
GOR;Rubiales;Proyecto EDP;ECU19037_NORMALIZACION RETIE CLUSTER RUBIALES;ECU19037_NORMALIZACION RETIE CLUSTER RUBIALES;SIN INICIAR;Julio;0,67%;
GOR;Cao Sur;Proyectos Continuidad Operativa;18. IP-0268 Aislamiento trmico y Tanque Gun Barrel;18. IP-0268 Aislamiento trmico y Tanque Gun Barrel.1;SIN INICIAR;Febrero;0,67%;
GOR;Cao Sur;Proyectos Continuidad Operativa;19. IP-0294 CO Repotenciacin Sistema de Aire Mito 1 Cao Sur;19. IP-0294 CO Repotenciacin Sistema de Aire Mito 1 Cao Sur;SIN INICIAR;Marzo;0,67%;
GOR;Cao Sur;Proyectos Continuidad Operativa;34. IP-0401 CO Sistema contraincendio Mito 1 Cao Sur;34. IP-0401 CO Sistema contraincendio Mito 1 Cao Sur;SIN INICIAR;Abril;0,67%;
GOR;Cao Sur;Proyectos Continuidad Operativa;45. IP-0601 PROYECTO CAMBIO SISTEMA DE BOMBEO MITO1 A EP1 CSE;45. IP-0601 PROYECTO CAMBIO SISTEMA DE BOMBEO MITO1 A EP1 CSE;SIN INICIAR;Mayo;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;16. IP-0253 Proyecto alarmas sonoras en Facilidades;16. IP-0253 Proyecto alarmas sonoras en Facilidades;SIN INICIAR;Junio;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;20. IP-0287 Cambio Bombas Desnate CPF1 CPF2 RUB;20. IP-0287 Cambio Bombas Desnate CPF1 CPF2 RUB;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;22. IP-0309 CO Instalacin medidores de caudal RUB;22. IP-0309 CO Instalacin medidores de caudal RUB;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;23. IP-0373 Centro de acopio de residuos aceitosos Rubiales;23. IP-0373 Centro de acopio de residuos aceitosos Rubiales;SIN INICIAR;Julio;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;24. IP-0291 Selectividad Operacional de Fluidos CPFS;24. IP-0291 Selectividad Operacional de Fluidos CPFS;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;25. IP-0184 Sistema de deteccion de alarma para CCMs;25. IP-0184 Sistema de deteccion de alarma para CCMs;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;26. IP-0289 CO Redundancia y autonoma UPSs en CPFS;26. IP-0289 CO Redundancia y autonoma UPSs en CPFS;SIN INICIAR;Agosto;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;27. IP-0254 Indep sistema aguas lluvias y aceitosas CPFs;27. IP-0254 Indep sistema aguas lluvias y aceitosas CPFs;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;28. IP-0296 Habilitar lazos de control bombas transf a PAD2 RUB;28. IP-0296 Habilitar lazos de control bombas transf a PAD2 RUB;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;29. PDTE CO Instalacin Sistema Aire Acondicionado CCM CPF1 Rubiales;29. PDTE CO Instalacin Sistema Aire Acondicionado CCM CPF1 Rubiales;SIN INICIAR;Septiembre;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;30. IP-0293 Proyecto Normalizacin Sistemas Aire Comprimido CPFs Rubiales;30. IP-0293 Proyecto Normalizacin Sistemas Aire Comprimido CPFs Rubiales;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;33. IP-0365 CO Normalizacin Laboratorios CPFs Rubiales;33. IP-0365 CO Normalizacin Laboratorios CPFs Rubiales;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;36. IP-0400 CO Proyecto Adecuacin Troncal 8;36. IP-0400 CO Proyecto Adecuacin Troncal 8;SIN INICIAR;Octubre;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;37. IP-0406 Confiabilidad Sis bombeo Piscina API CPF2;37. IP-0406 Confiabilidad Sis bombeo Piscina API CPF2;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;41. IP-0599 Proyecto Instalacin Variador Piscina 824 F CPF1;41. IP-0599 Proyecto Instalacin Variador Piscina 824 F CPF1;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;9. IP-1248 MD-1022117-MM piscina 822 Rubiales;9. IP-1248 MD-1022117-MM piscina 822 Rubiales;SIN INICIAR;Noviembre;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;02. IP-0290 OPT PROYECTO CAMBIO DE TECNOLOGIA DE BOMBEO CPF1 RUBIALES;02. IP-0290 OPT PROYECTO CAMBIO DE TECNOLOGIA DE BOMBEO CPF1 RUBIALES;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;04. IP-0408 MD-1020683 PROYECTO NORMALIZACIN SISTEMA DE INYECCIN PAD-8 RUBIALES;04. IP-0408 MD-1020683 PROYECTO NORMALIZACIN SISTEMA DE INYECCIN PAD-8 RUBIALES;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;Proyectos Continuidad Operativa;4. IP-1008, IP-1009 - Rearme Automtico TBTCCP Cluster Infill;4. IP-1008, IP-1009 - Rearme Automtico TBTCCP Cluster Infill;SIN INICIAR;Diciembre;0,67%;
GOR;Rubiales;MOCs;Habilitar TK-3 de la EDS como TK de Almacenamiento de Gasolina;POE-CC-92;SIN INICIAR;Abril;0,67%;
GOR;Cao Sur;MOCs;Suministro de agua para paquete de qumica proyecto Inline;MOC-447;SIN INICIAR;Mayo;0,67%;
GOR;Cao Sur;MOCs;Aseguramiento operacional Instalacin bomba adicional crudo EP-1105-5 tanque cabeza;MOC-333;SIN INICIAR;Junio;0,67%;
GOR;Cao Sur;MOCs;Conexin de venteos scrubber cross flow sistemas STAP a sistema de aguas aceitosas (Estacin Centauros);MOC-52;SIN INICIAR;Julio;0,67%;
GOR;Cao Sur;MOCs;Desnate de agua de proceso en tanque ETK 1241;PCU-CC-7;SIN INICIAR;Agosto;0,67%;
GOR;Cao Sur;MOCs;Retiro de Choque en cabeza de pozos Clster Fauno 2.;MOC-171;SIN INICIAR;Septiembre;0,67%;
GOR;Cao Sur;MOCs;Reactivacion Inyeccin en Mito 2 40 KBWIPD;MOC-306;SIN INICIAR;Octubre;0,67%;
GOR;Cao Sur;MOCs;Interconexiones Mecnicas para prueba tecnolgica Unidades Smart Fluid Separator en Mito 1;MOC-459;SIN INICIAR;Noviembre;0,67%;
GOR;Cao Sur;MOCs;Ampliacin del almacenamiento y distribucin de combustible Fuel Oil #4 en las estaciones Mito 1 y Centauros del Activo Cao Sur.;MOC-376;SIN INICIAR;Diciembre;0,67%;`;

export function cleanRawString(str: string): string {
  if (!str) return "";
  return str
    .replace(/\uFFFD/g, "")
    .replace(/Cao Sur/g, "Caño Sur")
    .replace(/Cao/g, "Caño")
    .replace(/Cao Sur/g, "Caño Sur")
    .replace(/Cao/g, "Caño")
    .replace(/rea/g, "Área")
    .replace(/rea/g, "Área")
    .replace(/MDULO/g, "MÓDULO")
    .replace(/MDULO/g, "MÓDULO")
    .replace(/Mdulo/g, "Módulo")
    .replace(/Batera/g, "Batería")
    .replace(/BATERA/g, "BATERÍA")
    .replace(/Batera/g, "Batería")
    .replace(/BATERA/g, "BATERÍA")
    .replace(/Balcn/g, "Balcón")
    .replace(/Balcn/g, "Balcón")
    .replace(/Ceb/g, "Cebú")
    .replace(/Ceb/g, "Cebú")
    .replace(/Cretceos/g, "Cretáceos")
    .replace(/Cretceos/g, "Cretáceos")
    .replace(/Satlite/g, "Satélite")
    .replace(/Satlite/g, "Satélite")
    .replace(/Yaguar/g, "Yaguará")
    .replace(/Yaguar/g, "Yaguará")
    .replace(/Filtracin/g, "Filtración")
    .replace(/Filtracin/g, "Filtración")
    .replace(/LNEA/g, "LÍNEA")
    .replace(/LNEA/g, "LÍNEA")
    .replace(/Lneas/g, "Líneas")
    .replace(/qumica/g, "química")
    .replace(/qumica/g, "química")
    .replace(/Conexin/g, "Conexión")
    .replace(/Conexin/g, "Conexión")
    .replace(/Estacin/g, "Estación")
    .replace(/Estacin/g, "Estación")
    .replace(/Reactivacion/g, "Reactivación")
    .replace(/Reactivacin/g, "Reactivación")
    .replace(/Inyeccin/g, "Inyección")
    .replace(/Inyeccin/g, "Inyección")
    .replace(/Mecnicas/g, "Mecánicas")
    .replace(/Mecnicas/g, "Mecánicas")
    .replace(/tecnolgica/g, "tecnológica")
    .replace(/tecnolgica/g, "tecnológica")
    .replace(/Ampliacin/g, "Ampliación")
    .replace(/Ampliacin/g, "Ampliación")
    .replace(/Normalizacin/g, "Normalización")
    .replace(/Normalizacin/g, "Normalización")
    .replace(/autonoma/g, "autonomía")
    .replace(/autonoma/g, "autonomía")
    .replace(/Adecuacin/g, "Adecuación")
    .replace(/Adecuacin/g, "Adecuación")
    .replace(/Instalacin/g, "Instalación")
    .replace(/Instalacin/g, "Instalación")
    .replace(/trmico/g, "térmico")
    .replace(/trmico/g, "térmico")
    .replace(/Repotenciacin/g, "Repotenciación")
    .replace(/Repotenciacin/g, "Repotenciación")
    .replace(/Automtico/g, "Automático")
    .replace(/Automtico/g, "Automático")
    .replace(/CLASIFICACIN/g, "CLASIFICACIÓN")
    .replace(/CLASIFICACIN/g, "CLASIFICACIÓN");
}

export function parseCSVPlan(csvText: string): Task[] {
  const lines = csvText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];
  
  const headerLine = lines[0];
  const sep = headerLine.includes(";") ? ";" : ",";
  const headers = headerLine.split(sep).map(h => h.trim().toLowerCase());
  const hasGerencia = headers[0].includes("gerencia") || headers.includes("gerencia");
  
  const tasks: Task[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cells = rawLine.split(sep).map(c => c.replace(/^"|"$/g, "").trim());
    
    if (cells.length >= 4) {
      const id = `${i}-${Date.now()}`;
      let campoRaw = "";
      let areaRaw = "";
      let proyectoRaw = "";
      let paqueteRaw = "";
      let estadoRaw = "";
      let mesRaw = "";
      let pesoRaw = "";
      
      if (hasGerencia) {
        campoRaw = cells[1] || "Caño Sur";
        areaRaw = cells[2] || "Proyecto EDP";
        proyectoRaw = cells[3] || "";
        paqueteRaw = cells[4] || "";
        estadoRaw = cells[5] || "SIN INICIAR";
        mesRaw = cells[6] || "Abril";
        pesoRaw = cells[7] || "0.51%";
      } else {
        campoRaw = cells[0] || "Caño Sur";
        areaRaw = cells[1] || "Proyecto EDP";
        proyectoRaw = cells[2] || "";
        paqueteRaw = cells[3] || "";
        estadoRaw = cells[4] || "SIN INICIAR";
        mesRaw = cells[5] || "Abril";
        pesoRaw = cells[6] || "0.51%";
      }
      
      const campo = cleanRawString(campoRaw);
      const area = cleanRawString(areaRaw);
      const proyecto = cleanRawString(proyectoRaw);
      const paquete = cleanRawString(paqueteRaw);
      
      const rawEstado = estadoRaw.toUpperCase();
      const estado = (rawEstado === "COMPLETADO" || rawEstado === "COMPLETADA") ? "Completado" : "Sin iniciar";
      const mes = cleanRawString(mesRaw);
      
      let pesoVal = 0.51;
      if (pesoRaw) {
        const cleanedPeso = pesoRaw.replace(/%/g, "").replace(/,/g, ".").trim();
        const parsed = parseFloat(cleanedPeso);
        if (!isNaN(parsed)) {
          pesoVal = parsed;
        }
      }
      
      const avance = estado === "Completado" ? pesoVal : 0;
      
      tasks.push({
        id,
        campo,
        area,
        proyecto,
        paquete,
        estado,
        mes,
        peso: pesoVal,
        avance
      });
    }
  }
  
  return tasks;
}

export const initialTasks: Task[] = parseCSVPlan(rawDefaultCSV);

export const initialDisciplines: Discipline[] = [
  {
    id: "edp",
    name: "Proyectos EDP",
    status: "Completado",
    comment: "Se completó la revisión preliminar de los P&IDs para el sistema de reinyección. El cronograma avanza con un 5% de holgura y se han alineado los entregables de ingeniería con el contratista principal sin desviaciones.",
    optimizedComment: "• Revisión preliminar de P&IDs completada satisfactoriamente para el sistema de reinyección.\n• Cronograma del proyecto con holgura controlada del 5%.\n• Alineación exitosa de entregables de ingeniería con el contratista principal sin desviaciones operacionales."
  },
  {
    id: "continuidad",
    name: "Proyectos Continuidad Operativa",
    status: "Completado",
    comment: "Se reporta un atraso de dos semanas en la llegada de repuestos para las turbobombas de Castilla 2. Riesgo inminente de parada no programada si no se prioriza la compra. Se requiere apoyo gerencial para destrabar logística.",
    optimizedComment: "• Retraso logístico de 14 días en el suministro de componentes críticos de repuesto para turbobombas de Castilla 2.\n• Identificación preventiva de riesgo de indisponibilidad operativa no programada.\n• Se requiere escalamiento de compras y soporte logístico inmediato para mitigar el impacto."
  },
  {
    id: "mocs",
    name: "MOCs",
    status: "Completado",
    comment: "Se registraron 4 nuevos controles de cambio técnicos en la plataforma. Todos se encuentran en revisión de seguridad previa. Se observa una mejora del 15% en el tiempo de cierre de acciones de pre-arranque.",
    optimizedComment: "• Registro e inicio de análisis de seguridad para 4 nuevos controles de cambio técnicos (MOC).\n• Optimización del 15% en los tiempos de respuesta para el cierre de acciones preventivas pre-arranque.\n• Cumplimiento estricto del flujo de revisión técnica estipulado."
  },
  {
    id: "sharepoint",
    name: "Gestión Herramienta de Solución Logistica Operativa (SharePoint)",
    status: "Completado",
    comment: "Falta actualizar el registro de las lecciones aprendidas del incidente del trimestre pasado. La plataforma reportó problemas de acceso para usuarios de campo durante la semana pasada.",
    optimizedComment: "• Pendiente consolidación y carga de lecciones aprendidas sobre el evento operacional del trimestre anterior.\n• Reporte de intermitencias técnicas en el acceso de usuarios de campo a la plataforma SharePoint.\n• Enlace activo con TI para estabilización del servicio y regularización de accesos."
  },
  {
    id: "revision",
    name: "Datos técnicos relevantes - Revisión de ITP",
    status: "Completado",
    comment: "Se recopilaron los indicadores HSE del mes. Se están comparando las metas corporativas con el desempeño real de la estación de bombeo GOR.",
    optimizedComment: "• Consolidación final de indicadores clave de desempeño (KPI) HSE correspondientes al mes actual.\n• Análisis comparativo en curso entre las metas del Plan de Negocio Corporativo y el desempeño real en GOR.\n• Monitoreo enfocado en la mejora continua de la confiabilidad operacional."
  },
  {
    id: "ia_itp",
    name: "Implementación de recursos tecnológicos potenciados con IA para ITP",
    status: "Completado",
    comment: "Se inició la fase de evaluación para la integración de herramientas de IA generativa y visión artificial en los procesos de inspección técnica de ITP.",
    optimizedComment: "• Inicio formal de la fase de diagnóstico tecnológico para la integración de Inteligencia Artificial Generativa e inspección asistida por visión en ITP.\n• Definición de casos de uso prioritarios con foco en confiabilidad y análisis preventivo de integridad."
  },
];

export const initialTeam: TeamMember[] = [
  { id: "1", role: "Principal GOR", name: "Laura Catalina Villabona Diaz" },
  { id: "2", role: "Suplente GOR", name: "Brillyt Costanza Lozano Chivatá" },
  { id: "3", role: "Principal Andina Oriente", name: "Camilo Ernesto Gallego Gutierrez" },
  { id: "4", role: "Suplente Andina Oriente", name: "Carlos Fernando Pérez Castillo" },
];

export const initialInsights: SmartInsights = {
  hitos: [
    "Avance significativo detectado en Proyectos EDP con cumplimiento de cronograma.",
    "Consolidación de reportes en MOCs muestra mejora en tiempos de respuesta.",
  ],
  alertas: [
    "Riesgo de retraso en Continuidad Operativa por falta de insumos críticos.",
    "Inconsistencia detectada en la carga de datos de la Gestión Herramienta de Solución Logistica Operativa ( SharePoint).",
  ],
};

export function getInitialDisciplinesForContext(gerencia: "GOR" | "GPA", mes: string, ano: string): Discipline[] {
  return initialDisciplines.map(d => {
    let comment = d.comment;
    // Replace GOR with GPA if needed
    if (gerencia === "GPA") {
      comment = comment.replace(/GOR/g, "GPA").replace(/Caño Sur/g, "Putumayo").replace(/Rubiales/g, "Huila");
    } else {
      comment = comment.replace(/GPA/g, "GOR").replace(/Putumayo/g, "Caño Sur").replace(/Huila/g, "Rubiales");
    }
    // Replace month names (Enero - Diciembre) with the active month
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    months.forEach(m => {
      const regex = new RegExp(`\\b${m}\\b`, "gi");
      comment = comment.replace(regex, mes);
    });
    // Replace year references (like 2026) with the active year
    comment = comment.replace(/\b202\d\b/g, ano);

    // Also customize optimizedComment
    let optimizedComment = d.optimizedComment || "";
    if (optimizedComment) {
      if (gerencia === "GPA") {
        optimizedComment = optimizedComment.replace(/GOR/g, "GPA").replace(/Caño Sur/g, "Putumayo").replace(/Rubiales/g, "Huila");
      } else {
        optimizedComment = optimizedComment.replace(/GPA/g, "GOR").replace(/Putumayo/g, "Caño Sur").replace(/Huila/g, "Rubiales");
      }
      months.forEach(m => {
        const regex = new RegExp(`\\b${m}\\b`, "gi");
        optimizedComment = optimizedComment.replace(regex, mes);
      });
      optimizedComment = optimizedComment.replace(/\b202\d\b/g, ano);
    }

    return {
      ...d,
      comment,
      optimizedComment,
      status: comment.trim().length > 0 ? "Completado" : "Pendiente"
    };
  });
}

export function getInitialTeamForContext(gerencia: "GOR" | "GPA"): TeamMember[] {
  if (gerencia === "GPA") {
    return [
      { id: "1", role: "Principal GPA", name: "Juan Carlos Mendoza" },
      { id: "2", role: "Suplente GPA", name: "María Alejandra Rojas" },
      { id: "3", role: "Principal Andina Oriente", name: "Camilo Ernesto Gallego Gutierrez" },
      { id: "4", role: "Suplente Andina Oriente", name: "Carlos Fernando Pérez Castillo" },
    ];
  } else {
    return [
      { id: "1", role: "Principal GOR", name: "Laura Catalina Villabona Diaz" },
      { id: "2", role: "Suplente GOR", name: "Brillyt Costanza Lozano Chivatá" },
      { id: "3", role: "Principal Andina Oriente", name: "Camilo Ernesto Gallego Gutierrez" },
      { id: "4", role: "Suplente Andina Oriente", name: "Carlos Fernando Pérez Castillo" },
    ];
  }
}

export function getInitialInsightsForContext(gerencia: "GOR" | "GPA", mes: string, ano: string): SmartInsights {
  return {
    hitos: [
      `Avance significativo detectado en Proyectos EDP con cumplimiento de cronograma en la regional de ${gerencia}.`,
      `Consolidación de reportes en MOCs de ${gerencia} muestra mejora en tiempos de respuesta para ${mes} ${ano}.`,
    ],
    alertas: [
      `Riesgo de retraso en Continuidad Operativa de ${gerencia} por falta de insumos críticos.`,
      `Inconsistencia detectada en la carga de datos de la Gestión Herramienta de Solución Logística Operativa (SharePoint) de ${gerencia}.`,
    ],
  };
}
