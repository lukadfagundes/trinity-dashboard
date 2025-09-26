/**
 * WebSocket Service for Real-time GitHub Updates
 * Handles live data streaming and webhook events
 */

export class WebSocketService {
  constructor(url = null) {
    this.url = url || this.getWebSocketUrl();
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.heartbeatInterval = null;
    this.lastActivity = Date.now();
  }

  getWebSocketUrl() {
    // Use environment variable or default to local development
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    return wsUrl;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.lastActivity = Date.now();
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          
          this.isConnected = false;
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });

          // Attempt to reconnect
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'github_push':
          this.handleGitHubPush(message.payload);
          break;

        case 'workflow_run':
          this.handleWorkflowRun(message.payload);
          break;

        case 'pull_request':
          this.handlePullRequest(message.payload);
          break;

        case 'check_suite':
          this.handleCheckSuite(message.payload);
          break;

        case 'deployment':
          this.handleDeployment(message.payload);
          break;

        case 'metrics_update':
          this.handleMetricsUpdate(message.payload);
          break;

        case 'pong':
          // Heartbeat response
          break;

        default:
          this.emit('message', message);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error, data);
    }
  }

  handleGitHubPush(payload) {
    this.emit('github:push', {
      repository: payload.repository.full_name,
      branch: payload.ref.replace('refs/heads/', ''),
      commits: payload.commits,
      pusher: payload.pusher.name,
      timestamp: payload.head_commit.timestamp
    });
  }

  handleWorkflowRun(payload) {
    this.emit('workflow:run', {
      repository: payload.repository.full_name,
      workflow: payload.workflow.name,
      status: payload.workflow_run.status,
      conclusion: payload.workflow_run.conclusion,
      branch: payload.workflow_run.head_branch,
      runId: payload.workflow_run.id,
      runNumber: payload.workflow_run.run_number,
      actor: payload.workflow_run.actor.login,
      timestamp: payload.workflow_run.created_at
    });
  }

  handlePullRequest(payload) {
    this.emit('pr:update', {
      action: payload.action,
      number: payload.pull_request.number,
      title: payload.pull_request.title,
      state: payload.pull_request.state,
      branch: payload.pull_request.head.ref,
      baseBranch: payload.pull_request.base.ref,
      author: payload.pull_request.user.login,
      repository: payload.repository.full_name,
      timestamp: payload.pull_request.updated_at
    });
  }

  handleCheckSuite(payload) {
    this.emit('check:suite', {
      repository: payload.repository.full_name,
      status: payload.check_suite.status,
      conclusion: payload.check_suite.conclusion,
      branch: payload.check_suite.head_branch,
      checkRuns: payload.check_suite.check_runs_count,
      timestamp: payload.check_suite.updated_at
    });
  }

  handleDeployment(payload) {
    this.emit('deployment', {
      repository: payload.repository.full_name,
      environment: payload.deployment.environment,
      status: payload.deployment_status?.state,
      ref: payload.deployment.ref,
      creator: payload.deployment.creator.login,
      timestamp: payload.deployment.created_at
    });
  }

  handleMetricsUpdate(payload) {
    this.emit('metrics:update', {
      repository: payload.repository,
      branch: payload.branch,
      metrics: {
        coverage: payload.coverage,
        tests: payload.tests,
        security: payload.security,
        health: payload.health,
        build: payload.build
      },
      timestamp: payload.timestamp
    });
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping', timestamp: Date.now() });

        // Check for connection timeout (no activity for 60 seconds)
        if (Date.now() - this.lastActivity > 60000) {
          console.warn('WebSocket connection seems inactive, reconnecting...');
          this.reconnect();
        }
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    `);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  reconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.connect();
  }

  send(data) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    console.warn('WebSocket is not connected, message not sent:', data);
    return false;
  }

  subscribe(repository, events = ['push', 'workflow_run', 'pull_request']) {
    return this.send({
      type: 'subscribe',
      repository,
      events
    });
  }

  unsubscribe(repository) {
    return this.send({
      type: 'unsubscribe',
      repository
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for event '${event}':`, error);
        }
      });
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }
}

// Singleton instance
let wsInstance = null;

export function getWebSocketService() {
  if (!wsInstance) {
    wsInstance = new WebSocketService();
  }
  return wsInstance;
}

export default WebSocketService;