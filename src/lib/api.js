const GAS_URL = "https://script.google.com/macros/s/AKfycbz3YiuQyT_S6-xUzD00B5l1PUQYIAmeCu5QJGqvbJz_FJ8w2Uq2DSp7LpUOMuRNv1_Qnw/exec";

export async function callGasApi(action, payload = {}) {
  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action,
        payload
      })
    });

    if (!response.ok) {
      throw new Error(`Ralat pelayan: ${response.status}`);
    }

    const result = await response.json();

    if (!result || typeof result !== 'object') {
      return {
        success: false,
        message: 'Response GAS tidak sah.'
      };
    }

    return result;
  } catch (error) {
    console.error(`API Error (${action}):`, error);

    return {
      success: false,
      message: error.message || 'Ralat sambungan. Sila cuba lagi.'
    };
  }
}