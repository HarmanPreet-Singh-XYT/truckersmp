// TruckersMP API Client
const API_BASE = process.env.API_BASE || 'http://localhost:8080';

export class TruckersAPI {
  private static async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Player endpoints
  static async getPlayer(id: number) {
    return this.request<{ response: import('../types/api').Player }>(`/player/${id}`);
  }

  static async getPlayerBans(id: number) {
    return this.request<{ response: import('../types/api').Ban[] }>(`/bans/${id}`);
  }

  static async getPlayerEvents(id: number) {
    return this.request<{ response: import('../types/api').Event[] }>(`/events/user/${id}`);
  }

  // Server endpoints
  static async getServers() {
    return this.request<{ response: import('../types/api').Server[] }>('/servers');
  }

  static async getGameTime() {
    return this.request<import('../types/api').GameTime>('/game_time');
  }

  // Event endpoints
  static async getEvents() {
    return this.request<{
      response: {
        featured: import('../types/api').Event[];
        today: import('../types/api').Event[];
        // now: import('../types/api').Event[];
        upcoming: import('../types/api').Event[];
      }
    }>('/events');
  }

  static async getEvent(id: number) {
    return this.request<{ response: import('../types/api').Event }>(`/events/${id}`);
  }

  // VTC endpoints
  static async getVTCs() {
    return this.request<{
      response: import('../types/web').APICompanyIndex
    }>('/vtc');
  }

  static async getVTC(id: number) {
    return this.request<{ response: import('../types/api').VTC }>(`/vtc/${id}`);
  }

  static async getVTCNews(id: number) {
    return this.request<{ response: { news: import('../types/api').VTCNews[] } }>(`/vtc/${id}/news`);
  }

  static async getVTCNewsItem(id: number, newsId: number) {
    return this.request<{ response: import('../types/api').VTCNews }>(`/vtc/${id}/news/${newsId}`);
  }

  static async getVTCMembers(id: number) {
    return this.request<{ response: { members: import('../types/api').VTCMember[] } }>(`/vtc/${id}/members`);
  }

  static async getVTCMember(id: number, memberId: number) {
    return this.request<{ response: import('../types/api').VTCMember }>(`/vtc/${id}/member/${memberId}`);
  }

  static async getVTCEvents(id: number) {
    return this.request<{ response: import('../types/api').Event[] }>(`/vtc/${id}/events`);
  }

  static async getVTCEvent(id: number, eventId: number) {
    return this.request<{ response: import('../types/api').Event }>(`/vtc/${id}/events/${eventId}`);
  }

  // General endpoints
  static async getVersion() {
    return this.request<import('../types/api').Version>('/version');
  }

  static async getRules() {
    return this.request<import('../types/api').Rules>('/rules');
  }
}