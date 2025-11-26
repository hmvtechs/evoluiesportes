import axios, { AxiosError } from 'axios';

/**
 * Serviço para integração com a API do apicpf.com
 * Documentação: https://www.apicpf.com/docs
 */

interface CPFAPIResponse {
    code?: number;
    status?: number;
    data?: {
        cpf?: string;
        nome?: string;
        nascimento?: string;
        data_nascimento?: string;
        situacao?: string;
        genero?: string;
    };
    // Fallback for flat structure if API changes back
    cpf?: string;
    nome?: string;
    nascimento?: string;
    situacao?: string;
    mensagem?: string;
    valido?: boolean;
}

interface ValidationResult {
    valid: boolean;
    status: string;
    name?: string;
    birthDate?: string;
    gender?: string;
    situation?: string;
    error?: string;
}

class CPFValidationService {
    private readonly apiKey: string;
    private readonly baseURL: string = 'https://apicpf.com/api';

    constructor() {
        this.apiKey = process.env.CPF_API_KEY || '';

        if (!this.apiKey) {
            console.warn('⚠️ CPF_API_KEY not configured. CPF validation will not work.');
        } else {
            console.log('✅ CPF Validation Service initialized');
        }
    }

    /**
     * Validate CPF using apicpf.com API
     * @param cpf - CPF to validate (digits only)
     * @returns Validation result
     */
    async validateCPF(cpf: string): Promise<ValidationResult> {
        const cleanCpf = cpf.replace(/\D/g, '');

        if (cleanCpf.length !== 11) {
            return {
                valid: false,
                status: 'INVALID',
                error: 'CPF deve ter 11 dígitos',
            };
        }

        if (!this.apiKey) {
            return {
                valid: false,
                status: 'ERROR',
                error: 'API Key não configurada',
            };
        }

        try {
            console.log(`🔍 Validando CPF: ${cleanCpf.substring(0, 3)}.***.***-${cleanCpf.substring(9)}`);

            const response = await axios.get<CPFAPIResponse>(
                `${this.baseURL}/consulta`,
                {
                    params: { cpf: cleanCpf },
                    headers: {
                        'X-API-KEY': this.apiKey,
                    },
                    timeout: 10000, // 10 seconds timeout
                }
            );

            const responseData = response.data as any;
            console.log('📦 Resposta da API:', JSON.stringify(responseData, null, 2));

            // Normalize data from different possible structures
            const data = responseData.data || responseData;
            const nome = data.nome;
            const situacao = data.situacao;
            const valido = responseData.valido;
            const nascimento = data.nascimento || data.data_nascimento;
            const genero = data.genero;

            // Check if CPF is valid based on API response
            // Se retornar nome, consideramos que o CPF existe e é válido para cadastro
            if (nome || valido === true || situacao?.toLowerCase().includes('regular')) {
                console.log(`✅ CPF válido/identificado: ${nome || 'Nome não disponível'}`);

                return {
                    valid: true,
                    status: situacao || 'REGULAR',
                    name: nome,
                    birthDate: nascimento,
                    gender: genero,
                    situation: situacao || 'CPF identificado na base',
                };
            } else {
                console.log(`❌ CPF irregular: ${responseData.mensagem || situacao}`);

                return {
                    valid: false,
                    status: situacao || 'IRREGULAR',
                    error: responseData.mensagem || 'CPF não está regular',
                    situation: situacao,
                };
            }

        } catch (error) {
            console.error('❌ Error validating CPF:', error);

            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;

                if (axiosError.response?.status === 401) {
                    return {
                        valid: false,
                        status: 'ERROR',
                        error: 'Chave de API inválida',
                    };
                }

                if (axiosError.response?.status === 429) {
                    return {
                        valid: false,
                        status: 'RATE_LIMIT',
                        error: 'Limite de requisições excedido. Tente novamente mais tarde.',
                    };
                }

                if (axiosError.response?.status === 404) {
                    return {
                        valid: false,
                        status: 'NOT_FOUND',
                        error: 'CPF não encontrado',
                    };
                }

                if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
                    return {
                        valid: false,
                        status: 'TIMEOUT',
                        error: 'Timeout ao consultar API',
                    };
                }
            }

            return {
                valid: false,
                status: 'ERROR',
                error: 'Erro ao validar CPF. Tente novamente.',
            };
        }
    }

    /**
     * Check if service is configured
     */
    isConfigured(): boolean {
        return !!this.apiKey;
    }
}

// Export singleton instance
export const cpfValidationService = new CPFValidationService();
