class DashboardWebSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectTimeout = null;
    this.pingInterval = null;
    this.isConnected = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.port === '5173' ? '127.0.0.1:8000' : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/dashboard`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('[TraumaGrid WS] Connected to responder hub');
        this.notifyStatus(true);
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        if (event.data === 'pong') return;
        try {
          const parsed = JSON.parse(event.data);
          this.listeners.forEach((callback) => callback(parsed));
        } catch (err) {
          console.warn('[TraumaGrid WS] Parse error:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.notifyStatus(false);
        this.stopPing();
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[TraumaGrid WS] Error:', err);
        this.ws?.close();
      };
    } catch (e) {
      console.warn('[TraumaGrid WS] Initialization failed:', e);
      this.scheduleReconnect();
    }
  }

  startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, 15000);
  }

  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 3000);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    if (!this.isConnected) {
      this.connect();
    }
    return () => this.listeners.delete(callback);
  }

  notifyStatus(status) {
    this.listeners.forEach((callback) => callback({ event: 'CONNECTION_STATUS', connected: status }));
  }

  disconnect() {
    this.stopPing();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const dashboardWs = new DashboardWebSocket();
