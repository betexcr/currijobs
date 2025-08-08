export interface Offer {
  id: string;
  task_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CreateOfferData {
  task_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  amount: number;
  message: string;
}

export const offerService = {
  // Get offers for a task
  async getOffersForTask(taskId: string): Promise<{ data: Offer[] | null; error: any }> {
    // Mock offers data
    const mockOffers: Offer[] = [
      {
        id: 'offer-1',
        task_id: taskId,
        user_id: 'demo@currijobs.com',
        user_email: 'demo@currijobs.com',
        user_name: 'Demo User',
        amount: 22000,
        message: 'I have experience with garage organization and can help you sort through everything efficiently. I can work this weekend.',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'offer-2',
        task_id: taskId,
        user_id: 'maria.garcia@email.com',
        user_email: 'maria.garcia@email.com',
        user_name: 'María García',
        amount: 25000,
        message: 'I am very organized and have helped many people organize their spaces. I can start tomorrow.',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'offer-3',
        task_id: taskId,
        user_id: 'carlos.rodriguez@email.com',
        user_email: 'carlos.rodriguez@email.com',
        user_name: 'Carlos Rodríguez',
        amount: 20000,
        message: 'I have a truck and can help move heavy items. I can work flexible hours.',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    
    return { data: mockOffers, error: null };
  },

  // Create a new offer
  async createOffer(data: CreateOfferData): Promise<{ data: Offer | null; error: any }> {
    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      task_id: data.task_id,
      user_id: data.user_id,
      user_email: data.user_email,
      user_name: data.user_name,
      amount: data.amount,
      message: data.message,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return { data: newOffer, error: null };
  },

  // Accept an offer
  async acceptOffer(offerId: string): Promise<{ data: Offer | null; error: any }> {
    // Mock implementation - in real app this would update the database
    return { data: null, error: null };
  },

  // Reject an offer
  async rejectOffer(offerId: string): Promise<{ data: Offer | null; error: any }> {
    // Mock implementation - in real app this would update the database
    return { data: null, error: null };
  },

  // Get offers by user
  async getOffersByUser(userId: string): Promise<{ data: Offer[] | null; error: any }> {
    const mockUserOffers: Offer[] = [
      {
        id: 'user-offer-1',
        task_id: 'mock-1',
        user_id: userId,
        user_email: 'demo@currijobs.com',
        user_name: 'Demo User',
        amount: 25000,
        message: 'I can help clean your apartment thoroughly. I have experience with deep cleaning.',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'user-offer-2',
        task_id: 'mock-2',
        user_id: userId,
        user_email: 'demo@currijobs.com',
        user_name: 'Demo User',
        amount: 8000,
        message: 'I love dogs and would be happy to walk your golden retriever. I am available in the mornings.',
        status: 'accepted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    
    return { data: mockUserOffers, error: null };
  },
};


