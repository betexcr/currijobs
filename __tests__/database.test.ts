import { taskService, TASK_CATEGORIES } from '../lib/database';

// Mock the supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'test-task-id',
              title: 'Test Task',
              description: 'Test Description',
              category: 'Cleaning',
              reward: 5000,
              status: 'open',
              user_id: 'test-user-id',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            error: null,
          })),
        })),
      })),
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [
            {
              id: 'test-task-id',
              title: 'Test Task',
              description: 'Test Description',
              category: 'Cleaning',
              reward: 5000,
              status: 'open',
              user_id: 'test-user-id',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
          error: null,
        })),
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'test-task-id',
              title: 'Test Task',
              description: 'Test Description',
              category: 'Cleaning',
              reward: 5000,
              status: 'open',
              user_id: 'test-user-id',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'test-task-id',
                title: 'Test Task',
                description: 'Test Description',
                category: 'Cleaning',
                reward: 5000,
                status: 'completed',
                user_id: 'test-user-id',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
              error: null,
            })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          error: null,
        })),
      })),
    })),
    rpc: jest.fn(() => ({
      data: [
        {
          id: 'test-task-id',
          title: 'Test Task',
          description: 'Test Description',
          category: 'Cleaning',
          reward: 5000,
          status: 'open',
          user_id: 'test-user-id',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          distance: 1.5,
        },
      ],
      error: null,
    })),
  },
}));

describe('Database Service', () => {
  describe('TASK_CATEGORIES', () => {
    it('should contain expected categories', () => {
      expect(TASK_CATEGORIES).toContain('Cleaning');
      expect(TASK_CATEGORIES).toContain('Gardening');
      expect(TASK_CATEGORIES).toContain('Pet Care');
      expect(TASK_CATEGORIES).toContain('Delivery');
      expect(TASK_CATEGORIES).toContain('Moving');
      expect(TASK_CATEGORIES).toContain('Repairs');
      expect(TASK_CATEGORIES).toContain('Tutoring');
      expect(TASK_CATEGORIES).toContain('Technology');
      expect(TASK_CATEGORIES).toContain('Cooking');
      expect(TASK_CATEGORIES).toContain('Other');
    });
  });

  describe('taskService.createTask', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        category: 'Cleaning',
        reward: 5000,
      };

      const result = await taskService.createTask(taskData, 'test-user-id');

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe('Test Task');
      expect(result.data?.category).toBe('Cleaning');
      expect(result.data?.reward).toBe(5000);
    });
  });

  describe('taskService.getAllTasks', () => {
    it('should get all tasks successfully', async () => {
      const result = await taskService.getAllTasks();

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });
  });

  describe('taskService.getTaskById', () => {
    it('should get a task by ID successfully', async () => {
      const result = await taskService.getTaskById('test-task-id');

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('test-task-id');
      expect(result.data?.title).toBe('Test Task');
    });
  });

  describe('taskService.updateTaskStatus', () => {
    it('should update task status successfully', async () => {
      const result = await taskService.updateTaskStatus('test-task-id', 'completed');

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBe('completed');
    });
  });

  describe('taskService.deleteTask', () => {
    it('should delete a task successfully', async () => {
      const result = await taskService.deleteTask('test-task-id');

      expect(result.error).toBeNull();
    });
  });

  describe('taskService.getNearbyTasks', () => {
    it('should get nearby tasks successfully', async () => {
      const result = await taskService.getNearbyTasks(9.9281, -84.0907, 10);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('taskService.calculateDistance', () => {
    it('should calculate distance correctly', () => {
      const distance = taskService.calculateDistance(9.9281, -84.0907, 9.9282, -84.0908);
      
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });
  });
}); 