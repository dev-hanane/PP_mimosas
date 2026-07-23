// Service pour les appels API du chatbot

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const chatbotService = {
  /**
   * Envoie un message au chatbot et reçoit une réponse officielle (FAQ + BDD).
   * @param {string} message - Le message de l'utilisateur
   * @returns {Promise<string>} La réponse du chatbot
   */
  async sendMessage(message) {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error(`503: ${data.error}`);
        }
        throw new Error(data.error || 'Erreur serveur');
      }

      return data.reply || 'Pas de réponse';
    } catch (error) {
      console.error('Erreur chatbot:', error);
      throw error;
    }
  },
};
