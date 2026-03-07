import type {
  PriceAlert,
  CreateAlertData,
  AlertSummary,
} from '../types/portfolio.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/v1';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const handleResponse = async (response: Response): Promise<any> => {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Request failed');
  }

  return result;
};

export const alertService = {

  // Get all alerts for user
  async getAlerts(): Promise<PriceAlert[]> {
    const response = await fetch(`${API_URL}/alerts`, {
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data.alerts;
  },

  // Get active alerts only
  async getActiveAlerts(): Promise<PriceAlert[]> {
    const response = await fetch(`${API_URL}/alerts/active`, {
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data.alerts;
  },

  // Get triggered alerts (notification history)
  async getTriggeredAlerts(limit: number = 10): Promise<PriceAlert[]> {
    const response = await fetch(`${API_URL}/alerts/triggered?limit=${limit}`, {
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data.alerts;
  },

  // Get alerts summary (counts)
  async getAlertsSummary(): Promise<AlertSummary> {
    const response = await fetch(`${API_URL}/alerts/summary`, {
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data.summary;
  },

  // Get single alert
  async getAlert(alertId: number): Promise<PriceAlert> {
    const response = await fetch(`${API_URL}/alerts/${alertId}`, {
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data.alert;
  },

  // Create new alert
  async createAlert(data: CreateAlertData): Promise<PriceAlert> {
    const response = await fetch(`${API_URL}/alerts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse(response);
    return result.data.alert;
  },

  // Update alert
  async updateAlert(
    alertId: number,
    data: { target_value?: number; is_active?: boolean }
  ): Promise<PriceAlert> {
    const response = await fetch(`${API_URL}/alerts/${alertId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await handleResponse(response);
    return result.data.alert;
  },

  // Delete alert
  async deleteAlert(alertId: number): Promise<void> {
    const response = await fetch(`${API_URL}/alerts/${alertId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    await handleResponse(response);
  },

  // Reset a triggered alert (make active again)
  async resetAlert(alertId: number): Promise<PriceAlert> {
    const response = await fetch(`${API_URL}/alerts/${alertId}/reset`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data.alert;
  },

  // Activate a paused alert
  async activateAlert(alertId: number): Promise<PriceAlert> {
    const response = await fetch(`${API_URL}/alerts/${alertId}/activate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data.alert;
  },

  // Deactivate (pause) an alert
  async deactivateAlert(alertId: number): Promise<PriceAlert> {
    const response = await fetch(`${API_URL}/alerts/${alertId}/deactivate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data.alert;
  },

  // Test email configuration
  async testEmail(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/alerts/test-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email }),
    });

    const result = await handleResponse(response);
    return { success: result.success, message: result.message };
  },

  // Manually trigger alert check
  async checkAllAlerts(): Promise<{
    totalChecked: number;
    triggered: number;
    emailsSent: number;
  }> {
    const response = await fetch(`${API_URL}/alerts/check`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data.summary;
  },

  // Get human-readable alert type label
  getAlertTypeLabel(alertType: string): string {
    switch (alertType) {
      case 'price_above':
        return 'Price Above';
      case 'price_below':
        return 'Price Below';
      case 'percent_up':
        return 'Price Up By';
      case 'percent_down':
        return 'Price Down By';
      default:
        return alertType;
    }
  },

  // Get alert type icon
  getAlertTypeIcon(alertType: string): string {
    switch (alertType) {
      case 'price_above':
        return '📈';
      case 'price_below':
        return '📉';
      case 'percent_up':
        return '🔺';
      case 'percent_down':
        return '🔻';
      default:
        return '🔔';
    }
  },

  // Format target value for display
  formatTargetValue(alertType: string, targetValue: number): string {
    if (alertType === 'percent_up' || alertType === 'percent_down') {
      return `${targetValue}%`;
    }
    return `$${targetValue.toFixed(2)}`;
  },

  // Get alert status label
  getStatusLabel(alert: PriceAlert): string {
    if (alert.is_triggered) {
      return 'Triggered';
    }
    if (!alert.is_active) {
      return 'Paused';
    }
    return 'Active';
  },

  // Get alert status color
  getStatusColor(alert: PriceAlert): string {
    if (alert.is_triggered) {
      return 'warning'; // orange/yellow
    }
    if (!alert.is_active) {
      return 'neutral'; // gray
    }
    return 'success'; // green
  },
};

export default alertService;