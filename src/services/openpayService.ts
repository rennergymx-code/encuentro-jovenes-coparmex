import { supabase } from './supabaseClient';

// Declaración para TypeScript del objeto global de OpenPay cargado vía script
declare global {
  interface Window {
    OpenPay: any;
  }
}

const MERCHANT_ID = import.meta.env.VITE_OPENPAY_MERCHANT_ID;
const PUBLIC_KEY = import.meta.env.VITE_OPENPAY_PUBLIC_KEY;
const IS_SANDBOX = true; // Forzado a true por ahora

class OpenPayService {
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined' && window.OpenPay && !this.initialized) {
      window.OpenPay.setId(MERCHANT_ID);
      window.OpenPay.setApiKey(PUBLIC_KEY);
      window.OpenPay.setSandboxMode(IS_SANDBOX);
      this.initialized = true;
      console.log('✅ OpenPay Service Initialized (Sandbox)');
    }
  }

  /**
   * Genera el Device Session ID necesario para el sistema anti-fraude de BBVA.
   * Este ID debe enviarse tanto en la tokenización como en el cargo final.
   */
  public async getDeviceSessionId(formId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.OpenPay) {
        reject(new Error('OpenPay library not loaded'));
        return;
      }
      
      const deviceSessionId = window.OpenPay.deviceData.setup(formId);
      if (deviceSessionId) {
        resolve(deviceSessionId);
      } else {
        reject(new Error('Failed to generate Device Session ID'));
      }
    });
  }

  /**
   * Convierte los datos de la tarjeta en un token seguro (token_id).
   * Los datos reales nunca tocan nuestro servidor.
   */
  public async createToken(cardData: {
    holder_name: string;
    card_number: string;
    expiration_month: string;
    expiration_year: string;
    cvv2: string;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      window.OpenPay.token.create(
        cardData,
        (response: any) => resolve(response.data.id),
        (error: any) => {
          console.error('❌ OpenPay Token Error:', error);
          reject(error);
        }
      );
    });
  }
}

export const openPayService = new OpenPayService();
