/**
 * CPF Validation Service
 * Integrates with apicpf.com API with authentication
 */

import axios from 'axios';

export interface CPFValidationResult {
    valid: boolean;
    status: string;
    name?: string;
    birthDate?: string;
    gender?: string;
    situation?: string;
    error?: string;
}

class CPFValidationService {
    private readonly API_URL = 'https://apicpf.com/api/consulta';
    private readonly API_KEY = '46feecba25cda0ca77b2205de6237fd7cb3428cf60b96adda5828a30887fe521';

    /**
     * Validates a CPF using apicpf.com authenticated API
     * @param cpf - The CPF to validate
     * @returns Validation result
     */
    async validateCPF(cpf: string): Promise<CPFValidationResult> {
        try {
            // Clean CPF (remove formatting)
            const cleanCpf = cpf.replace(/\D/g, '');

            if (cleanCpf.length !== 11) {
                return {
                    valid: false,
                    status: 'INVALID_FORMAT',
                    error: 'CPF deve conter 11 dígitos'
                };
            }

            console.log(`[CPF Validation] Checking CPF via apicpf.com: ${cleanCpf}`);

            // Call apicpf.com API with authentication
            const response = await axios.get(this.API_URL, {
                params: {
                    cpf: cleanCpf
                },
                headers: {
                    'X-API-KEY': this.API_KEY,
                    'Accept': 'application/json'
                },
                timeout: 15000 // 15 seconds timeout
            });

            const apiResponse = response.data;
            console.log('🔍 Raw API Response:', JSON.stringify(apiResponse, null, 2));

            // Check if CPF is valid based on API response
            // The API returns code 200 and a 'data' object
            if (response.status === 200 && apiResponse.code === 200 && apiResponse.data) {
                const personData = apiResponse.data;
                console.log(`✅ CPF válido via API: ${personData.nome || cleanCpf}`);

                return {
                    valid: true,
                    status: 'OK',
                    name: personData.nome,
                    birthDate: personData.data_nascimento, // API uses data_nascimento
                    gender: personData.genero,             // API uses genero
                    situation: personData.situacao || 'REGULAR'
                };
            } else {
                console.log(`❌ CPF inválido ou irregular via API`);
                return {
                    valid: false,
                    status: 'INVALID',
                    error: apiResponse.message || 'CPF inválido ou irregular'
                };
            }

        } catch (error: any) {
            console.error('❌ Erro ao validar CPF via API:', error.message);

            // Check specific error cases
            if (error.response) {
                console.log('🔍 API Error Response:', JSON.stringify(error.response.data, null, 2));

                if (error.response.status === 404) {
                    console.log('⚠️ CPF não encontrado na base');
                    return {
                        valid: false,
                        status: 'NOT_FOUND',
                        error: 'CPF não encontrado'
                    };
                }
                if (error.response.status === 400) {
                    return {
                        valid: false,
                        status: 'INVALID',
                        error: 'CPF inválido'
                    };
                }
            }

            // If API call fails, fallback to local validation
            console.log('⚠️ Usando validação local como fallback');
            return this.validateCPFLocal(cpf);
        }
    }

    /**
     * Fallback: Local CPF validation using digit verification algorithm
     * @param cpf - The CPF to validate
     * @returns Validation result
     */
    private validateCPFLocal(cpf: string): CPFValidationResult {
        const cleanCpf = cpf.replace(/\D/g, '');

        if (cleanCpf.length !== 11) {
            return {
                valid: false,
                status: 'INVALID_FORMAT',
                error: 'CPF deve conter 11 dígitos'
            };
        }

        // Check for known invalid CPFs (all same digits)
        if (/^(\d)\1{10}$/.test(cleanCpf)) {
            return {
                valid: false,
                status: 'INVALID',
                error: 'CPF inválido'
            };
        }

        // Validate check digits
        const isValid = this.validateCPFDigits(cleanCpf);

        if (isValid) {
            console.log(`✅ CPF válido (algoritmo local): ${cleanCpf}`);
            return {
                valid: true,
                status: 'OK',
                situation: 'REGULAR'
            };
        } else {
            return {
                valid: false,
                status: 'INVALID',
                error: 'CPF inválido (dígitos verificadores incorretos)'
            };
        }
    }

    /**
     * Validates CPF check digits using the official algorithm
     * @param cpf - Clean CPF (11 digits)
     * @returns true if valid
     */
    private validateCPFDigits(cpf: string): boolean {
        // Calculate first check digit
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = sum % 11;
        const digit1 = remainder < 2 ? 0 : 11 - remainder;

        if (parseInt(cpf.charAt(9)) !== digit1) {
            return false;
        }

        // Calculate second check digit
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = sum % 11;
        const digit2 = remainder < 2 ? 0 : 11 - remainder;

        return parseInt(cpf.charAt(10)) === digit2;
    }
}

export const cpfValidationService = new CPFValidationService();

console.log('✅ CPF Validation Service initialized (apicpf.com + local fallback)');
