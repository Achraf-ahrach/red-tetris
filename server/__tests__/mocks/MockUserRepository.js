// Mock UserRepository for testing
export class MockUserRepository {
  constructor() {
    this.users = [];
    this.nextId = 1;
  }

  async findById(id) {
    return this.users.find((user) => user.id === id) || null;
  }

  async findByEmail(email) {
    return this.users.find((user) => user.email === email) || null;
  }

  async findByUsername(username) {
    return this.users.find((user) => user.username === username) || null;
  }

  async findByFortyTwoId(fortyTwoId) {
    return this.users.find((user) => user.fortyTwoId === fortyTwoId) || null;
  }

  async create(userData) {
    const user = {
      id: this.nextId++,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async update(id, userData) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date(),
    };
    return this.users[userIndex];
  }

  async delete(id) {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) return null;

    return this.users.splice(userIndex, 1)[0];
  }

  async findAll() {
    return [...this.users];
  }

  // Test helper methods
  clear() {
    this.users = [];
    this.nextId = 1;
  }

  getUsers() {
    return [...this.users];
  }
}
